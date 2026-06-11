-- Organo - Corrige accept_team_invite e cria buckets de storage
-- 1. Adiciona set row_security = off para evitar erro "column reference team_id is ambiguous"
--    (a função já valida token, email e expiração manualmente)
-- 2. Cria buckets públicos team-logos e avatars se não existirem

create or replace function public.accept_team_invite(p_token text)
returns table (
  team_id uuid,
  role public.team_role
)
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_user_id uuid;
  v_email text;
  v_invite public.team_invites%rowtype;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Usuário não autenticado.' using errcode = '28000';
  end if;

  select email into v_email from public.profiles where id = v_user_id;

  if v_email is null then
    select email into v_email from auth.users where id = v_user_id;
  end if;

  select * into v_invite
  from public.team_invites ti
  where ti.token = p_token
    and ti.accepted_at is null
    and ti.expires_at > now()
  limit 1;

  if not found then
    raise exception 'Convite inválido ou expirado.' using errcode = '22023';
  end if;

  if lower(v_invite.invited_email) <> lower(v_email) then
    raise exception 'Este convite pertence a outro e-mail.' using errcode = '42501';
  end if;

  insert into public.team_members (team_id, user_id, role, status)
  values (v_invite.team_id, v_user_id, v_invite.role, 'active')
  on conflict (team_id, user_id) do update set
    role = excluded.role,
    status = 'active';

  update public.team_invites
  set accepted_by = v_user_id,
      accepted_at = now()
  where id = v_invite.id;

  team_id := v_invite.team_id;
  role := v_invite.role;
  return next;
end;
$$;

grant execute on function public.accept_team_invite(text) to authenticated;

-- Buckets de storage
insert into storage.buckets (id, name, public)
values ('team-logos', 'team-logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Policies de storage para team-logos
drop policy if exists "team_logos_select_public" on storage.objects;
drop policy if exists "team_logos_insert_authenticated" on storage.objects;
drop policy if exists "team_logos_update_authenticated" on storage.objects;
drop policy if exists "team_logos_delete_authenticated" on storage.objects;

create policy "team_logos_select_public" on storage.objects
for select using (bucket_id = 'team-logos');

create policy "team_logos_insert_authenticated" on storage.objects
for insert to authenticated with check (bucket_id = 'team-logos');

create policy "team_logos_update_authenticated" on storage.objects
for update to authenticated using (bucket_id = 'team-logos');

create policy "team_logos_delete_authenticated" on storage.objects
for delete to authenticated using (bucket_id = 'team-logos');

-- Policies de storage para avatars
drop policy if exists "avatars_select_public" on storage.objects;
drop policy if exists "avatars_insert_authenticated" on storage.objects;
drop policy if exists "avatars_update_authenticated" on storage.objects;
drop policy if exists "avatars_delete_authenticated" on storage.objects;

create policy "avatars_select_public" on storage.objects
for select using (bucket_id = 'avatars');

create policy "avatars_insert_authenticated" on storage.objects
for insert to authenticated with check (bucket_id = 'avatars');

create policy "avatars_update_authenticated" on storage.objects
for update to authenticated using (bucket_id = 'avatars');

create policy "avatars_delete_authenticated" on storage.objects
for delete to authenticated using (bucket_id = 'avatars');
