# Role Insertion Verification Report

**Date**: 2026-09-04
**Database**: `bxycqqrweicakzkwfkzm.supabase.co`
**Verified by**: Direct Supabase REST API queries

---

## ✅ Verification Result: PASS

The role record **IS being inserted correctly** into the Supabase `roles` table after a director publishes a casting call through the `post-role.tsx` screen.

---

## 1. Roles Table — Confirmed Data Exists

Query: `GET /rest/v1/roles?select=*,users(name,director_profiles(verified))&order=created_at.desc&limit=5`

### Records Found (2)

| ID | Project | Role Title | Director | Category | Created |
|----|---------|------------|----------|----------|---------|
| `186d620e-b76e-49fd-b8f7-eaa61a9f1eee` | Neram | Lead Antagonist (Nivin) | NEXOGRAM Studios | Malayalam Feature Film | 2026-09-04 19:58:19 |
| `e419c75e-e2dd-42a3-a501-f004c8acac37` | BALAN 2 | Lead Antagonist (Sandra) | NEXOGRAM Studios | Malayalam Feature Film | 2026-09-04 19:53:52 |

### Field Verification

| Field | Value | Status |
|-------|-------|--------|
| `id` | `186d620e-...` / `e419c75e-...` | ✅ UUID generated |
| `director_id` | `05502de3-73bb-468d-b4c1-ed840e54aa9f` | ✅ Correctly set |
| `project_title` | "Neram" / "BALAN 2" | ✅ Persisted |
| `role_title` | "Lead Antagonist (Nivin)" / "Lead Antagonist (Sandra)" | ✅ Persisted |
| `category` | "Malayalam Feature Film" | ✅ Persisted |
| `age_range` | "20 - 30" | ✅ Persisted |
| `gender` | "Male" / "Female" | ✅ Persisted |
| `language` | "Malayalam" | ✅ Persisted |
| `location` | "Kochi, Kerala" | ✅ Persisted |
| `description` | Full text | ✅ Persisted |
| `requirements` | Full text | ✅ Persisted |
| `deadline` | "2026-06-15" | ✅ Persisted |
| `created_at` | 2026-09-04T19:58:19 / 2026-09-04T19:53:52 | ✅ Auto-set |

> **Note**: The `roles` table does **NOT** have a `status` field. The application status field exists only on the `applications` table (`Submitted`, `Viewed`, `Under Review`, `Shortlisted`, `Rejected`, `Meeting Scheduled`).

---

## 2. Users Table — Confirmed

Query: `GET /rest/v1/users?select=id,email,name,role`

| ID | Email | Name | Role |
|----|-------|------|------|
| `05502de3-73bb-468d-b4c1-ed840e54aa9f` | nexogram01@gmail.com | NEXOGRAM Studios | **director** |
| `03556709-9bbf-44bb-ae5b-1a32ce92e4d7` | alanjoywilson@gmail.com | Alan Joy Wilson | **actor** |

✅ The `director_id` in `roles` correctly references the director's user ID.

---

## 3. RLS Policies — All Verified

From [`00_initial_schema.sql`](supabase/migrations/00_initial_schema.sql):

```sql
-- Roles table policies
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- ✅ Actor read permissions
CREATE POLICY "Roles are viewable by everyone" 
  ON public.roles FOR SELECT USING (true);

-- ✅ Director insert permissions (THIS is the policy that allowed the inserts)
CREATE POLICY "Directors can insert their own roles" 
  ON public.roles FOR INSERT WITH CHECK (auth.uid() = director_id);

-- ✅ Director update permissions
CREATE POLICY "Directors can update their own roles" 
  ON public.roles FOR UPDATE USING (auth.uid() = director_id);

-- ✅ Director delete permissions
CREATE POLICY "Directors can delete their own roles" 
  ON public.roles FOR DELETE USING (auth.uid() = director_id);
```

| Policy | Action | Read/Write | Status |
|--------|--------|------------|--------|
| Anyone can SELECT | SELECT | Read (both actor & director) | ✅ |
| Directors can INSERT | INSERT | Write (director only) | ✅ |
| Directors can UPDATE | UPDATE | Write (director only) | ✅ |
| Directors can DELETE | DELETE | Write (director only) | ✅ |

---

## 4. Related Tables — Status

### director_profiles
```json
{
  "user_id": "05502de3-73bb-468d-b4c1-ed840e54aa9f",
  "company_name": "Independent Production",
  "verified": false,
  "created_at": "2026-09-04T19:49:08"
}
```
✅ Director profile exists and is joined correctly when fetching roles.

### actor_profiles
- 2 records (one for each user)
- ⚠️ All fields are empty (`age: null, gender: "", location: ""`) — Actor profile needs to be completed by the actor

### applications
- 0 records — No actor has applied yet
- ✅ Table is accessible and RLS policies are in place

---

## 5. Insert Path — Verified

The `postRole()` function in [`supabase.ts`](src/services/supabase.ts:183) correctly:

1. ✅ Reads `director_id` from authenticated user (`user.id`)
2. ✅ Inserts all required fields into `roles` table
3. ✅ Returns the newly created `Role` object
4. ✅ The RLS policy `Directors can insert their own roles` permits the insert because `auth.uid() = director_id`
5. ✅ The `post-role.tsx` screen calls `postRole()` and on success invalidates queries and navigates to dashboard

---

## 6. Conclusion

### Status: ✅ WORKING CORRECTLY

| Check | Result |
|-------|--------|
| roles table data exists | ✅ Confirmed (2 records) |
| director_id correctly set | ✅ Confirmed |
| status field | N/A (not a field on roles; exists on applications) |
| RLS policies | ✅ All configured correctly |
| Actor read permissions | ✅ "Roles are viewable by everyone" |
| Director read permissions | ✅ Same (viewable by everyone) |
| Director write permissions | ✅ "Directors can insert/update/delete their own roles" |

### No Fixes Required

The role insertion workflow is functioning as designed. The `postRole()` service works correctly, the RLS policies permit the correct operations, and the data is being persisted to Supabase successfully.

### Next Verification Step

To complete the end-to-end workflow, an actor needs to:
1. Sign in as the actor account
2. Browse the "Casting Board" / "Discover Roles" page
3. Tap on "Neram" or "BALAN 2" role
4. Record/upload an audition video
5. Submit application via `applyToRole()` in [`supabase.ts`](src/services/supabase.ts:299)
6. Verify the application appears in the director's dashboard
