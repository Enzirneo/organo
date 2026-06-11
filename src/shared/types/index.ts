export type TeamRole = "owner" | "leader" | "coach" | "analyst" | "player";

export type GameId =
  | "valorant"
  | "lol"
  | "cs2"
  | "dota2"
  | "overwatch"
  | "rocketleague"
  | "marvelrivals";

export interface Game {
  id: GameId;
  name: string;
  short: string;
  image: string;
  accent: string;
}

export type PlayerStatus = "ativo" | "reserva" | "afastado";
export type TeamStatus = "ativo" | "em-construcao" | "encerrado";
export type TrainingType = "scrim" | "vod-review" | "tatica" | "individual";

export interface Player {
  id: string;
  userId: string;
  nick: string;
  fullName?: string;
  role: string;
  image: string;
  game: GameId;
  teamId?: string;
  status: PlayerStatus;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  game: GameId;
  status: TeamStatus;
  members: string[];
  createdAt: string;
  logoUrl?: string;
  myRole?: TeamRole;
}

export interface Training {
  id: string;
  title: string;
  date: string;
  time: string;
  game: GameId;
  objective: string;
  type: TrainingType;
  participants: string[];
  teamId?: string;
}