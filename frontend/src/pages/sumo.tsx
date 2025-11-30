import React from 'react';
import SumoGame from '../components/games/sumo/SumoGame';

export default function SumoPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <SumoGame />
    </div>
  );
}
