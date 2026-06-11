-- Organo - Tabela de notificações internas
-- Usada para notificar usuários já cadastrados sobre convites de time.
-- A inserção é feita via trigger trg_team_invite_notify (security definer),
-- sem necessidade de policy de INSERT no frontend.

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null,                        -- 'team_invite'
  title       text not null,
  body        text,
  data        jsonb not null default '{}'::jsonb,   -- { invite_token, team_id, role }
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notifications_user_unread
  on public.notifications(user_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

create policy "notifications_select_self" on public.notifications
  for select to authenticated using (user_id = auth.uid());

create policy "notifications_update_self" on public.notifications
  for update to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications_delete_self" on public.notifications
  for delete to authenticated using (user_id = auth.uid());

-- Trigger: ao criar um convite, notifica usuário já cadastrado automaticamente
create or replace function public.notify_team_invite()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_user_id   uuid;
  v_team_name text;
begin
  select p.id into v_user_id
  from public.profiles p
  where lower(p.email) = lower(NEW.invited_email)
  limit 1;

  if v_user_id is null then return NEW; end if;

  select name into v_team_name from public.teams where id = NEW.team_id;

  insert into public.notifications (user_id, type, title, body, data)
  values (
    v_user_id,
    'team_invite',
    'Convite de time',
    format('Você foi convidado para o time %s.', v_team_name),
    jsonb_build_object('invite_token', NEW.token, 'team_id', NEW.team_id, 'role', NEW.role::text)
  );

  return NEW;
end;
$$;

create trigger trg_team_invite_notify
  after insert on public.team_invites
  for each row execute function public.notify_team_invite();
