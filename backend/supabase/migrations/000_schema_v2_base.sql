-- Organo / Elo Organizer - schema v2 base para Supabase
-- Use este arquivo apenas em banco novo ou ambiente resetado.

create extension if not exists "pgcrypto";

-- Tipos
do $$ begin
  create type public.org_role as enum ('owner', 'admin', 'leader', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.team_role as enum ('owner', 'leader', 'coach', 'analyst', 'player');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.member_status as enum ('active', 'invited', 'inactive', 'removed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.training_type as enum ('scrim', 'vod_review', 'tactical', 'individual', 'meeting', 'simulation');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.training_visibility as enum ('team', 'selected');
exception when duplicate_object then null; end $$;

-- Perfil do usuário autenticado. Conta nasce neutra: sem organização obrigatória.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  nickname text,
  full_name text,
  email text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_nickname_lower_unique
on public.profiles (lower(nickname))
where nickname is not null and length(trim(nickname)) > 0;

create index if not exists profiles_email_lower_idx
on public.profiles (lower(email));

create table if not exists public.games (
  id text primary key,
  name text not null,
  short_name text,
  image_url text,
  accent_color text,
  created_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text unique,
  description text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.org_role not null default 'member',
  status public.member_status not null default 'active',
  joined_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  game_id text not null references public.games(id),
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'building', 'archived')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.team_role not null default 'player',
  status public.member_status not null default 'active',
  position text,
  joined_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create table if not exists public.game_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id text not null references public.games(id),
  nickname text not null,
  external_id text,
  rank text,
  region text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, game_id, nickname)
);

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  title text not null,
  description text,
  objective text,
  type public.training_type not null default 'tactical',
  visibility public.training_visibility not null default 'team',
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'done', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_participants (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.training_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  attendance_status text not null default 'pending' check (attendance_status in ('pending', 'confirmed', 'declined', 'attended', 'missed')),
  notes text,
  created_at timestamptz not null default now(),
  unique (training_id, user_id)
);

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  invited_email text not null,
  invited_by uuid not null references public.profiles(id),
  role public.team_role not null default 'player',
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  accepted_by uuid references public.profiles(id),
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index if not exists idx_org_members_user on public.organization_members(user_id);
create index if not exists idx_teams_org on public.teams(organization_id);
create index if not exists idx_team_members_user on public.team_members(user_id);
create index if not exists idx_team_members_team on public.team_members(team_id);
create index if not exists idx_team_members_user_status on public.team_members(user_id, status);
create index if not exists idx_game_accounts_user_game on public.game_accounts(user_id, game_id);
create index if not exists idx_training_team_date on public.training_sessions(team_id, starts_at);
create index if not exists idx_training_participants_user on public.training_participants(user_id);
create index if not exists idx_team_invites_email_lower on public.team_invites(lower(invited_email));

insert into public.games (id, name, short_name, accent_color) values
  ('valorant', 'Valorant', 'VAL', '#ff4655'),
  ('lol', 'League of Legends', 'LoL', '#c89b3c'),
  ('cs2', 'Counter-Strike 2', 'CS2', '#f0a500'),
  ('dota2', 'Dota 2', 'DOTA', '#a1362a'),
  ('overwatch', 'Overwatch 2', 'OW2', '#f99e1a'),
  ('rocketleague', 'Rocket League', 'RL', '#0071ce'),
  ('marvelrivals', 'Marvel Rivals', 'MR', '#f6c945')
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  accent_color = excluded.accent_color;
