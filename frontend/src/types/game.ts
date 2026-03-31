/** Must stay in sync with backend/src/types.ts */

export const OpCode = {
  MOVE: 1,
  STATE_UPDATE: 2,
  GAME_OVER: 3,
  MOVE_REJECTED: 4,
  OPPONENT_JOINED: 5,
  OPPONENT_LEFT: 6,
  TURN_TIMER: 7,
  REMATCH_REQUEST: 8,
  REMATCH_ACCEPTED: 9,
} as const;

export const Mark = {
  EMPTY: 0,
  X: 1,
  O: 2,
} as const;
export type Mark = (typeof Mark)[keyof typeof Mark];

export const Phase = {
  WAITING: 0,
  PLAYING: 1,
  FINISHED: 2,
} as const;
export type Phase = (typeof Phase)[keyof typeof Phase];

export const GameMode = {
  CLASSIC: "classic",
  TIMED: "timed",
} as const;
export type GameMode = (typeof GameMode)[keyof typeof GameMode];

export interface PlayerInfo {
  mark: Mark;
  displayName: string;
}

export interface StateUpdate {
  board: Mark[];
  currentTurn: string;
  players: Record<string, PlayerInfo>;
  phase: Phase;
  moveCount: number;
  gameMode: GameMode;
  turnTimeLimit: number;
  turnRemainingMs: number;
}

export interface GameOverData {
  winner: string | null;
  winningCells: number[] | null;
  isDraw: boolean;
  board: Mark[];
  reason?: string;
}

export interface MatchInfo {
  matchId: string;
  playerCount: number;
  gameMode: GameMode;
  open: boolean;
}

export interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  totalGames: number;
}
