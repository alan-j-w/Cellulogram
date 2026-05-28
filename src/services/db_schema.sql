-- ==========================================================
-- CELLULOGRAM - DATABASE SCHEMA (SUPABASE POSTGRES)
-- ==========================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. USERS PROFILE TABLE
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  name text not null,
  role text check (role in ('actor', 'director')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- 3. ACTOR PROFILES TABLE
create table public.actor_profiles (
  user_id uuid references public.users(id) on delete cascade primary key,
  age integer not null,
  gender text not null,
  location text not null,
  languages text not null,
  skills text,
  experience text,
  intro_video_url text,
  trust_score integer default 90 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.actor_profiles enable row level security;

-- 4. DIRECTOR PROFILES TABLE
create table public.director_profiles (
  user_id uuid references public.users(id) on delete cascade primary key,
  company_name text,
  verified boolean default false not null,
  trust_score integer default 95 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.director_profiles enable row level security;

-- 5. CASTING ROLES TABLE (Posted by Directors)
create table public.roles (
  id uuid default uuid_generate_v4() primary key,
  director_id uuid references public.users(id) on delete cascade not null,
  project_title text not null,
  role_title text not null,
  category text not null,
  age_range text not null,
  gender text not null,
  language text not null,
  location text not null,
  description text not null,
  requirements text not null,
  deadline date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.roles enable row level security;

-- 6. AUDITION APPLICATIONS TABLE (Submitted by Actors)
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  role_id uuid references public.roles(id) on delete cascade not null,
  actor_id uuid references public.users(id) on delete cascade not null,
  video_url text not null,
  status text check (status in ('Submitted', 'Viewed', 'Under Review', 'Shortlisted', 'Rejected', 'Meeting Scheduled')) default 'Submitted' not null,
  viewed boolean default false not null,
  shortlisted boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(role_id, actor_id) -- Prevent double applications to same role
);

alter table public.applications enable row level security;

-- ==========================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Profiles
create policy "Public profiles are viewable by anyone." on public.users 
  for select using (true);

create policy "Users can update their own profile." on public.users 
  for update using (auth.uid() = id);

-- Actor Profiles
create policy "Actor profiles are viewable by anyone." on public.actor_profiles 
  for select using (true);

create policy "Actors can update their own profile." on public.actor_profiles 
  for update using (auth.uid() = user_id);

-- Director Profiles
create policy "Director profiles are viewable by anyone." on public.director_profiles 
  for select using (true);

-- Roles
create policy "Roles are viewable by anyone." on public.roles 
  for select using (true);

create policy "Directors can insert their own roles." on public.roles 
  for insert with check (auth.uid() = director_id);

create policy "Directors can update their own roles." on public.roles 
  for update using (auth.uid() = director_id);

-- Applications
create policy "Actors can view their own applications." on public.applications 
  for select using (auth.uid() = actor_id);

create policy "Directors can view applications for their roles." on public.applications 
  for select using (
    exists (
      select 1 from public.roles r 
      where r.id = applications.role_id and r.director_id = auth.uid()
    )
  );

create policy "Actors can submit applications." on public.applications 
  for insert with check (auth.uid() = actor_id);

create policy "Directors can update status of applications." on public.applications 
  for update using (
    exists (
      select 1 from public.roles r 
      where r.id = applications.role_id and r.director_id = auth.uid()
    )
  );
