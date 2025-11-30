# MoreFun Project

**git clone https://github.com/winglock/morefun_V1.git**

Web3 기반 멀티 게임 플랫폼 - MemeCore

## 게임 종류

- **데스펀**: 지뢰 찾기
- **오더북 스모**: 바이낸스 오더북 기반 팀 배틀
- **Rekt Race**: 가격 추적 수익률 경쟁
- **콜로세움**: 1vs1 PvP
- **폭탄 돌리기**: 랜덤 타이머 생존 게임

- 기본적으로 모든 온체인적 상호작용은 결과를 밈코어테넷에 제출하는 형태로해서 타협

## 구조

- **contracts/**: Hardhat 스마트 컨트랙트
- **backend/**: Node.js Socket.io 게임 서버
- **frontend/**: Next.js 클라이언트


```
morefun-project/
├── contracts/                  # [Web3] Smart Contracts
│   ├── contracts/              # Solidity Files (.sol)
│   └── scripts/                # Deploy Scripts
│
├── backend/                    # [Server] Node.js Game Server
│   ├── src/
│   │   ├── games/              # 게임별 독립 로직 (bomb, sumo...)
│   │   ├── services/           # 외부 연동 (Binance, Web3)
│   │   └── app.ts              # Entry Point
│   └── package.json
│
└── frontend/                   # [Client] Next.js App
    ├── src/
    │   ├── components/         # UI 컴포넌트
    │   ├── pages/              # 라우팅
    │   └── styles/             # Tailwind CSS
    └── package.json
```

설치 및 실행 (Installation)

이 프로젝트는 Monorepo 구조로 되어 있습니다.

1. 사전 준비

Node.js (v18 이상 권장)

npm 또는 yarn

2. 패키지 설치

각 폴더에서 의존성을 설치합니다.

# 백엔드 설치
cd backend
npm install

# 프론트엔드 설치
cd ../frontend
npm install


3. 개발 서버 실행 (Development)

두 개의 터미널을 열어 각각 실행해주세요.

Terminal 1 (Backend):

cd backend
npm run dev
# Server running on http://localhost:3001


Terminal 2 (Frontend):

cd frontend
npm run dev
# Client running on http://localhost:3000


향후 해야하는거

게임에 관한 보완점

데스펀 선택지 줄어들었다 늘어나기, 배팅시 배율
오더북 스모 실제 스모마냥 밀치는 애니메이션추 현재는 단순 bar 형태
rekt race 클릭해도 포지션 알열림 + 현재 포지션 안보임 고치기
콜로세움 연결오류 계속뜸
폭탄돌리기 좀 더 가꿔나가야할듯?

UIUX적 보완점 및 추가할점또는 아이디어

지갑 여러개 깔려있음 충돌나서 지갑연결 안됨
밈코어 테넷 연결하는거 추가하기
밈코어 테넷에 결과제출하는거 추가하기
기본적인 분위기는 데스펀파쿠리? 색 조합추천은 네온느낌의 보라랑 검정 위주로
데스펀도 좀 투팍한 느낌 나는데 어떻게 해야지 싼마이 느낌을 없에버릴 수 있을지 고민좀 해야할거같음

