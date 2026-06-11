-- Organo - Adiciona logo_url à tabela teams
-- Necessário para upload de logo no fluxo de criação/edição de times.

alter table public.teams add column if not exists logo_url text;
