export const PLANS = {
  free: {
    label: "Free",
    credits: 10,
    price: 0,
  },
  starter: {
    label: "Starter",
    credits: 50,
    price: 9,
  },
  pro: {
    label: "Pro",
    credits: 150,
    price: 29,
  },
} as const;

export const CLERK_PLAN_IDENTIFIERS = {
  starter: ["starter", "user:starter", "cplan_3IxKH7NBtYeg5DIArjosoTUlDe2"],
  pro: ["pro", "user:pro", "cplan_3IxKiTUsfPtt2fY8qMIlnC8vWBC"],
} as const;

export const CREDIT_COST_PER_GENERATION = 1;

export const MIN_CREDITS_TO_GENERATE = 1;

export const PRICING_PLANS = [
  {
    key: "free",
    label: "Free",
    description: "Start building. No credit card required.",
    price: 0,
    featured: false,
    planId: null,
    active: true,
    features: ["10 generations / month", "Live preview", "Export to zip"],
  },
  {
    key: "starter",
    label: "Starter",
    description: "For developers who build regularly.",
    price: 9,
    featured: true,
    planId: "cplan_3IxKH7NBtYeg5DIArjosoTUlDe2",
    active: false,
    features: [
      "50 generations / month",
      "Image uploads",
      "Live preview",
      "Export to zip",
    ],
  },
  {
    key: "pro",
    label: "Pro",
    description: "For power users who ship fast.",
    price: 19,
    featured: false,
    planId: "cplan_3IxKiTUsfPtt2fY8qMIlnC8vWBC",
    active: false,
    features: [
      "150 generations / month",
      "Live preview",
      "Export to zip",
      "Image uploads",
    ],
  },
] as const;
