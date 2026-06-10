-- Organo - Correção de recursão infinita nas policies de treino
-- Algumas policies de training_sessions e training_participants
-- estavam se referenciando mutuamente, causando:
-- infinite recursion detected in policy for relation "training_sessions"

drop policy if exists "training_select_allowed"
on public.training_sessions;

drop policy if exists "training_manage_leader"
on public.training_sessions;

drop policy if exists "training_participants_select_allowed"
on public.training_participants;

drop policy if exists "training_participants_manage_leader"
on public.training_participants;

create policy "training_select_allowed"
on public.training_sessions
for select
to authenticated
using (
  public.can_manage_team(team_id)
  or public.is_team_member(team_id)
);

create policy "training_manage_leader"
on public.training_sessions
for all
to authenticated
using (
  public.can_manage_team(team_id)
)
with check (
  public.can_manage_team(team_id)
);

create policy "training_participants_select_allowed"
on public.training_participants
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.training_sessions ts
    join public.team_members tm
      on tm.team_id = ts.team_id
    where ts.id = training_participants.training_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
);

create policy "training_participants_manage_leader"
on public.training_participants
for all
to authenticated
using (
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
