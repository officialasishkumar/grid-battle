import { create } from "zustand";
import { nakama } from "../services/nakama";
import {
  OpCode,
  Mark,
  Phase,
  GameMode,
} from "../types/game";
import type {
  StateUpdate,
  GameOverData,
  PlayerInfo,
} from "../types/game";

interface GameState {
  // Match state
  matchId: string | null;
  board: Mark[];
  currentTurn: string;
  players: Record<string, PlayerInfo>;
  phase: Phase;
  moveCount: number;
  gameMode: GameMode;
  turnTimeLimit: number;
  turnRemainingMs: number;
  myMark: Mark;

  // Game over
  winner: string | null;
  winningCells: number[] | null;
  isDraw: boolean;
  gameOverReason: string | null;

  // UI state
  isSearching: boolean;
  isJoining: boolean;
  error: string | null;

  // Actions
  findMatch: (mode: GameMode) => Promise<void>;
  joinMatch: (matchId: string) => Promise<void>;
  makeMove: (position: number) => void;
  leaveMatch: () => void;
  resetGame: () => void;
}

const EMPTY_BOARD: Mark[] = Array(9).fill(Mark.EMPTY);

export const useGameStore = create<GameState>((set, get) => ({
  matchId: null,
  board: [...EMPTY_BOARD],
  currentTurn: "",
  players: {},
  phase: Phase.WAITING,
  moveCount: 0,
  gameMode: GameMode.CLASSIC,
  turnTimeLimit: 0,
  turnRemainingMs: 0,
  myMark: Mark.EMPTY,
  winner: null,
  winningCells: null,
  isDraw: false,
  gameOverReason: null,
  isSearching: false,
  isJoining: false,
  error: null,

  findMatch: async (mode: GameMode) => {
    set({ isSearching: true, error: null });
    try {
      const result = await nakama.rpc<{ matchId: string; created: boolean }>(
        "find_match",
        { gameMode: mode }
      );
      await get().joinMatch(result.matchId);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to find match",
        isSearching: false,
      });
    }
  },

  joinMatch: async (matchId: string) => {
    const socket = nakama.socket;
    if (!socket) {
      set({ error: "Not connected", isSearching: false });
      return;
    }

    set({ isJoining: true, error: null });

    try {
      // Set up message handlers before joining
      socket.onmatchdata = (result) => {
        const data = JSON.parse(
          new TextDecoder().decode(result.data as Uint8Array)
        );

        switch (result.op_code) {
          case OpCode.STATE_UPDATE: {
            const update = data as StateUpdate;
            const myUserId = nakama.userId;
            let myMark: Mark = Mark.EMPTY;
            if (myUserId && update.players[myUserId]) {
              myMark = update.players[myUserId].mark;
            }
            set({
              board: update.board,
              currentTurn: update.currentTurn,
              players: update.players,
              phase: update.phase,
              moveCount: update.moveCount,
              gameMode: update.gameMode,
              turnTimeLimit: update.turnTimeLimit,
              turnRemainingMs: update.turnRemainingMs,
              myMark,
            });
            break;
          }

          case OpCode.GAME_OVER: {
            const gameOver = data as GameOverData;
            set({
              board: gameOver.board,
              winner: gameOver.winner,
              winningCells: gameOver.winningCells,
              isDraw: gameOver.isDraw,
              phase: Phase.FINISHED,
              gameOverReason: (data as GameOverData & { reason?: string }).reason || null,
            });
            break;
          }

          case OpCode.TURN_TIMER: {
            set({ turnRemainingMs: data.remainingMs });
            break;
          }

          case OpCode.MOVE_REJECTED: {
            set({ error: `Move rejected: ${data.reason}` });
            setTimeout(() => set({ error: null }), 2000);
            break;
          }

          case OpCode.OPPONENT_LEFT: {
            // Handled via GAME_OVER
            break;
          }
        }
      };

      const match = await socket.joinMatch(matchId);
      set({
        matchId: match.match_id,
        isSearching: false,
        isJoining: false,
        phase: Phase.WAITING,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to join match",
        isSearching: false,
        isJoining: false,
      });
    }
  },

  makeMove: (position: number) => {
    const { matchId, phase, currentTurn, board } = get();
    const socket = nakama.socket;
    const userId = nakama.userId;

    if (!socket || !matchId || !userId) return;
    if (phase !== Phase.PLAYING) return;
    if (currentTurn !== userId) return;
    if (board[position] !== Mark.EMPTY) return;

    socket.sendMatchState(matchId, OpCode.MOVE, JSON.stringify({ position }));
  },

  leaveMatch: () => {
    const { matchId } = get();
    const socket = nakama.socket;

    if (socket && matchId) {
      socket.leaveMatch(matchId);
    }

    get().resetGame();
  },

  resetGame: () => {
    set({
      matchId: null,
      board: [...EMPTY_BOARD],
      currentTurn: "",
      players: {},
      phase: Phase.WAITING,
      moveCount: 0,
      turnRemainingMs: 0,
      myMark: Mark.EMPTY,
      winner: null,
      winningCells: null,
      isDraw: false,
      gameOverReason: null,
      isSearching: false,
      isJoining: false,
      error: null,
    });
  },
}));
