-- ========== Mix Garage schema ==========
-- This migration is already applied to the connected Supabase project.
-- Kept here for source control / re-deployment to other projects.

-- ENUMS
do $$ begin
  create type mg_role as enum ('buyer','seller','admin');
exception when duplicate_object then null; end $$;
do $$ begin
  create type mg_listing_status as enum ('active','sold','hidden','pending');
exception when duplicate_object then null; end $$;
do $$ begin
  create type mg_fuel as enum ('petrol','diesel','hybrid','electric','lpg','cng');
exception when duplicate_object then null; end $$;
do $$ begin
  create type mg_transmission as enum ('manual','automatic','cvt','semi_auto');
exception when duplicate_object then null; end $$;
do $$ begin
  create type mg_condition as enum ('new','used','certified');
exception when duplicate_object then null; end $$;

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  whatsapp text,
  city text,
  governorate text,
  bio text,
  role mg_role not null default 'buyer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- LISTINGS
create table if not exists public.mg_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  negotiable boolean not null default false,
  make text not null,
  model text not null,
  year int not null check (year between 1900 and extract(year from now())::int + 1),
  mileage int check (mileage >= 0),
  fuel_type mg_fuel,
  transmission mg_transmission,
  color text,
  condition mg_condition default 'used',
  city text,
  governorate text,
  whatsapp text,
  status mg_listing_status not null default 'active',
  views_count int not null default 0,
  search_tsv tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.mg_listings enable row level security;

create index if not exists mg_listings_status_idx on public.mg_listings(status);
create index if not exists mg_listings_seller_idx on public.mg_listings(seller_id);
create index if not exists mg_listings_make_model_idx on public.mg_listings(make, model);
create index if not exists mg_listings_price_idx on public.mg_listings(price);
create index if not exists mg_listings_year_idx on public.mg_listings(year);
create index if not exists mg_listings_created_idx on public.mg_listings(created_at desc);
create index if not exists mg_listings_search_idx on public.mg_listings using gin(search_tsv);

create or replace function public.mg_listings_tsv_update() returns trigger language plpgsql as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('simple', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.make,'') || ' ' || coalesce(new.model,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.description,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.city,'') || ' ' || coalesce(new.governorate,'')), 'C');
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists mg_listings_tsv_trg on public.mg_listings;
create trigger mg_listings_tsv_trg before insert or update on public.mg_listings
for each row execute function public.mg_listings_tsv_update();

-- LISTING IMAGES
create table if not exists public.mg_listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.mg_listings(id) on delete cascade,
  url text not null,
  storage_path text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.mg_listing_images enable row level security;
create index if not exists mg_listing_images_listing_idx on public.mg_listing_images(listing_id, order_index);

-- FAVOURITES
create table if not exists public.mg_favourites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.mg_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);
alter table public.mg_favourites enable row level security;
create index if not exists mg_favourites_user_idx on public.mg_favourites(user_id);
create index if not exists mg_favourites_listing_idx on public.mg_favourites(listing_id);

-- CONVERSATIONS
create table if not exists public.mg_conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.mg_listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);
alter table public.mg_conversations enable row level security;
create index if not exists mg_conversations_buyer_idx on public.mg_conversations(buyer_id);
create index if not exists mg_conversations_seller_idx on public.mg_conversations(seller_id);
create index if not exists mg_conversations_updated_idx on public.mg_conversations(updated_at desc);

-- MESSAGES
create table if not exists public.mg_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.mg_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.mg_messages enable row level security;
create index if not exists mg_messages_conv_idx on public.mg_messages(conversation_id, created_at);

create or replace function public.mg_messages_after_insert() returns trigger language plpgsql as $$
begin
  update public.mg_conversations
    set last_message = new.body,
        last_message_at = new.created_at,
        updated_at = now()
    where id = new.conversation_id;
  return new;
end $$;
drop trigger if exists mg_messages_after_insert_trg on public.mg_messages;
create trigger mg_messages_after_insert_trg after insert on public.mg_messages
for each row execute function public.mg_messages_after_insert();

-- profile auto-create on auth signup
create or replace function public.mg_handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists mg_on_auth_user_created on auth.users;
create trigger mg_on_auth_user_created after insert on auth.users
for each row execute function public.mg_handle_new_user();

-- helpers
create or replace function public.mg_is_admin(uid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = uid and role = 'admin')
$$;

create or replace function public.mg_increment_views(p_listing_id uuid) returns void language sql as $$
  update public.mg_listings set views_count = views_count + 1 where id = p_listing_id;
$$;

-- ============ RLS POLICIES ============

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);
drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles for all using (public.mg_is_admin(auth.uid())) with check (public.mg_is_admin(auth.uid()));

drop policy if exists "listings_select_public" on public.mg_listings;
create policy "listings_select_public" on public.mg_listings for select using (
  status = 'active' or seller_id = auth.uid() or public.mg_is_admin(auth.uid())
);
drop policy if exists "listings_insert_own" on public.mg_listings;
create policy "listings_insert_own" on public.mg_listings for insert with check (seller_id = auth.uid());
drop policy if exists "listings_update_own" on public.mg_listings;
create policy "listings_update_own" on public.mg_listings for update using (seller_id = auth.uid() or public.mg_is_admin(auth.uid())) with check (seller_id = auth.uid() or public.mg_is_admin(auth.uid()));
drop policy if exists "listings_delete_own" on public.mg_listings;
create policy "listings_delete_own" on public.mg_listings for delete using (seller_id = auth.uid() or public.mg_is_admin(auth.uid()));

drop policy if exists "img_select_public" on public.mg_listing_images;
create policy "img_select_public" on public.mg_listing_images for select using (
  exists(select 1 from public.mg_listings l where l.id = listing_id and (l.status = 'active' or l.seller_id = auth.uid() or public.mg_is_admin(auth.uid())))
);
drop policy if exists "img_modify_owner" on public.mg_listing_images;
create policy "img_modify_owner" on public.mg_listing_images for all using (
  exists(select 1 from public.mg_listings l where l.id = listing_id and (l.seller_id = auth.uid() or public.mg_is_admin(auth.uid())))
) with check (
  exists(select 1 from public.mg_listings l where l.id = listing_id and (l.seller_id = auth.uid() or public.mg_is_admin(auth.uid())))
);

drop policy if exists "fav_select_own" on public.mg_favourites;
create policy "fav_select_own" on public.mg_favourites for select using (user_id = auth.uid());
drop policy if exists "fav_insert_own" on public.mg_favourites;
create policy "fav_insert_own" on public.mg_favourites for insert with check (user_id = auth.uid());
drop policy if exists "fav_delete_own" on public.mg_favourites;
create policy "fav_delete_own" on public.mg_favourites for delete using (user_id = auth.uid());

drop policy if exists "conv_select_party" on public.mg_conversations;
create policy "conv_select_party" on public.mg_conversations for select using (auth.uid() in (buyer_id, seller_id) or public.mg_is_admin(auth.uid()));
drop policy if exists "conv_insert_buyer" on public.mg_conversations;
create policy "conv_insert_buyer" on public.mg_conversations for insert with check (auth.uid() = buyer_id);
drop policy if exists "conv_update_party" on public.mg_conversations;
create policy "conv_update_party" on public.mg_conversations for update using (auth.uid() in (buyer_id, seller_id)) with check (auth.uid() in (buyer_id, seller_id));

drop policy if exists "msg_select_party" on public.mg_messages;
create policy "msg_select_party" on public.mg_messages for select using (
  exists(select 1 from public.mg_conversations c where c.id = conversation_id and (auth.uid() in (c.buyer_id, c.seller_id) or public.mg_is_admin(auth.uid())))
);
drop policy if exists "msg_insert_party" on public.mg_messages;
create policy "msg_insert_party" on public.mg_messages for insert with check (
  sender_id = auth.uid() and exists(select 1 from public.mg_conversations c where c.id = conversation_id and auth.uid() in (c.buyer_id, c.seller_id))
);

-- realtime
alter publication supabase_realtime add table public.mg_messages;
alter publication supabase_realtime add table public.mg_conversations;
