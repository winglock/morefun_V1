import { Server, Socket } from "socket.io";
import { createGame, processMove, GameSession } from "./logic";

// 간단한 메모리 저장소 (DB 대신 사용)
const sessions: Record<string, GameSession> = {};

export const setupDeathFunSocket = (io: Server) => {
  const deathFunNamespace = io.of("/deathfun"); // 네임스페이스 분리

  deathFunNamespace.on("connection", (socket: Socket) => {
    console.log(`User connected to DeathFun: ${socket.id}`);

    // 게임 시작 요청
    socket.on("start_game", () => {
      const session = createGame(socket.id);
      sessions[socket.id] = session;

      // 클라이언트에는 초기 상태만 전송 (정답 제외)
      socket.emit("game_started", {
        currentLevel: 0,
        history: [],
      });
    });

    // 칸 선택 요청
    socket.on("select_tile", (tileIndex: number) => {
      const session = sessions[socket.id];
      if (!session || session.status !== "PLAYING") return;

      const result = processMove(session, tileIndex);

      if (result.success) {
        socket.emit("move_result", {
          success: true,
          currentLevel: session.currentLevel,
          history: session.history,
          status: session.status,
        });
      } else {
        socket.emit("move_result", {
          success: false,
          bombIndex: result.bombIndex, // 죽었을 때만 정답 공개
          status: session.status,
          allBombs: session.levels, // (선택) 죽으면 전체 맵 공개
        });
        delete sessions[socket.id]; // 세션 종료
      }
    });

    socket.on("disconnect", () => {
      delete sessions[socket.id];
    });
  });
};
