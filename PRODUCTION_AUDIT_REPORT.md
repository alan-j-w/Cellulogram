# 🔍 CELLULOGRAM PRODUCTION RELEASE AUDIT REPORT

**Date:** 2026-09-05  
**Expo SDK:** 55.0.31  
**Project:** Cellulogram - Film Industry Casting Platform  
**Status:** ✅ PRODUCTION READY (All Issues Resolved & Verified)

---

## 📊 EXECUTIVE SUMMARY

| Audit Domain | Initial Status | Final Status | Resolution Summary |
|---|---|---|---|
| **1. Job Posting Visibility** | ❌ FAILED | ✅ RESOLVED | Resolved PostgREST `PGRST200` relation error by replacing direct `roles -> director_profiles` foreign key queries with relational traversal `roles -> users!director_id -> director_profiles`. |
| **2. Dark & Light Mode** | ⚠️ INCONSISTENT | ✅ STANDARDIZED | Replaced hardcoded `#0B0B0B`, `#262626`, `text-white` with dynamic theme tokens (`useThemeColors`) across all inputs, buttons, skeletons, and modals. |
| **3. UI Consistency & Contrast** | ⚠️ CONTRAST CLASH | ✅ RESOLVED | Standardized status badges, card borders, and eliminated the light mode contrast clash on `#D4AF37` gold buttons by enforcing high-contrast dark text (`text-[#0B0B0B] font-bold`). |
| **4. Android Hermes Build** | ❌ FAILED | ✅ RESOLVED | Upgraded `@supabase/supabase-js` to `^2.115.0`, eliminating unsupported dynamic `import(OTEL_PKG)` from core runtime. |
| **5. Build & Type Verification** | ✅ VERIFIED | ✅ PASSED | TypeScript check (0 errors), Expo Doctor (20/20 passed), Android Hermes export (3,479 modules -> 6.9MB `.hbc`), Web export (23 routes). |

---

## 🛠️ AUDIT SECTION 1: JOB POSTING BUG INVESTIGATION & RESOLUTION

### 1. The Reported Problem
- Director could create and submit a job posting successfully.
- Post-creation, jobs were completely invisible across:
  - Actor Dashboard (`src/app/(actor)/dashboard.tsx`)
  - Actor Job Listings / Search (`src/app/(actor)/role/[id].tsx`)
  - Director Posted Jobs Dashboard (`src/app/(director)/dashboard.tsx`)

### 2. End-to-End Tracing: UI → API → Database → PostgREST
1. **Database Inspection**: Checked Supabase database tables directly via node script.
   - `public.roles` table contained the records (e.g. `BALAN 2`, `Neram`) with `status = 'open'`. The database insert was working.
   - Row Level Security (RLS) policies were verified on `roles` and allowed public/authenticated reads for active listings.
2. **API & Service Query Failure**:
   - `databaseService.getRoles()` and `getRoleById()` in `src/services/supabase.ts` were executing:
     ```typescript
     supabase.from('roles').select(`
       *,
       director_profiles (company_name, verified)
     `)
     ```
   - **PostgREST Schema Inspection**: `roles` does **not** have a foreign key pointing directly to `director_profiles`. Instead, `roles.director_id` references `public.users(id)`, and `director_profiles.user_id` references `public.users(id)`.
   - **Error Thrown**: PostgREST threw `PGRST200`:
     > *"Could not find a relationship between 'roles' and 'director_profiles' in the schema cache"*
   - **TanStack Query Impact**: The error caused TanStack Query's promise to reject. In UI components (`useRoles`, `useDirectorRoles`), `data` was returned as `undefined`, causing empty states to render on all dashboards.
   - Similarly, in `getApplicationsForRole` and `getApplicationsByActor`, the queries attempted direct `actor_profiles` joins without specifying `users!actor_id`.

### 3. Changes Implemented in `src/services/supabase.ts`
- **Updated `getRoles`**:
  ```typescript
  export const getRoles = async (directorId?: string): Promise<Role[]> => {
    let query = supabase
      .from('roles')
      .select(`
        *,
        users!director_id (
          name,
          director_profiles (
            company_name,
            verified
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (directorId) {
      query = query.eq('director_id', directorId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(r => {
      const directorProfile = Array.isArray(r.users?.director_profiles)
        ? r.users?.director_profiles[0]
        : r.users?.director_profiles;
      return {
        ...r,
        director_name: r.users?.name || 'Casting Director',
        company_name: directorProfile?.company_name || 'Production House',
        is_verified: directorProfile?.verified ?? false,
      };
    });
  };
  ```
- **Updated `getRoleById`**: Added the same explicit foreign key path `users!director_id (name, director_profiles (company_name, verified))`.
- **Updated `getApplicationsForRole` & `getApplicationsByActor`**: Joined through `users!actor_id (name, avatar_url, actor_profiles (...))` and extracted actor details safely.
- **Updated `src/app/(director)/dashboard.tsx`**: Passed `user?.id` into `databaseService.getRoles(user?.id)` to properly scope the director's posted jobs dashboard.
- **Updated `src/app/(director)/post-role.tsx`**: Added query cache invalidation for both `['roles']` and `['director_applications']`.

---

## 🎨 AUDIT SECTION 2: DARK MODE & THEME SYSTEM

### 1. The Problem
- Hardcoded dark backgrounds (`bg-[#0B0B0B]`), dark borders (`border-[#262626]`), and static white text (`text-white`) were scattered across components and screens.
- When users switched to light mode, these components remained pitch black or produced illegible white-on-white / black-on-black clashes.

### 2. Core Components Standardized
- **`src/components/ui/Input.tsx`**:
  - Replaced hardcoded `bg-[#0B0B0B] border-[#262626] text-white` with `bg-background border-border text-textPrimary`.
  - Replaced hardcoded placeholder color `#555555` with `colors.muted`.
- **`src/components/ui/Button.tsx`**:
  - Secondary variant: Changed from hardcoded `bg-[#1A1A1A] border-[#262626] text-white` to `bg-card border-border text-textPrimary`.
  - Outline & Text variants: Inherit `text-textPrimary` instead of fixed `text-white`.
  - ActivityIndicator spinner: Uses dynamic contrast color according to variant.
- **`src/components/ui/Skeleton.tsx`**:
  - Changed animated base background from hardcoded `#222222` to dynamic `colors.border`.
- **`src/app/(auth)/login.tsx` & `src/app/(auth)/signup.tsx`**:
  - Replaced Google OAuth button's hardcoded black style with `bg-card border-border text-textPrimary`.
- **`src/app/(actor)/profile.tsx` & `src/app/(director)/profile.tsx`**:
  - Set `Switch` thumbColor to `colors.card` so the toggle switch renders with proper elevation and contrast in both themes.

---

## 💎 AUDIT SECTION 3: UI CONSISTENCY & CONTRAST

### 1. Gold Button Contrast Fix (Critical)
- **Problem**: Primary buttons use the brand gold accent `#D4AF37`. In several screens, primary buttons used `text-background`.
  - Dark Mode: `background` is `#0B0B0B` (High contrast: black on gold).
  - Light Mode: `background` is `#F8F9FA` (Zero contrast: white text on gold background, failing WCAG accessibility).
- **Fix**: Updated `src/components/ui/Button.tsx` and screens (`(director)/dashboard.tsx`, `applicants/[roleId].tsx`) to enforce:
  ```tsx
  text-[#0B0B0B] font-bold
  ```
  This guarantees >8:1 contrast in both light mode and dark mode.

### 2. Status Badge Palette Standardization
- Standardized status colors in `src/constants/theme.ts`:
  - `applied`: Blue (`#3B82F6`)
  - `shortlisted`: Gold (`#D4AF37`)
  - `rejected`: Rose/Red (`#EF4444`)
  - `accepted`: Emerald/Green (`#10B981`)
- Updated `src/app/(actor)/applications.tsx` and `src/app/(director)/applicants/[roleId].tsx` with adaptive background opacities (`rgba(..., 0.12)` in light mode, `rgba(..., 0.2)` in dark mode) and matching high-contrast text.

---

## 🚀 AUDIT SECTION 4: BUILD & VERIFICATION MATRIX

| Verification Step | Command | Result | Details |
|---|---|---|---|
| **TypeScript** | `npx tsc --noEmit` | ✅ 0 Errors | Complete project compiles with strict type safety. |
| **Expo Doctor** | `npx expo-doctor` | ✅ 20/20 Passed | All peer dependencies, versions, and configurations verified. |
| **Android Export** | `npx expo export --platform android` | ✅ Passed | 3,479 modules bundled into Hermes Bytecode (`entry-*.hbc`, 6.9MB). |
| **Web Export** | `npx expo export --platform web` | ✅ Passed | 23 static routes generated in `dist/`. |
| **Live DB Queries** | Node verification script | ✅ Passed | `getRoles()` returns full populated roles with director & company names. |

---

## 📋 SUMMARY OF MODIFIED FILES

1. `src/services/supabase.ts` - Corrected foreign key traversal paths for roles and applications.
2. `src/components/ui/Input.tsx` - Removed hardcoded dark colors; unified theme tokens.
3. `src/components/ui/Button.tsx` - Enforced high contrast text on gold accent; dynamic variant styling.
4. `src/components/ui/Skeleton.tsx` - Converted to dynamic theme border color.
5. `src/constants/theme.ts` - Standardized Colors object and StatusBadgeColors tokens.
6. `src/app/(director)/dashboard.tsx` - Scoped director roles query to `user.id`; fixed button contrast.
7. `src/app/(director)/post-role.tsx` - Added query invalidation for roles and applications.
8. `src/app/(director)/applicants/[roleId].tsx` - Fixed Pass/Shortlist action buttons and badge contrast.
9. `src/app/(actor)/applications.tsx` - Standardized status badges and banner contrast.
10. `src/app/(actor)/dashboard.tsx` - Refined agency badge styling.
11. `src/app/(actor)/role/[id].tsx` - Standardized card backgrounds and deadline contrast.
12. `src/app/(actor)/profile.tsx` & `src/app/(director)/profile.tsx` - Fixed Switch thumb colors.
13. `src/app/(auth)/login.tsx` & `src/app/(auth)/signup.tsx` - Fixed Google button background and borders.
