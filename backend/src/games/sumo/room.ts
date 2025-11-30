export interface SumoPlayer {
  id: string;
  address: string;
  bet: number;
}

export class SumoRoom {
  private redTeam: SumoPlayer[] = [];
  private greenTeam: SumoPlayer[] = [];

  joinRed(player: SumoPlayer) {
    this.redTeam.push(player);
  }

  joinGreen(player: SumoPlayer) {
    this.greenTeam.push(player);
  }

  getTeams() {
    return { red: this.redTeam, green: this.greenTeam };
  }

  getTotalBet(team: "red" | "green"): number {
    const players = team === "red" ? this.redTeam : this.greenTeam;
    return players.reduce((sum, p) => sum + p.bet, 0);
  }
}
