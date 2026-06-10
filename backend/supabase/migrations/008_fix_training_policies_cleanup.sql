-- Organo - Limpeza total e recriação das policies de treino
-- Corrige problema de:
-- infinite recursion detected in policy for relation "training_sessions"
--
-- Algumas policies antigas estavam sobrevivendo no banco
-- e causando referências cruzadas infinitas entre:
-- training_sessions
-- training_participants

-- =========================================================
-- REMOVER POLICIES EXISTENTES
-- =========================================================

drop policy if exists "training_select_allowed"
on public.training_sessions;

drop policy if exists "training_manage_leader"
on public.training_sessions;

drop policy if exists "training_participants_select_allowed"
on public.training_participants;

drop policy if exists "training_participants_manage_leader"
on public.training_participants;

-- =========================================================
-- REMOVER QUALQUER POLICY ANTIGA RESTANTE
-- =========================================================

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

-- =========================================================
-- RECRIAR POLICIES LIMPAS
-- =========================================================

create policy "training_sessions_select"
on public.training_sessions
for select
to authenticated
using (
    public.is_team_member(team_id)
    or public.can_manage_team(team_id)
);

create policy "training_sessions_manage"
on public.training_sessions
for all
to authenticated
using (
    public.can_manage_team(team_id)
)
with check (
    public.can_manage_team(team_id)
);

create policy "training_participants_select"
on public.training_participants
for select
to authenticated
using (
    user_id = auth.uid()
);

create policy "training_participants_manage"
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
