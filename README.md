# Mix Garage

A modern car marketplace — buy, sell and chat. Built with **React + Vite + Tailwind CSS** on **Supabase** (Auth, PostgreSQL, Storage, Realtime).

> The mobile (React Native + NativeWind) app is planned for a follow-up phase. The shared `services/` layer was designed to be reused as-is on RN.

---

## ✨ Features

- **Auth** — Email/password + Google OAuth, profile (name, avatar, phone, city, bio), roles (buyer/seller/admin)
- **Listings CRUD** — Title, price, full vehicle specs, up to 15 photos via Supabase Storage, statuses (active / sold / hidden / pending)
- **Browse & search** — Filters (make, model, year range, price range, fuel, governorate), keyword search across title/description/make/model, sort by newest / price asc / desc, paginated
- **Listing detail** — Image gallery + lightbox, all specs, seller card, in-app message, WhatsApp deep-link, share, save to favourites, related listings, view counter
- **Favourites** — Save / unsave with optimistic UI
- **Realtime messaging** — Buyer ↔ seller chat with Supabase Realtime, conversation list, live message updates
- **Seller dashboard** — Manage your listings, mark as sold, hide/unhide, edit, delete; per-listing stats (views, favourites, messages)
- **Admin panel** — Stats overview, manage all listings (approve / hide / delete), manage user roles
- **UX** — Dark mode, **Arabic RTL** support, loading skeletons, empty states with illustrations, mobile-responsive

---

## 🧱 Tech

- React 18 + Vite
- Tailwind CSS (custom brand palette — deep teal `#0F6E56`)
- React Router v6, Zustand, react-hot-toast, lucide-react
- `@supabase/supabase-js` v2

---

## 🗄️ Database schema (Supabase)

Migrations are already applied to the connected project (`kpjnrcbifbdgpozcvpod`). They live in:

- `supabase/migrations/0001_mix_garage_schema.sql` — tables, enums, indexes, RLS policies, triggers, FTS, realtime publication
- `supabase/migrations/0002_mix_garage_storage.sql` — `listing-images` and `avatars` buckets + storage RLS

### Tables

| Table | Purpose |
|---|---|
| `profiles` | One row per `auth.users`. Auto-created via trigger. Holds name, avatar, phone, role, etc. |
| `mg_listings` | Car listings. Has full-text `search_tsv` (auto-maintained), `views_count`, `status` enum. |
| `mg_listing_images` | Photos belonging to a listing (ordered). |
| `mg_favourites` | Saved listings per user (unique on user+listing). |
| `mg_conversations` | Buyer↔seller chat threads (one per listing+buyer). |
| `mg_messages` | Chat messages; trigger updates `last_message` on conversation. |

### Row-Level Security

- `profiles` — readable by anyone, writable only by self; admins have full access
- `mg_listings` — `active` listings public; owners/admins see all statuses; only owner/admin can mutate
- `mg_listing_images` — visible iff parent listing is visible; only owner/admin can write
- `mg_favourites` — strictly per-user
- `mg_conversations` / `mg_messages` — only the buyer, seller, or an admin can read/write
- Storage: `listing-images/{user_id}/{listing_id}/...` — only the owner can write; world-readable

### Helpful functions

- `mg_increment_views(listing_id)` — bump view counter (called from listing detail)
- `mg_is_admin(uid)` — used inside RLS policies
- `mg_handle_new_user()` — trigger that auto-creates a `profiles` row on `auth.users` insert

---

## 🚀 Getting started

```bash
cd web
npm install
cp .env.example .env   # values are pre-filled for the connected Supabase project
npm run dev            # http://localhost:5173
```

`web/.env` expects:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-key>
```

### Enable Google OAuth (optional)

1. Supabase dashboard → **Authentication → Providers → Google** → enable and add Client ID / Secret.
2. Add the redirect URL in Google Cloud: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Locally, also add `http://localhost:5173/auth/callback` to **Site URL / Redirect URLs**.

### Promote yourself to admin

After signing up the first time, run this once in the SQL editor:

```sql
update public.profiles set role = 'admin' where id = '<your-user-uuid>';
```

You can find your UUID in **Authentication → Users** in the Supabase dashboard.

---

## 📁 Project structure

```
web/
  src/
    components/     # Logo, Navbar, Footer, ListingCard, ListingForm, ImageGallery, Pagination, Skeletons, EmptyState, ProtectedRoute
    pages/          # Home, Browse, ListingDetail, Auth, AuthCallback, NewListing, EditListing, Favourites, Messages, Conversation, Dashboard, Admin, Profile, NotFound
    hooks/          # useFavourites
    services/       # auth, listings, favourites, messaging, admin  ← reusable on RN
    store/          # authStore (zustand)
    lib/            # supabase client
    utils/          # theme, i18n, format, constants
supabase/
  migrations/       # SQL applied to the project
```

---

## ⚠️ Security note

The connected Supabase project also contains pre-existing tables from a different app (`accounts`, `sessions`, `users`, `verification_tokens`, `transactions`, `page_views`, `user_settings`, `_prisma_migrations`) which currently have **RLS disabled**. Mix Garage does **not** use them — but you should review and enable RLS on those tables before going to production, otherwise anyone with the anon key can read/modify them.

---

## 🛣️ Roadmap

- React Native (NativeWind) app — same `services/` layer, screens parallel to web pages
- Push notifications for new messages
- Saved searches & alerts
- Listing reports / moderation queue
- Stripe Connect for paid promotions
