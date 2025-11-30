export interface ColiPlayer {
  id: string;
  name: string;
  side: 'LONG' | 'SHORT' | 'NONE'; // 포지션
  entryPrice: number;
  pnl: number;        // 수익률 (%)
  isReady: boolean;   // 매칭 후 준비 완료 여부
}

export interface GameRoom {
  roomId: string;
  playerA: ColiPlayer;
  playerB: ColiPlayer;
  startTime: number;
  endTime: number;
  isActive: boolean;
  winnerId: string | null;
}

// 대기열 (간단한 선입선출 큐)
let queue: string[] = [];
// 진행 중인 게임 방들
const rooms: Record<string, GameRoom> = {};
// 유저가 속한 방 ID 매핑
const userRoomMap: Record<string, string> = {};

// 큐에 입장
export const joinQueue = (socketId: string) => {
  if (!queue.includes(socketId) && !userRoomMap[socketId]) {
    queue.push(socketId);
    return true;
  }
  return false;
};

// 큐에서 퇴장
export const leaveQueue = (socketId: string) => {
  queue = queue.filter(id => id !== socketId);
};

// 매칭 시도 (2명이 모이면 방 생성)
export const tryMatch = (): GameRoom | null => {
  if (queue.length < 2) return null;

  const p1 = queue.shift()!;
  const p2 = queue.shift()!;
  const roomId = `room-${Date.now()}`;

  const room: GameRoom = {
    roomId,
    playerA: { id: p1, name: 'Gladiator A', side: 'NONE', entryPrice: 0, pnl: 0, isReady: false },
    playerB: { id: p2, name: 'Gladiator B', side: 'NONE', entryPrice: 0, pnl: 0, isReady: false },
    startTime: 0,
    endTime: 0,
    isActive: false,
    winnerId: null
  };

  rooms[roomId] = room;
  userRoomMap[p1] = roomId;
  userRoomMap[p2] = roomId;

  return room;
};

// 게임 시작 (포지션 진입)
export const setPlayerReady = (socketId: string, side: 'LONG' | 'SHORT', currentPrice: number) => {
  const roomId = userRoomMap[socketId];
  if (!roomId) return null;
  
  const room = rooms[roomId];
  if (!room) return null;

  const player = room.playerA.id === socketId ? room.playerA : room.playerB;
  player.side = side;
  player.entryPrice = currentPrice;
  player.isReady = true;

  // 둘 다 준비되면 게임 시작 (10초 카운트다운)
  if (room.playerA.isReady && room.playerB.isReady && !room.isActive) {
    room.isActive = true;
    room.startTime = Date.now();
    room.endTime = Date.now() + 10000; // 10초 승부
  }

  return room;
};

// 게임 루프 (PnL 계산)
export const updateRoomLoop = (roomId: string, currentPrice: number) => {
  const room = rooms[roomId];
  if (!room || !room.isActive) return room;

  // 시간 종료 체크
  if (Date.now() >= room.endTime) {
    room.isActive = false;
    // 수익률 높은 사람이 승리
    if (room.playerA.pnl > room.playerB.pnl) room.winnerId = room.playerA.id;
    else if (room.playerB.pnl > room.playerA.pnl) room.winnerId = room.playerB.id;
    else room.winnerId = 'DRAW';
    
    return room;
  }

  // PnL 계산 (레버리지 1000배)
  [room.playerA, room.playerB].forEach(p => {
    let rawPnl = 0;
    if (p.side === 'LONG') rawPnl = (currentPrice - p.entryPrice) / p.entryPrice;
    if (p.side === 'SHORT') rawPnl = (p.entryPrice - currentPrice) / p.entryPrice;
    
    p.pnl = rawPnl * 1000 * 100; // 1000x Leverage (%)
  });

  return room;
};

// 유저 연결 해제 처리
export const handleDisconnect = (socketId: string) => {
  leaveQueue(socketId);
  const roomId = userRoomMap[socketId];
  if (roomId) {
    delete rooms[roomId];
    delete userRoomMap[socketId];
    // 상대방에게도 알림 처리 필요 (Socket 쪽에서 처리)
    return roomId;
  }
  return null;
};