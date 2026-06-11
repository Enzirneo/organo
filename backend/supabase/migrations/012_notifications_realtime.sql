-- Organo - Habilita Realtime para a tabela notifications
-- Necessário para o sino de notificações receber atualizações em tempo real.

alter publication supabase_realtime add table public.notifications;
