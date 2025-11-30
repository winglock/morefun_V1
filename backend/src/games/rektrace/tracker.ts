export interface RaceParticipant {
  id: string;
  address: string;
  entryPrice: number;
  currentPrice: number;
  profitPercent: number;
}

export class RektTracer {
  private participants: Map<string, RaceParticipant> = new Map();

  addParticipant(id: string, address: string, entryPrice: number) {
    this.participants.set(id, {
      id,
      address,
      entryPrice,
      currentPrice: entryPrice,
      profitPercent: 0
    });
  }

  updatePrice(price: number) {
    this.participants.forEach(p => {
      p.currentPrice = price;
      p.profitPercent = ((price - p.entryPrice) / p.entryPrice) * 100;
    });
  }

  getRanking(): RaceParticipant[] {
    return Array.from(this.participants.values())
      .sort((a, b) => b.profitPercent - a.profitPercent);
  }
}
