# Como montar o Organo separado

1. Crie uma pasta chamada `organo`.
2. Extraia `organo-root-config.zip` dentro dela.
3. Extraia `organo-public.zip` dentro dela.
4. Extraia `organo-src.zip` dentro dela.
5. Extraia `organo-backend-supabase.zip` dentro dela, se quiser manter a pasta `/backend` e `/docs`.
6. Rode:

```bash
npm install
npm run dev
```

A aplicação ainda está em modo demo/mock, mas já está organizada para trocar os repositories por Supabase.
