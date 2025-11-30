export type PositionType = 'LONG' | 'SHORT' | 'NONE';

export interface RektPlayer {
  id: string;
  balance: number;       // 사용 가능한 현금 잔고
  positionType: PositionType;
  entryPrice: number;    // 진입 가격
  positionSize: number;  // 투입 원금 (Margin)
  leverage: number;      // 레버리지 (1x ~ 100x)
  totalEquity: number;   // 총 자산 (잔고 + 평가금)
  roi: number;           // 전체 수익률 (시드머니 대비)
  lastPnL: number;       // 마지막 거래 손익 (팝업용)
}

const players: Record<string, RektPlayer> = {};
const INITIAL_SEED = 1000;

// 유저 초기화
export const addPlayer = (id: string) => {
  if (!players[id]) {
    players[id] = {
      id,
      balance: INITIAL_SEED,
      positionType: 'NONE',
      entryPrice: 0,
      positionSize: 0,
      leverage: 1,
      totalEquity: INITIAL_SEED,
      roi: 0,
      lastPnL: 0
    };
  }
};

export const removePlayer = (id: string) => {
  delete players[id];
};

// 포지션 오픈 (레버리지 적용)
export const openPosition = (id: string, type: PositionType, currentPrice: number, amount: number, leverage: number) => {
  const player = players[id];
  if (!player || player.positionType !== 'NONE') return; 
  
  // 잔고 확인 및 차감
  if (amount > player.balance) amount = player.balance;
  if (amount <= 0) return;

  player.balance -= amount;
  player.positionType = type;
  player.entryPrice = currentPrice;
  player.positionSize = amount;
  player.leverage = leverage; // 레버리지 저장
};

// 포지션 종료 (청산)
export const closePosition = (id: string, currentPrice: number) => {
  const player = players[id];
  if (!player || player.positionType === 'NONE') return;

  let pnlPercent = 0;
  if (player.positionType === 'LONG') {
    pnlPercent = (currentPrice - player.entryPrice) / player.entryPrice;
  } else {
    pnlPercent = (player.entryPrice - currentPrice) / player.entryPrice;
  }

  // 레버리지 적용된 손익금 계산
  const pnlAmount = player.positionSize * pnlPercent * player.leverage;

  // 원금 + 손익 환급
  player.balance += (player.positionSize + pnlAmount);
  player.lastPnL = pnlAmount;

  // 상태 초기화
  player.positionType = 'NONE';
  player.entryPrice = 0;
  player.positionSize = 0;
  player.leverage = 1;
};

// 게임 루프 업데이트 (실시간 PnL 계산)
export const updateGameLoop = (currentPrice: number) => {
  if (currentPrice === 0) return [];

  const leaderboard = Object.values(players).map(player => {
    let unrealizedPnL = 0;

    if (player.positionType !== 'NONE') {
      let pnlPercent = 0;
      if (player.positionType === 'LONG') {
        pnlPercent = (currentPrice - player.entryPrice) / player.entryPrice;
      } else {
        pnlPercent = (player.entryPrice - currentPrice) / player.entryPrice;
      }
      unrealizedPnL = player.positionSize * pnlPercent * player.leverage;
    }

    // 총 자산 = 현금 잔고 + 증거금 + 미실현 손익
    player.totalEquity = player.balance + player.positionSize + unrealizedPnL;
    
    // 수익률 계산
    player.roi = ((player.totalEquity - INITIAL_SEED) / INITIAL_SEED) * 100;

    return player;
  });

  // 수익률이 낮은 순서대로 정렬 (마이너스가 1등)
  leaderboard.sort((a, b) => a.roi - b.roi);

  return leaderboard;
};