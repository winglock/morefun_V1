// frontend/src/pages/rektrace.tsx
import React from 'react';
import RektGame from '../components/games/rektrace/RektGame';

export default function RektPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-10">
      <RektGame />
    </div>
  );
}