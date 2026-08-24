# Zespo — launch setup

This app now runs on Supabase (Postgres + Auth + Storage + Realtime) instead of
in-memory demo state. Nothing about the UI changed; auth, chat, stories, and
the admin/dev views all read and write real data now.

## 1. Create a Supabase project
1. https://supabase.com → New project. Note the project URL and anon public key
   (Settings → API).
2. Settings → Authentication → disable "Confirm email" if you want people to
   log in immediately after registering, or leave it on and they'll confirm
   via email first (recommended for a real launch).

## 2. Run the database schema
In the Supabase SQL editor, run, in order:
1. `supabase/schema.sql` — tables, RLS policies, the invite-code RPC.
2. Create two **public** Storage buckets named `avatars` and `stories`
   (Storage → New bucket → toggle Public).
3. `supabase/storage-policies.sql` — locks uploads to each user's own folder.

The schema seeds one starter invite code, `WELCOME-2026`. Rotate/replace it
before launch — an admin account can manage the `invite_codes` table directly
in the Supabase table editor, or you can build a small admin UI for it later.

## 3. Wire up the app
```bash
npm install @supabase/supabase-js lucide-react
```
Create `.env.local` in your project root:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
(If you're not on Vite — e.g. Next.js — swap `import.meta.env.VITE_*` in
`src/lib/supabaseClient.js` for `process.env.NEXT_PUBLIC_*` and rename the
vars accordingly.)

Drop in `src/lib/supabaseClient.js`, `src/lib/api.js`, and `src/ZespoApp.jsx`,
then render `<ZespoApp />` wherever the old component was mounted.

## 4. What changed from the demo build
- **No hardcoded credentials.** The visible admin login/password and the
  fixed `2025` register code are gone. Real accounts go through Supabase Auth;
  registration requires a live invite code checked server-side via an RPC
  (the code itself is never sent to the browser).
- **Real persistence.** Users, messages, connections, stories, announcements,
  reports, and suggestions all live in Postgres, not React state — nothing is
  lost on refresh.
- **Real chat.** Threads load from the `messages` table and update live via
  Supabase Realtime instead of local state.
- **Real photo capture.** The AR lens tab now captures an actual canvas frame
  from the camera (with a basic color-tint "lens") and uploads it to Storage,
  instead of dropping in a placeholder emoji.
- **Row Level Security everywhere.** Every table's policies restrict access
  to what that user should see (their own messages/connections, public feeds
  are read-only for non-privileged roles, admin-only tables for admins).

## 5. One gap worth knowing about: account deletion
Supabase's client SDK can't delete an `auth.users` row directly — that needs
the service-role key, which must never ship to the browser. The Profile tab's
"Delete account" button currently signs the user out and files a deletion
request report instead of a real delete. To make it self-service, add a
Supabase Edge Function that uses the service-role key server-side to call
`supabase.auth.admin.deleteUser(id)`, and have the button call that function.

## 6. Deploying
Any static host works (Vercel, Netlify, Cloudflare Pages) since this is a
plain Vite/React app talking directly to Supabase's API — set the two env
vars in your host's dashboard and build as usual (`npm run build`).
