export interface Fighter {
  id: string;
  address: string;
  bet: number;
}

export class Matchmaker {
  private queue: Fighter[] = [];

  enqueue(fighter: Fighter) {
    this.queue.push(fighter);
  }

  findMatch(): [Fighter, Fighter] | null {
    if (this.queue.length < 2) return null;
    const p1 = this.queue.shift()!;
    const p2 = this.queue.shift()!;
    return [p1, p2];
  }
}
