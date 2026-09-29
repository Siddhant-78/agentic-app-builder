import Link from "next/link";
import { UserButton, SignInButton, Show } from "@clerk/nextjs";
import { Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingModal } from "./PricingModal";
import { checkUser } from "@/lib/checkUser";
import { PLANS } from "@/lib/constants";
import { Plan } from "@/types/plans";

export default async function Header() {
  const user = await checkUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 select-none">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Nexa</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Show when="signed-in">
            <Link
              href="/projects"
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Projects
            </Link>
            {user && (
              <PricingModal>
                <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-muted px-3 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3 fill-current" />
                  {user.credits} / {PLANS[user?.plan as Plan].credits} credits 
                </span>
              </PricingModal>
            )}
            <UserButton />
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="sm"
                className="text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-transparent"
              >
                Sign in
              </Button>
            </SignInButton>

            <SignInButton mode="modal">
              <Button
                size="sm"
                className="inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold active:scale-95"
              >
                Get Started
                <ArrowRight className="h-3 w-3 opacity-60" />
              </Button>
            </SignInButton>
          </Show>
        </div>
      </nav>
    </header>
  );
}