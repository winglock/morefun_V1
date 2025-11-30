import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function SumoRing() {
  const { socket } = useSocket();
  const [redTeam, setRedTeam] = useState([]);
  const [greenTeam, setGreenTeam] = useState([]);

  useEffect(() => {
    socket?.on("sumo:teams", (data) => {
      setRedTeam(data.red);
      setGreenTeam(data.green);
    });
  }, [socket]);

  return (
    <div className="flex justify-around p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600">Red Team</h2>
        <div className="mt-4 text-4xl">🔴</div>
        <p className="mt-2">{redTeam.length} players</p>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-600">Green Team</h2>
        <div className="mt-4 text-4xl">🟢</div>
        <p className="mt-2">{greenTeam.length} players</p>
      </div>
    </div>
  );
}
