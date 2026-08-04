# Avatar & Registration Polish — Task Steps

## ✅ Step 1: Fix avatar image paths
- [x] `registerWizard.ts`: change `/Avatars/` → `/avatars/` for all stages + half/close variants + `getAvatarSource`.

## ✅ Step 2: Add password show/hide eye toggle in Step4
- [x] Install `lucide-react`.
- [x] `Step4.tsx`: add `showPassword`/`showConfirmPassword` state + eye toggle buttons (lucide `Eye`/`EyeOff` icons).
- [x] Avatar closes eyes when password visible, opens when hidden (with 140ms transition).

## ✅ Step 3: Smooth avatar eye transition
- [x] `avatar.module.css`: add a short transition (150-200ms) for the open/close animation.

## ✅ Step 4: Fix large-screen layout
- [x] `page.tsx`: change grid to `lg:grid-cols-[1fr_300px]`; center/sticky avatar panel on large screens.

## ✅ Step 5: Fix light-mode text visibility
- [x] `globals.css`: improve `--text-secondary` / `--text-placeholder` contrast in default `:root`.

## ✅ Step 6: Add Navbar to register page
- [x] `page.tsx`: add `<Navbar />` at top; remove redundant inline theme toggle in form header.
- [x] Ensure Navbar doesn't crowd the form on small screens (responsive CSS in login.module.css).

## ✅ Step 7: Rename manAvatar files
- [x] `-1 year.png` → `1year.png`
- [x] `+27 years.png` → `27plus.png`
- [x] `18-half.png.png` → `18-half.png`

## ✅ Verification
- [x] `npm run lint` — 0 errors (2 pre-existing warnings unrelated to changes).
- [x] `npx tsc --noEmit` — no type errors.
- [x] Build artifacts generated successfully.
