import type { Player, Team, Training } from "@/shared/types";

const portrait = (seed: string) => `https://i.pravatar.cc/200?u=${seed}`;

export const TEAMS: Team[] = [
  { id: "t1", name: "Phantom Squad", description: "Elenco principal de Valorant focado em torneios sul-americanos.", game: "valorant", status: "ativo", members: ["p1", "p2", "p3", "p4", "p5"], createdAt: "2025-01-12" },
  { id: "t2", name: "Nexus Wolves", description: "Lineup competitiva de LoL com foco em CBLOL Academy.", game: "lol", status: "ativo", members: ["p6", "p7", "p8", "p9", "p10"], createdAt: "2025-02-04" },
  { id: "t3", name: "Blackline CS", description: "Roster veterano com mira em ranking ESEA.", game: "cs2", status: "ativo", members: ["p11", "p12", "p13"], createdAt: "2024-11-22" },
  { id: "t4", name: "Aether Rivals", description: "Formação inicial para o cenário Marvel Rivals.", game: "marvelrivals", status: "em-construcao", members: ["p14", "p15"], createdAt: "2026-03-10" },
  { id: "t5", name: "Rocket Surge", description: "Trio com presença em RLCS Open.", game: "rocketleague", status: "ativo", members: ["p16", "p17", "p18"], createdAt: "2025-08-02" },
];

export const PLAYERS: Player[] = [
  { id: "p1", nick: "kazu", fullName: "Lucas Kazu", role: "Duelista", image: portrait("kazu"), game: "valorant", teamId: "t1", status: "ativo", joinedAt: "2025-01-12" },
  { id: "p2", nick: "vyn", fullName: "Henrique Vyn", role: "Controlador", image: portrait("vyn"), game: "valorant", teamId: "t1", status: "ativo", joinedAt: "2025-01-12" },
  { id: "p3", nick: "n0va", fullName: "Maria Nova", role: "Sentinela", image: portrait("nova"), game: "valorant", teamId: "t1", status: "ativo", joinedAt: "2025-01-15" },
  { id: "p4", nick: "drxz", fullName: "Daniel Cruz", role: "Iniciador", image: portrait("drxz"), game: "valorant", teamId: "t1", status: "ativo", joinedAt: "2025-02-02" },
  { id: "p5", nick: "shyro", fullName: "Eric Shyro", role: "IGL", image: portrait("shyro"), game: "valorant", teamId: "t1", status: "reserva", joinedAt: "2025-03-10" },
  { id: "p6", nick: "Yumi", fullName: "Yumi Tanaka", role: "Top Laner", image: portrait("yumi"), game: "lol", teamId: "t2", status: "ativo", joinedAt: "2025-02-04" },
  { id: "p7", nick: "Korin", fullName: "Korin Vale", role: "Jungler", image: portrait("korin"), game: "lol", teamId: "t2", status: "ativo", joinedAt: "2025-02-04" },
  { id: "p8", nick: "Aether", fullName: "André Lima", role: "Mid Laner", image: portrait("aether"), game: "lol", teamId: "t2", status: "ativo", joinedAt: "2025-02-04" },
  { id: "p9", nick: "Volt", fullName: "Vitor Olt", role: "ADC", image: portrait("volt"), game: "lol", teamId: "t2", status: "ativo", joinedAt: "2025-02-10" },
  { id: "p10", nick: "Sable", fullName: "Sara Bel", role: "Support", image: portrait("sable"), game: "lol", teamId: "t2", status: "afastado", joinedAt: "2025-02-10" },
  { id: "p11", nick: "frostz", fullName: "Felipe Rost", role: "AWPer", image: portrait("frostz"), game: "cs2", teamId: "t3", status: "ativo", joinedAt: "2024-11-22" },
  { id: "p12", nick: "ravo", fullName: "Rafael Avo", role: "Entry Fragger", image: portrait("ravo"), game: "cs2", teamId: "t3", status: "ativo", joinedAt: "2024-11-22" },
  { id: "p13", nick: "lokk", fullName: "Lucas Okk", role: "IGL", image: portrait("lokk"), game: "cs2", teamId: "t3", status: "ativo", joinedAt: "2024-12-01" },
  { id: "p14", nick: "rivex", fullName: "Renata Vex", role: "Vanguard", image: portrait("rivex"), game: "marvelrivals", teamId: "t4", status: "ativo", joinedAt: "2026-03-10" },
  { id: "p15", nick: "halo", fullName: "Heitor Alo", role: "Strategist", image: portrait("halo"), game: "marvelrivals", teamId: "t4", status: "ativo", joinedAt: "2026-03-10" },
  { id: "p16", nick: "boost", fullName: "Bruno Oost", role: "Striker", image: portrait("boost"), game: "rocketleague", teamId: "t5", status: "ativo", joinedAt: "2025-08-02" },
  { id: "p17", nick: "spin", fullName: "Sofia Pin", role: "Midfielder", image: portrait("spin"), game: "rocketleague", teamId: "t5", status: "ativo", joinedAt: "2025-08-02" },
  { id: "p18", nick: "wallz", fullName: "William Allz", role: "Goalkeeper", image: portrait("wallz"), game: "rocketleague", teamId: "t5", status: "ativo", joinedAt: "2025-08-02" },
];

export const TRAININGS: Training[] = [
  { id: "tr1", title: "Scrim oficial vs Loud Academy", date: "2026-05-06", time: "20:00", game: "valorant", objective: "Validar composição em Ascent e Lotus.", type: "scrim", participants: ["p1","p2","p3","p4","p5"], teamId: "t1" },
  { id: "tr2", title: "VOD Review – Bind", date: "2026-05-07", time: "18:30", game: "valorant", objective: "Revisar execuções de bomb A.", type: "vod-review", participants: ["p1","p2","p3","p4"], teamId: "t1" },
  { id: "tr3", title: "Treino tático – Dragon Soul", date: "2026-05-08", time: "19:00", game: "lol", objective: "Setups de visão no objetivo.", type: "tatica", participants: ["p6","p7","p8","p9","p10"], teamId: "t2" },
  { id: "tr4", title: "Aim training individual", date: "2026-05-09", time: "15:00", game: "cs2", objective: "Rotina de mira longa.", type: "individual", participants: ["p11","p12"], teamId: "t3" },
  { id: "tr5", title: "Scrim Rocket Surge", date: "2026-05-10", time: "21:00", game: "rocketleague", objective: "Rotações 1-2-3 em pressão.", type: "scrim", participants: ["p16","p17","p18"], teamId: "t5" },
  { id: "tr6", title: "Reunião estratégica Rivals", date: "2026-05-11", time: "17:00", game: "marvelrivals", objective: "Definir core de heróis.", type: "tatica", participants: ["p14","p15"], teamId: "t4" },
];