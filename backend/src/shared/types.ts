export interface Player {
  id: string;
  address: string;
  balance: number;
}

export interface GameSession {
  id: string;
  game: string;
  players: Player[];
  status: "active" | "finished" | "cancelled";
  createdAt: number;
}

export interface BetResult {
  playerAddress: string;
  winAmount: number;
  multiplier: number;
}
