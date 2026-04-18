export const PLANS = {
  FREE: {
    name: "Bepul",
    maxBots: 1,
    maxForms: 1,
    features: ["1 tagacha bot", "1 tagacha Google Form ulanish", "Telegram bot orqali javoblar", "Asosiy qo'llab-quvvatlash"],
    chatEnabled: false,
    price: 0
  },
  PRO: {
    name: "Professional",
    maxBots: 10,
    maxForms: 10,
    features: ["Barcha bepul imkoniyatlar", "10 tagacha bot", "Admin bilan real-vaqtda chat", "Media fayllar (Rasm, PDF, Fayl)", "Eksport (Excel/CSV)", "Tezkor yordam"],
    chatEnabled: true,
    price: 99000
  },
  BUSINESS: {
    name: "Biznes",
    maxBots: 100,
    maxForms: 100,
    features: ["Cheksiz botlar", "Shaxsiy brending (Branding)", "Cheksiz chat tarixi", "API orqali ulanish imkoniyati", "24/7 Ustuvor qo'llab-quvvatlash", "Shaxsiy menejer"],
    chatEnabled: true,
    price: 299000
  },
  GWAY: {
    name: "Gway.uz bilan",
    maxBots: 999999,
    maxForms: 999999,
    features: ["Barcha imkoniyatlar cheksiz", "Gway platformasi integratsiyasi", "Eksklyuziv hamkorlik", "Investorlar uchun maxsus yordam"],
    chatEnabled: true,
    price: 0
  }
};

export function getPlanLimit(plan: string) {
  return PLANS[plan as keyof typeof PLANS] || PLANS.FREE;
}

export function isPlanExpired(expiresAt: Date | null) {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
}
