import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import Tile from "./Tile";

export default function DeathFunBoard() {
  const { socket } = useSocket();
  const [tiles, setTiles] = useState<boolean[]>(Array(25).fill(false));
  const [gameActive, setGameActive] = useState(false);

  useEffect(() => {
    socket?.on("deathfun:board", (data) => {
      setTiles(Array(25).fill(false));
      setGameActive(true);
    });

    socket?.on("deathfun:result", (data) => {
      setTiles(prev => {
        const next = [...prev];
        next[data.index] = data.isMine;
        return next;
      });
      if (data.isMine) setGameActive(false);
    });
  }, [socket]);

  const handleStart = () => {
    socket?.emit("deathfun:start", { bet: 100 });
  };

  const handleClick = (index: number) => {
    if (gameActive) {
      socket?.emit("deathfun:click", { index });
    }
  };

  return (
    <div className="p-4">
      <button onClick={handleStart} className="mb-4 bg-green-600 text-white px-4 py-2 rounded">
        Start Game
      </button>
      <div className="grid grid-cols-5 gap-2">
        {tiles.map((isMine, i) => (
          <Tile key={i} isMine={isMine} onClick={() => handleClick(i)} />
        ))}
      </div>
    </div>
  );
}
