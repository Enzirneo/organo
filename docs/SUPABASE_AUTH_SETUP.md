# Configuração do Supabase Auth para o Organo

## 1. Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto usando `.env.example` como base:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_SUA_CHAVE_PUBLICA
```

Use a `Publishable key`. Não use `Secret key` no front-end.

## 2. Configuração no painel do Supabase

No painel do Supabase:

```txt
Authentication > Sign In / Providers > Email
```

Ative:

```txt
Enable Email provider
Confirm email
```

Depois vá em:

```txt
Authentication > URL Configuration
```

Em desenvolvimento, configure:

```txt
Site URL:
http://localhost:5173

Redirect URLs:
http://localhost:5173/auth/callback
http://localhost:5173/**
```

Quando publicar, adicione também seu domínio real:

```txt
https://seu-dominio.com/auth/callback
https://seu-dominio.com/**
```

## 3. SQL importante

Se você já rodou o schema principal antes, rode também:

```txt
backend/supabase/migrations/20260505_auth_email_profile.sql
```

Esse arquivo cria o profile automático quando uma conta nova é criada no Supabase Auth.

## 4. Rodar localmente

```bash
npm install
npm run dev
```

Fluxo esperado:

```txt
Criar conta > receber e-mail > clicar no link > voltar para /auth/callback > entrar no dashboard
```
