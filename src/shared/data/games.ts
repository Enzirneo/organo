import valorant from "@/assets/games/valorant.png";
import lol from "@/assets/games/lol.jpeg";
import cs2 from "@/assets/games/CS2.png";
import dota2 from "@/assets/games/dota2.png";
import overwatch from "@/assets/games/overwatch.png";
import rocketleague from "@/assets/games/rocketleague.png";
import marvelrivals from "@/assets/games/marvelrivals.png";
import type { Game, GameId } from "@/shared/types";

export const GAMES: Game[] = [
  { id: "valorant", name: "Valorant", short: "VAL", image: valorant, accent: "#ff4655" },
  { id: "lol", name: "League of Legends", short: "LoL", image: lol, accent: "#c89b3c" },
  { id: "cs2", name: "Counter-Strike 2", short: "CS2", image: cs2, accent: "#f5a524" },
  { id: "dota2", name: "Dota 2", short: "DOTA", image: dota2, accent: "#a31919" },
  { id: "overwatch", name: "Overwatch 2", short: "OW2", image: overwatch, accent: "#f99e1a" },
  { id: "rocketleague", name: "Rocket League", short: "RL", image: rocketleague, accent: "#1f8eff" },
  { id: "marvelrivals", name: "Marvel Rivals", short: "MR", image: marvelrivals, accent: "#b14cff" },
];

export const getGame = (id: GameId) => GAMES.find((g) => g.id === id)!;