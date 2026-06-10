-- Organo - Auth profile bootstrap account-first
-- Atualiza o trigger de cadastro para criar profile com nome/nickname/email, sem organização obrigatória.

alter table public.profiles
  add column if not exists nickname text;

create unique index if not exists profiles_nickname_lower_unique
on public.profiles (lower(nickname))
where nickname is not null and length(trim(nickname)) > 0;

create index if not exists profiles_email_lower_idx
on public.profiles (lower(email));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_name text;
  v_full_name text;
  v_nickname text;
begin
  v_full_name := nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')), '');
  v_nickname := nullif(trim(coalesce(new.raw_user_meta_data->>'nickname', new.raw_user_meta_data->>'user_name')), '');
  v_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    v_full_name,
    v_nickname,
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, display_name, nickname, full_name, email, avatar_url)
  values (
    new.id,
    v_display_name,
    v_nickname,
    v_full_name,
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    nickname = coalesce(excluded.nickname, public.profiles.nickname),
    full_name = excluded.full_name,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Backfill: cria profile para usuários antigos que existem em auth.users mas não existem em public.profiles.
insert into public.profiles (id, display_name, full_name, email, avatar_url)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'full_name',
  u.email,
  u.raw_user_meta_data->>'avatar_url'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
