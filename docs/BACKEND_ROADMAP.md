# Backend Roadmap

## Etapa 1: Mock funcional
O front usa dados locais para validar UX, rotas privadas e papéis.

## Etapa 2: Supabase Auth
Criar projeto no Supabase, preencher `.env.local` e trocar o mock auth por `supabase.auth`.

## Etapa 3: Banco com RLS
Rodar `backend/supabase/schema.sql` no SQL Editor do Supabase.

## Etapa 4: Repositories reais
Trocar os serviços mockados por chamadas ao Supabase.

## Hospedagem gratuita
- Front-end: Vercel Hobby
- Auth + Banco: Supabase Free
