-- Organo - Seeds de jogos

insert into public.games (id, name, short_name, accent_color) values
  ('valorant', 'Valorant', 'VAL', '#ff4655'),
  ('lol', 'League of Legends', 'LoL', '#c89b3c'),
  ('cs2', 'Counter-Strike 2', 'CS2', '#f0a500'),
  ('dota2', 'Dota 2', 'DOTA', '#a1362a'),
  ('overwatch', 'Overwatch 2', 'OW2', '#f99e1a'),
  ('rocketleague', 'Rocket League', 'RL', '#0071ce'),
  ('marvelrivals', 'Marvel Rivals', 'MR', '#f6c945')
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  accent_color = excluded.accent_color;
