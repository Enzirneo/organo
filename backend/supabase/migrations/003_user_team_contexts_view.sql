-- Organo - View de contextos do usuário
-- Necessária para o front montar o seletor: Time A - Coach, Time B - Player, etc.

-- Usa drop/recreate para garantir que a view não fique como SECURITY DEFINER.
drop view if exists public.user_team_contexts;

create view public.user_team_contexts
with (security_invoker = true)
as
select
  tm.user_id,
  tm.team_id,
  tm.role as team_role,
  tm.status as member_status,
  t.name as team_name,
  t.organization_id,
  o.name as organization_name,
  t.game_id,
  g.name as game_name
from public.team_members tm
join public.teams t on t.id = tm.team_id
join public.organizations o on o.id = t.organization_id
join public.games g on g.id = t.game_id
where tm.status = 'active';

grant select on public.user_team_contexts to authenticated;
