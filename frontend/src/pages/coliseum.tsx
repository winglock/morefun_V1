import React from 'react';
// @ 기호 대신 상대 경로(..)를 사용하여 확실하게 불러옵니다.
import ColiseumGame from '../components/games/coliseum/ColiseumGame';

export default function ColiseumPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-10">
      <ColiseumGame />
    </div>
  );
}