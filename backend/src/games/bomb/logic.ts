export interface BombPlayer {
  id: string;
  name: string;
  balance: number;
  roundProfit: number;
  isDead: boolean;
  isBot: boolean;
}

export interface BombState {
  holderId: string | null;
  isActive: boolean;
  roundStartTime: number;
  explosionTime: number;
  nextBotActionTime: number;
}

const players: Record<string, BombPlayer> = {};
let gameState: BombState = {
  holderId: null,
  isActive: false,
  roundStartTime: 0,
  explosionTime: 0,
  nextBotActionTime: 0
};

// 봇 생성 함수
export const addBots = (count: number) => {
  for (let i = 1; i <= count; i++) {
    const botId = `bot-${Date.now()}-${i}`;
    players[botId] = {
      id: botId,
      name: `🤖 Bot-${i}`,
      balance: 1000,
      roundProfit: 0,
      isDead: false,
      isBot: true
    };
  }
};

export const addPlayer = (id: string) => {
  if (!players[id]) {
    players[id] = {
      id,
      name: `User-${id.slice(0, 4)}`,
      balance: 1000,
      roundProfit: 0,
      isDead: false,
      isBot: false
    };
  }
};

export const removePlayer = (id: string) => {
  delete players[id];
  if (gameState.holderId === id) {
    gameState.holderId = null;
    gameState.isActive = false;
  }
};

export const startGame = () => {
  // ★ 10명의 봇 추가 (요청사항 반영)
  const botCount = Object.values(players).filter(p => p.isBot).length;
  if (botCount === 0) {
    addBots(10);
  }

  const playerIds = Object.keys(players);
  if (playerIds.length < 2) return false;

  const randomIdx = Math.floor(Math.random() * playerIds.length);
  const startHolderId = playerIds[randomIdx];
  gameState.holderId = startHolderId;

  const duration = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
  
  gameState.roundStartTime = Date.now();
  gameState.explosionTime = Date.now() + (duration * 1000);
  gameState.isActive = true;

  if (players[startHolderId].isBot) {
    gameState.nextBotActionTime = Date.now() + Math.random() * 2000 + 1000;
  }

  Object.values(players).forEach(p => {
    p.roundProfit = 0;
    p.isDead = false;
  });

  return true;
};

export const passBomb = (fromId: string) => {
  if (!gameState.isActive || gameState.holderId !== fromId) return false;

  const playerIds = Object.keys(players).filter(id => id !== fromId && !players[id].isDead);
  if (playerIds.length === 0) return false;

  const targetId = playerIds[Math.floor(Math.random() * playerIds.length)];
  gameState.holderId = targetId;

  if (players[targetId].isBot) {
    gameState.nextBotActionTime = Date.now() + Math.random() * 2000 + 1000;
  }

  return true;
};

export const updateBombLoop = () => {
  if (!gameState.isActive || !gameState.holderId) return { exploded: false, players, bombPassed: false };

  const now = Date.now();
  let bombPassed = false;

  if (now >= gameState.explosionTime) {
    const victim = players[gameState.holderId];
    if (victim) {
      victim.isDead = true;
      victim.balance -= 500;
      victim.roundProfit = 0;
    }
    gameState.isActive = false;
    gameState.holderId = null;
    return { exploded: true, players, victimId: victim?.id, bombPassed: false };
  }

  const holder = players[gameState.holderId];
  if (holder && holder.isBot && !holder.isDead) {
    if (now >= gameState.nextBotActionTime) {
      passBomb(holder.id);
      bombPassed = true;
    }
  }

  const currentHolder = players[gameState.holderId!];
  if (currentHolder && !bombPassed) {
    if (currentHolder.roundProfit === 0) currentHolder.roundProfit = 100;
    currentHolder.roundProfit = Math.floor(currentHolder.roundProfit * 1.1);
  }

  return { exploded: false, players, bombPassed };
};

export const settleSurvivors = () => {
  Object.values(players).forEach(p => {
    if (!p.isDead && p.roundProfit > 0) {
      p.balance += p.roundProfit;
      p.roundProfit = 0;
    }
  });
};