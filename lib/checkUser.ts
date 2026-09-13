import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
import { CLERK_PLAN_IDENTIFIERS, PLANS } from "./constants";
import type { Plan } from "@/types/plans";

const getCurrentPlan = async (userId: string): Promise<Plan> => {
  try {
    const client = await clerkClient();
    const subscription = await client.billing.getUserBillingSubscription(userId);
    const activeItem = subscription.subscriptionItems.find(
      (item) => item.status === "active" && item.plan
    );
    const identifiers = [
      activeItem?.plan?.id,
      activeItem?.plan?.slug,
      activeItem?.plan?.slug ? `user:${activeItem.plan.slug}` : undefined,
    ].filter((identifier): identifier is string => Boolean(identifier));

    if (CLERK_PLAN_IDENTIFIERS.pro.some((plan) => identifiers.includes(plan))) {
      return "pro";
    }
    if (
      CLERK_PLAN_IDENTIFIERS.starter.some((plan) => identifiers.includes(plan))
    ) {
      return "starter";
    }
  } catch (error) {
    console.error("Could not read Clerk billing subscription:", error);
  }

  const { has } = await auth();
  if (CLERK_PLAN_IDENTIFIERS.pro.some((plan) => has({ plan }))) return "pro";
  if (CLERK_PLAN_IDENTIFIERS.starter.some((plan) => has({ plan }))) {
    return "starter";
  }
  return "free";
};

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const currentPlan = await getCurrentPlan(user.id);

    const existing = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (existing) {
      if (existing.plan !== currentPlan) {
        const newPlanCredits = PLANS[currentPlan].credits;

        // Use updateMany with the old plan in the where clause to prevent
        // race conditions from double-crediting on concurrent requests
        await db.user.updateMany({
          where: { clerkId: user.id, plan: existing.plan },
          data: {
            plan: currentPlan,
            credits: existing.credits + newPlanCredits,
          },
        });

        // Re-fetch and return the updated record
        return await db.user.findUnique({ where: { clerkId: user.id } });
      }

      return existing;
    }

    // New user — create with free plan credits
    return await db.user.create({
      data: {
        clerkId: user.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl ?? "",
        credits: PLANS.free.credits,
        plan: "free",
      },
    });
  } catch (error) {
    console.error("checkUser error:", error);
    return null;
  }
};