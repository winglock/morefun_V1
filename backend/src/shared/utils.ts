export function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomBool(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

export function generateSessionKey(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export class GameError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}
