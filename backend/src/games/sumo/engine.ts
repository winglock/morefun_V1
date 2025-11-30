// backend/src/games/sumo/engine.ts

// 1. State 인터페이스 정의
export interface SumoState {
  position: number; // -100 (매도승) ~ 0 (중앙) ~ +100 (매수승)
  velocity: number;
  winner: 'RED' | 'GREEN' | null;
}

// 2. 초기 상태
let currentState: SumoState = {
  position: 0,
  velocity: 0,
  winner: null
};

// 3. 물리 엔진 함수 (bids와 asks는 문자열 배열의 배열입니다)
export const calculateSumoPhysics = (bids: string[][], asks: string[][]) => {
  if (currentState.winner) return currentState; // 게임 끝났으면 멈춤

  // 데이터가 비어있을 경우 방어 코드
  if (!bids || !asks || bids.length === 0 || asks.length === 0) {
    return currentState;
  }

  // 1. 상위 10개 호가의 총 물량 계산
  const totalBids = bids.reduce((acc, curr) => acc + parseFloat(curr[1]), 0);
  const totalAsks = asks.reduce((acc, curr) => acc + parseFloat(curr[1]), 0);

  // 0으로 나누기 방지
  if (totalBids + totalAsks === 0) return currentState;

  // 2. 압력 공식 (Net Pressure): -1 ~ +1 사이 값
  // 매수세가 세면 양수(+), 매도세가 세면 음수(-)
  const pressure = (totalBids - totalAsks) / (totalBids + totalAsks);

  // 3. 위치 이동 (감도 조절: SpeedFactor = 5)
  // 압력이 셀수록 더 빨리 밀림
  currentState.velocity = pressure * 5;
  currentState.position += currentState.velocity;

  // 4. 경계 체크 및 승리 판정
  if (currentState.position >= 100) {
    currentState.position = 100;
    currentState.winner = 'GREEN'; // 매수 승 (롱)
  } else if (currentState.position <= -100) {
    currentState.position = -100;
    currentState.winner = 'RED';   // 매도 승 (숏)
  }

  return currentState;
};

// 게임 리셋 함수
export const resetGame = () => {
  currentState = { position: 0, velocity: 0, winner: null };
};