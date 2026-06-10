-- Organo - Queries de diagnóstico
-- Não é migration. Use só para investigar.

-- Ver policies de organizations
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'organizations';

-- Ver usuário/profile por e-mail
-- Troque pelo e-mail desejado.
select u.id as auth_user_id, u.email as auth_email, p.id as profile_id, p.display_name, p.nickname
from auth.users u
left join public.profiles p on p.id = u.id
where lower(u.email) = lower('SEU_EMAIL_AQUI');

-- Ver contextos por usuário
-- Troque pelo UUID do usuário.
select *
from public.user_team_contexts
where user_id = 'SEU_USER_ID_AQUI';

-- Ver vínculos diretos do usuário
select *
from public.team_members
where user_id = 'SEU_USER_ID_AQUI';

select *
from public.organization_members
where user_id = 'SEU_USER_ID_AQUI';
