import { randomRange } from "../../shared/utils";

export type GameState = 'PLAYING' | 'EXPLODED' | 'WON' | 'CASHED_OUT';

export interface GameSession {
  id: string;
  levels: number[]; // 각 층의 정답(해골 위치) 인덱스 (0~3) - 클라이언트에 안 보냄!
  currentLevel: number; // 현재 유저가 도전 중인 층 (0 = 1층)
  status: GameState;
  history: number[]; // 유저가 선택한 칸 기록
}

// 게임 생성 (해골 위치 랜덤 배정)
export const createGame = (id: string): GameSession => {
  const levels = Array.from({ length: 5 }, () => Math.floor(Math.random() * 4));
  // 예: [0, 3, 1, 2, 0] -> 1층은 0번이 해골, 2층은 3번이 해골...

  return {
    id,
    levels,
    currentLevel: 0,
    status: 'PLAYING',
    history: []
  };
};

// 선택 결과 판정
export const processMove = (game: GameSession, selectedIndex: number) => {
  const bombIndex = game.levels[game.currentLevel];

  if (selectedIndex === bombIndex) {
    // 펑! 해골을 밟음
    game.status = 'EXPLODED';
    return { success: false, bombIndex };
  } else {
    // 통과!
    game.history.push(selectedIndex);
    game.currentLevel++;

    if (game.currentLevel >= 5) {
      game.status = 'WON';
    }
    return { success: true };
  }
};

export class DeathFunLogic {
  private gridSize: number = 5;
  private mineCount: number = 5;
  private mines: Set<number> = new Set();

  generateMines(): void {
    this.mines.clear();
    while (this.mines.size < this.mineCount) {
      this.mines.add(randomRange(0, this.gridSize * this.gridSize - 1));
    }
  }

  checkTile(index: number): boolean {
    return this.mines.has(index);
  }

  getMines(): Set<number> {
    return this.mines;
  }
}
