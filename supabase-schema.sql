-- ══════════ FLINT Supabase Schema ══════════

-- 1. Profiles (extends Supabase Auth users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  role text not null default 'READER' check (role in ('READER','ANALYST','ADMIN')),
  avatar text,
  bio text,
  cover_sectors text[] default '{}',
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- 2. Comments
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  report_id text not null,
  user_id uuid references profiles(id) on delete cascade,
  user_name text not null,
  user_role text not null default 'READER',
  text text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table comments enable row level security;
create policy "Comments are viewable by everyone" on comments for select using (true);
create policy "Authenticated users can insert comments" on comments for insert with check (auth.uid() = user_id);
create policy "Users can update own comments" on comments for update using (auth.uid() = user_id);
create policy "Users can delete own comments or admins can delete any" on comments for delete using (
  auth.uid() = user_id
  or exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);

-- 3. Custom reports (admin-published)
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  type text not null default 'COMPANY',
  status text not null default 'PUBLISHED',
  opinion text,
  target_price integer,
  key_points text[] default '{}',
  tags text[] default '{}',
  content text,
  view_count integer default 0,
  like_count integer default 0,
  read_time integer default 5,
  author_id uuid references profiles(id),
  author_name text,
  stock_code text,
  stock_name text,
  stock_market text,
  stock_sector text,
  published_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table reports enable row level security;
create policy "Reports are viewable by everyone" on reports for select using (true);
create policy "Admins can insert reports" on reports for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);
create policy "Admins can update reports" on reports for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);
create policy "Admins can delete reports" on reports for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);

-- 4. Bookmarks
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  report_id text not null,
  created_at timestamptz default now(),
  unique(user_id, report_id)
);

alter table bookmarks enable row level security;
create policy "Users can view own bookmarks" on bookmarks for select using (auth.uid() = user_id);
create policy "Users can insert own bookmarks" on bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can delete own bookmarks" on bookmarks for delete using (auth.uid() = user_id);

-- 5. Likes
create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  report_id text not null,
  created_at timestamptz default now(),
  unique(user_id, report_id)
);

alter table likes enable row level security;
create policy "Likes are viewable by everyone" on likes for select using (true);
create policy "Users can insert own likes" on likes for insert with check (auth.uid() = user_id);
create policy "Users can delete own likes" on likes for delete using (auth.uid() = user_id);

-- 6. Auto-create profile on signup (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case when new.email = 'admin@flint.kr' then 'ADMIN' else 'READER' end
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
