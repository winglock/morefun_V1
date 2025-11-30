import React from 'react';
import DeathFunBoard from '../components/games/deathfun/GameBoard'; // 경로 수정됨

export default function DeathFunPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8">
        MemeCore Testnet Alpha
      </h1>
      <DeathFunBoard />
    </div>
  );
}
