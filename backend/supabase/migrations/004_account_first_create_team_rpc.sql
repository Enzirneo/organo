-- Organo - RPC para fluxo account-first
-- Conta nasce sem organização. Quando o usuário cria o primeiro time, esta função cria uma organização interna e o coloca como owner/líder.

create or replace function public.create_team_workspace(
  p_team_name text,
  p_game_id text,
  p_description text default null,
  p_organization_name text default null
)
returns table (
  organization_id uuid,
  team_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_org_id uuid;
  v_team_id uuid;
  v_org_name text;
  v_team_name text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Usuário não autenticado.' using errcode = '28000';
  end if;

  v_team_name := nullif(trim(p_team_name), '');

  if v_team_name is null then
    raise exception 'Nome do time é obrigatório.' using errcode = '22023';
  end if;

  insert into public.profiles (id, display_name, email)
  select u.id, coalesce(split_part(u.email, '@', 1), 'Usuário'), u.email
  from auth.users u
  where u.id = v_user_id
  on conflict (id) do nothing;

  if not exists (select 1 from public.games g where g.id = p_game_id) then
    raise exception 'Jogo inválido: %', p_game_id using errcode = '22023';
  end if;

  select o.id
  into v_org_id
  from public.organizations o
  where o.owner_id = v_user_id
  order by o.created_at asc
  limit 1;

  if v_org_id is null then
    v_org_name := coalesce(nullif(trim(p_organization_name), ''), 'Organo Workspace');

    insert into public.organizations (owner_id, name)
    values (v_user_id, v_org_name)
    returning id into v_org_id;
  end if;

  insert into public.organization_members (organization_id, user_id, role, status)
  values (v_org_id, v_user_id, 'owner', 'active')
  on conflict (organization_id, user_id) do update set
    role = 'owner',
    status = 'active';

  insert into public.teams (organization_id, game_id, name, description, created_by, status)
  values (v_org_id, p_game_id, v_team_name, p_description, v_user_id, 'active')
  returning id into v_team_id;

  insert into public.team_members (team_id, user_id, role, status)
  values (v_team_id, v_user_id, 'owner', 'active')
  on conflict (team_id, user_id) do update set
    role = 'owner',
    status = 'active';

  organization_id := v_org_id;
  team_id := v_team_id;

  return next;
end;
$$;

grant execute on function public.create_team_workspace(text, text, text, text) to authenticated;