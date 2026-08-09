# Avatar & Registration Polish — Task Steps

## ✅ Git Merge (keep user's version)

- [x] Resolve conflict in `app/register/page.tsx` (kept user's `Navbar` version + integrated the incoming `createUniqueUsername` helper into submission).
- [x] Build verified after merge resolution.

## ✅ Step 1: Fix avatar growth bug

- [x] Add `age: undefined` to `defaultValues` in `register/page.tsx` so `useWatch({ name: "age" })` can subscribe reliably.
- [x] Add fallback: watch `dateOfBirth` and derive `effectiveAge = age ?? calculateAge(dateOfBirth)` — avatar always knows the user's age.
- [x] Maintained answer **C** behavior: avatar grows with each step (`1 year → 2 years → 11 years → 18 years → 18-25 → 27+`) but never exceeds the user's actual age. Once the user reaches their max stage, pressing Next no longer grows the avatar.

## ✅ Step 2: Restore avatar animations

- [x] `avatar.module.css`: restored/enhanced `avatarArrival` — now a smooth bounce (scale 0.7 → 1.04 → 1) over 460ms, triggered by `key={imageSource}` in `AvatarPreview.tsx` whenever the avatar stage changes.
- [x] Kept `avatarGlow`, `avatarOrbit`, `avatarSparkle` ambient animations + reduced-motion media query.

## ✅ Step 3: Build the home page (Hero + Features + CTAs)

- [x] `app/page.tsx`: full hero section ("Buy & Sell Gaming Accounts Securely") with badge, subtitle, **Get Started** button → `/register`, **Sign In** button → `/login`.
- [x] Features grid: Secure Transactions, Trusted Community, Instant Delivery, Your Data Protected (lucide icons).
- [x] Supports both dark and light modes via `next-themes` `useTheme` + existing CSS variables (`--accent`, `--bg`, `--text-primary`, `--model`, `--surface`).

## ✅ Step 4: Fix small pages / viewport coverage

- [x] `app/layout.tsx`: exported `viewport` metadata (`width: device-width`, `initialScale: 1`, `viewportFit: cover`) + `metadata` (title/description).
- [x] `app/globals.css`: `html`/`body` set to fill viewport (`min-height: 100vh/100dvh`, `width: 100%`) — pages now stretch full-screen instead of looking small.

## ✅ Verification

- [x] `npm run build` — compiled successfully, all routes generated (`/`, `/login`, `/register`), no type errors.
- [x] `npm run lint` — 0 errors (only 3 pre-existing warnings unrelated to these changes).
