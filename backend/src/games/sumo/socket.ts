import { Server, Socket } from "socket.io";
import { binanceService } from "../../services/binance";
import { calculateSumoPhysics, resetGame } from "./engine";

export const setupSumoSocket = (io: Server) => {
  const sumoNamespace = io.of("/sumo");

  // 바이낸스 데이터가 들어올 때마다 물리엔진 돌리고 -> 클라이언트에 전송
  binanceService.subscribe((bids, asks) => {
    const state = calculateSumoPhysics(bids, asks);

    // 휘발성 데이터(Volatile)로 전송 (네트워크 밀리면 옛날 데이터는 버림)
    sumoNamespace.volatile.emit("game_update", state);
  });

  sumoNamespace.on("connection", (socket: Socket) => {
    console.log(`User entered Sumo Arena: ${socket.id}`);

    // 새 유저 오면 현재 상태 전송
    socket.emit("game_update", calculateSumoPhysics([], []));

    // (관리자용 임시) 게임 리셋 버튼 기능
    socket.on("reset_game", () => {
      resetGame();
      io.of("/sumo").emit("game_reset");
    });

    socket.on("disconnect", () => {
      console.log(`User left Sumo Arena: ${socket.id}`);
    });
  });
};
