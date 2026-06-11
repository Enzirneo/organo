-- Organo - Policy de DELETE para times
-- A migration 002 criou policies de SELECT, INSERT e UPDATE para teams,
-- mas não incluiu DELETE. Sem essa policy, a deleção falha com erro 403 (RLS).

drop policy if exists "teams_delete_leader" on public.teams;

create policy "teams_delete_leader" on public.teams
for delete to authenticated
using (public.can_manage_team(id));
