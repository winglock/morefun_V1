import React from 'react';
// @ alias 대신 상대 경로를 사용하여 확실하게 파일을 찾습니다.
import BombGame from '../components/games/bomb/BombGame';

export default function BombPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-10">
      <h1 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 mb-2 drop-shadow-sm">
        TICK TOCK BOMB 💣
      </h1>
      <p className="text-center text-slate-400 mb-8 font-medium">
        Hold for 10% profit/sec. Pass before it explodes!
      </p>
      <BombGame />
    </div>
  );
}