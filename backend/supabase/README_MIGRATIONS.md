# Organo Supabase Migrations

## Ordem recomendada

### Banco novo/resetado
Rode nesta ordem:

1. `000_schema_v2_base.sql`
2. `001_auth_profile_bootstrap.sql`
3. `002_rls_helpers_and_policies.sql`
4. `003_user_team_contexts_view.sql`
5. `004_account_first_create_team_rpc.sql`
6. `005_invite_acceptance_rpc.sql`
7. `006_games_seed.sql`

### Banco que já existe
Se o schema principal já está criado, rode:

1. `001_auth_profile_bootstrap.sql`
2. `002_rls_helpers_and_policies.sql`
3. `003_user_team_contexts_view.sql`
4. `004_account_first_create_team_rpc.sql`
5. `005_invite_acceptance_rpc.sql`
6. `006_games_seed.sql`

## O que mudou

- A conta nasce sem organização obrigatória.
- `profiles` agora aceita `nickname`.
- `handle_new_user()` cria profile com nome/nickname/email.
- `user_team_contexts` foi recriada com `security_invoker = true`.
- `create_team_workspace()` cria organização interna + time + vínculo owner.
- `accept_team_invite()` permite jogador aceitar convite sem criar organização.

## O que NÃO é migration

`diagnostics/diagnostics.sql` é só para consulta e investigação. Não coloque ele como migration automática.

## Observação sobre apagar conta e recriar mesmo e-mail

Para conseguir recriar uma conta com o mesmo e-mail, apague o usuário em `Authentication > Users`. Como `profiles.id` referencia `auth.users(id) on delete cascade`, o profile deve cair junto quando a exclusão é feita pelo Auth. Se ainda houver problema, confira se há sessão antiga no navegador e limpe Local Storage.
