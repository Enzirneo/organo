-- Organo - Fix ambiguidade PL/pgSQL na accept_team_invite e MIME types dos buckets
-- 1. #variable_conflict use_column resolve ambiguidade entre variáveis de saída (team_id, role)
--    e colunas da tabela team_members no ON CONFLICT e DO UPDATE SET
-- 2. allowed_mime_types = null aceita qualquer formato de imagem (limite de 5MB mantido)

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
#variable_conflict use_column
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

update storage.buckets
set allowed_mime_types = null
where id in ('team-logos', 'avatars');
