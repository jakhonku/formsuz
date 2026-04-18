# FormBot — Google Form'larni Telegram botga ulash platformasi

FormBot — O'zbekistondagi foydalanuvchilar uchun mo'ljallangan, Google Form javoblarini Telegram botga avtomatik tarzda yo'naltiruvchi innovatsion platforma. 2 daqiqa ichida hech qanday kod yozmasdan formangizni botga ulay olasiz.

## 🚀 Imkoniyatlar

- **Tezkor ulanish:** 3 bosqichli wizard orqali botni sozlash.
- **Real-time bildirishnomalar:** Har bir yangi javob darhol Telegram'ga keladi.
- **Google Sheets integratsiyasi:** Javoblar avtomatik ravishda jadvalga ham yoziladi.
- **Dashboard:** Barcha botlaringiz va statistikani bir joyda ko'ring.
- **Material Design 3:** Toza va modern interfeys.

## 🛠 Texnologiyalar

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, framer-motion.
- **Backend:** Next.js API Routes, Prisma ORM.
- **Database:** PostgreSQL.
- **Auth:** NextAuth.js (Google OAuth).
- **UI:** shadcn/ui.

## 📦 O'rnatish

1. Repozitoriyani klonlang:
   ```bash
   git clone https://github.com/jakhonku/formsuz.git
   cd forms
   ```

2. Kutubxonalarni o'rnating:
   ```bash
   npm install
   ```

3. `.env` faylini sozlang:
   `.env.example` faylidan namuna oling.

4. Database'ni tayyorlang:
   ```bash
   npx prisma db push
   ```

5. Loyihani ishga tushiring:
   ```bash
   npm run dev
   ```

## 🔑 Environment Variables

```env
DATABASE_URL=""
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
TELEGRAM_BOT_TOKEN=""
ENCRYPTION_KEY=""
```

## 🤝 Bog'lanish

Agar savollaringiz bo'lsa, @formbot_support Telegram guruhi orqali bog'lanishingiz mumkin.

---
© 2026 FormBot Platformasi.
