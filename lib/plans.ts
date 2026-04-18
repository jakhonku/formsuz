export const PLANS = {
  FREE: {
    name: "Free",
    maxBots: 3,
    features: ["Google Form ulanish", "Telegram bot orqali javoblar", "3 tagacha bot", "Asosiy qo'llab-quvvatlash"],
    price: 0
  },
  PRO: {
    name: "Pro",
    maxBots: 10,
    features: ["Barcha Free imkoniyatlar", "10 tagacha bot", "Real-time chat", "Eksport (Excel/CSV)", "Tezkor yordam"],
    price: 99000 // In Sums (example)
  },
  BUSINESS: {
    name: "Business",
    maxBots: 100,
    features: ["Cheksiz botlar", "Custom branding", "24/7 Priority support", "API Access", "Shaxsiy menejer"],
    price: 299000
  }
};

export function getPlanLimit(plan: string) {
  return PLANS[plan as keyof typeof PLANS] || PLANS.FREE;
}

export function isPlanExpired(expiresAt: Date | null) {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
}
