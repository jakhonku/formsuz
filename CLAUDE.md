# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production (runs prisma generate first)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `prisma generate` - Generate Prisma client (runs automatically on postinstall and build)
- `npx prisma studio` - Open Prisma GUI for database inspection

## Architecture Overview

### Core Features
- **Google Forms to Telegram Bridge**: Users connect Google Forms to Telegram bots to receive form responses
- **Authentication**: Google OAuth via NextAuth v4.24.14 with JWT session strategy
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Deployment**: Vercel (Next.js 14 App Router)

### Key Files & Flow
1. **Authentication**
   - `lib/auth.ts` - NextAuth configuration with Google Provider and JWT callbacks
   - `middleware.ts` - Protects `/dashboard/*` routes
   - `app/login/page.tsx` - Login page with Google Sign-In button
   - `app/api/auth/[...nextauth]/route.ts` - NextAuth API handler

2. **OAuth Flow**
   - User clicks "Google bilan kirish" → Google OAuth consent
   - On success: JWT callback in `lib/auth.ts` creates session with user data
   - Redirect callback sends user to `/dashboard` (or original URL if same domain)
   - Middleware checks for valid session on dashboard routes

3. **Data Models** (Prisma schema)
   - `User` - Main entity with plan (FREE/PRO/BUSINESS) and expiry
   - `Form` - Google Form metadata linked to user
   - `Bot` - Telegram bot configuration linked to form
   - `Response` - Form responses collected via Telegram
   - `ChatMessage` - Communication between bot and users
   - `VotingBot`/`Candidate`/`Vote` - Voting competition feature

4. **Environment Variables** (Critical for Vercel)
   - `DATABASE_URL` - Pooled connection (e.g., `postgresql://user:pass@pool.supabase.co:6543/db`)
   - `DIRECT_URL` - Direct connection (required by Prisma schema, same as DATABASE_URL if no pooler)
   - `NEXTAUTH_URL` - `https://gway.uz` (no trailing slash)
   - `NEXTAUTH_SECRET` - Random string for session encryption
   - `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` - From Google Cloud Console
   - `TELEGRAM_BOT_TOKEN` - Optional, for main bot
   - `ENCRYPTION_KEY` - 32-char key for encrypting telegram tokens in DB

### Known Issues & Fixes
- **@auth/prisma-adapter version**: Must be ^1.6.0 (v2 incompatible with next-auth v4)
- **ERR_TOO_MANY_REDIRECTS**: Remove www→non-www redirect from middleware (Vercel handles this)
- **Redirect loops**: Ensure redirect callback returns `/dashboard` fallback
- **Supabase @ in password**: Must URL-encode as `%40` in DATABASE_URL
- **Session not persisting**: Verify NEXTAUTH_URL matches deployed domain exactly
- **Google Console**: Add `https://gway.uz/api/auth/callback/google` to Authorized redirect URIs

### Debugging
- Visit `/api/debug` to see session and environment (non-secrets only)
- Check login page for red error messages when `?error=` present
- Verify Prisma models generate correctly: `npx prisma generate`

### Best Practices
- Never commit `.env` files - use Vercel environment variables
- Always URL-encode special characters in database passwords
- Test OAuth flow in incognito to avoid cached sessions
- When changing scopes, users must re-consent