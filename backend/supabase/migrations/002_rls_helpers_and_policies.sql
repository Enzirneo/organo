-- Organo - RLS helpers e policies consolidadas
-- Pode ser rodado em banco existente. Remove policies antigas conflitantes e recria o conjunto atual.
-- Corrige recursão infinita entre training_sessions e training_participants.

create or replace function public.is_org_member(org_id uuid, roles public.org_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.status = 'active'
      and (roles is null or om.role = any(roles))
  );
$$;

create or replace function public.is_team_member(p_team_id uuid, roles public.team_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members tm
    where tm.team_id = p_team_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
      and (roles is null or tm.role = any(roles))
  );
$$;

create or replace function public.can_manage_team(p_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_team_member(p_team_id, array['owner','leader','coach']::public.team_role[])
     or exists (
       select 1
       from public.teams t
       where t.id = p_team_id
         and public.is_org_member(t.organization_id, array['owner','admin','leader']::public.org_role[])
     );
$$;

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.game_accounts enable row level security;
alter table public.training_sessions enable row level security;
alter table public.training_participants enable row level security;
alter table public.team_invites enable row level security;

-- Drop policies conhecidas para evitar duplicação/conflito.
drop policy if exists "profiles_select_self_or_shared_team" on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;

drop policy if exists "games_select_authenticated" on public.games;

drop policy if exists "organizations_select_member" on public.organizations;
drop policy if exists "Authenticated users can create organizations" on public.organizations;
drop policy if exists "organizations_insert_owner" on public.organizations;
drop policy if exists "organizations_manage_owner_admin" on public.organizations;

drop policy if exists "org_members_select_same_org" on public.organization_members;
drop policy if exists "org_members_select_self" on public.organization_members;
drop policy if exists "org_members_manage_admin" on public.organization_members;
drop policy if exists "org_members_insert_owner_bootstrap" on public.organization_members;

drop policy if exists "teams_select_member" on public.teams;
drop policy if exists "teams_insert_org_leader" on public.teams;
drop policy if exists "teams_manage_leader" on public.teams;

drop policy if exists "team_members_select_team" on public.team_members;
drop policy if exists "team_members_select_self" on public.team_members;
drop policy if exists "team_members_manage_leader" on public.team_members;
drop policy if exists "team_members_insert_invited_self" on public.team_members;

drop policy if exists "game_accounts_select_self_or_manager" on public.game_accounts;
drop policy if exists "game_accounts_manage_self" on public.game_accounts;

drop policy if exists "training_select_allowed" on public.training_sessions;
drop policy if exists "training_manage_leader" on public.training_sessions;
drop policy if exists "training_sessions_select" on public.training_sessions;
drop policy if exists "training_sessions_manage" on public.training_sessions;

drop policy if exists "training_participants_select_allowed" on public.training_participants;
drop policy if exists "training_participants_manage_leader" on public.training_participants;
drop policy if exists "training_participants_select" on public.training_participants;
drop policy if exists "training_participants_manage" on public.training_participants;

drop policy if exists "team_invites_select_manager" on public.team_invites;
drop policy if exists "team_invites_manage_leader" on public.team_invites;

-- Remove qualquer policy antiga restante nas tabelas de treino.
-- Isso evita que policies criadas com outro nome mantenham a recursão viva.
do $$
declare
  r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'training_sessions'
  loop
    execute format(
      'drop policy if exists %I on public.training_sessions',
      r.policyname
    );
  end loop;

  for r in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'training_participants'
  loop
    execute format(
      'drop policy if exists %I on public.training_participants',
      r.policyname
    );
  end loop;
end $$;

-- Profiles
create policy "profiles_select_self_or_shared_team" on public.profiles
for select to authenticated using (
  id = auth.uid()
  or exists (
    select 1
    from public.team_members my_tm
    join public.team_members other_tm on other_tm.team_id = my_tm.team_id
    where my_tm.user_id = auth.uid()
      and other_tm.user_id = profiles.id
      and my_tm.status = 'active'
      and other_tm.status = 'active'
  )
);

create policy "profiles_update_self" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_insert_self" on public.profiles
for insert to authenticated with check (id = auth.uid());

-- Games
create policy "games_select_authenticated" on public.games
for select to authenticated using (true);

-- Organizations
create policy "organizations_select_member" on public.organizations
for select to authenticated using (public.is_org_member(id));

create policy "organizations_insert_owner" on public.organizations
for insert to authenticated with check (owner_id = auth.uid());

create policy "organizations_manage_owner_admin" on public.organizations
for update to authenticated using (public.is_org_member(id, array['owner','admin']::public.org_role[]))
with check (public.is_org_member(id, array['owner','admin']::public.org_role[]));

-- Organization members
create policy "org_members_select_same_org" on public.organization_members
for select to authenticated using (public.is_org_member(organization_id));

create policy "org_members_select_self" on public.organization_members
for select to authenticated using (user_id = auth.uid());

create policy "org_members_manage_admin" on public.organization_members
for all to authenticated using (public.is_org_member(organization_id, array['owner','admin']::public.org_role[]))
with check (public.is_org_member(organization_id, array['owner','admin']::public.org_role[]));

create policy "org_members_insert_owner_bootstrap" on public.organization_members
for insert to authenticated with check (
  user_id = auth.uid()
  and role = 'owner'
  and exists (
    select 1 from public.organizations o
    where o.id = organization_id
      and o.owner_id = auth.uid()
  )
);

-- Teams
create policy "teams_select_member" on public.teams
for select to authenticated using (
  public.is_team_member(id)
  or public.is_org_member(organization_id, array['owner','admin','leader']::public.org_role[])
);

create policy "teams_insert_org_leader" on public.teams
for insert to authenticated with check (public.is_org_member(organization_id, array['owner','admin','leader']::public.org_role[]));

create policy "teams_manage_leader" on public.teams
for update to authenticated using (public.can_manage_team(id))
with check (public.can_manage_team(id));

-- Team members
create policy "team_members_select_team" on public.team_members
for select to authenticated using (public.is_team_member(team_id) or public.can_manage_team(team_id));

create policy "team_members_select_self" on public.team_members
for select to authenticated using (user_id = auth.uid());

create policy "team_members_manage_leader" on public.team_members
for all to authenticated using (public.can_manage_team(team_id))
with check (public.can_manage_team(team_id));

create policy "team_members_insert_invited_self" on public.team_members
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.team_invites ti
    join public.profiles p on p.id = auth.uid()
    where ti.team_id = team_members.team_id
      and lower(ti.invited_email) = lower(p.email)
      and ti.role = team_members.role
      and ti.accepted_at is null
      and ti.expires_at > now()
  )
);

-- Game accounts
create policy "game_accounts_select_self_or_manager" on public.game_accounts
for select to authenticated using (
  user_id = auth.uid()
  or exists (
    select 1 from public.team_members tm
    where tm.user_id = game_accounts.user_id
      and tm.status = 'active'
      and public.can_manage_team(tm.team_id)
  )
);

create policy "game_accounts_manage_self" on public.game_accounts
for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Training sessions
-- Importante:
-- Esta policy NÃO consulta training_participants.
-- Isso evita recursão com as policies de training_participants.
create policy "training_select_allowed" on public.training_sessions
for select to authenticated using (
  public.can_manage_team(team_id)
  or public.is_team_member(team_id)
);

create policy "training_manage_leader" on public.training_sessions
for all to authenticated using (
  public.can_manage_team(team_id)
)
with check (
  public.can_manage_team(team_id)
);

-- Training participants
-- Importante:
-- O select simples permite o usuário ver apenas a própria participação.
-- Managers continuam conseguindo gerenciar participantes pela policy de manage.
create policy "training_participants_select_allowed" on public.training_participants
for select to authenticated using (
  user_id = auth.uid()
);

create policy "training_participants_manage_leader" on public.training_participants
for all to authenticated using (
  exists (
    select 1
    from public.training_sessions ts
    where ts.id = training_participants.training_id
      and public.can_manage_team(ts.team_id)
  )
)
with check (
  exists (
    select 1
    from public.training_sessions ts
    where ts.id = training_participants.training_id
      and public.can_manage_team(ts.team_id)
  )
);

-- Invites
create policy "team_invites_select_manager" on public.team_invites
for select to authenticated using (
  public.can_manage_team(team_id)
  or lower(invited_email) = lower((select email from public.profiles where id = auth.uid()))
);

create policy "team_invites_manage_leader" on public.team_invites
for all to authenticated using (public.can_manage_team(team_id))
with check (public.can_manage_team(team_id));
