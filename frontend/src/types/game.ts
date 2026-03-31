/** Must stay in sync with backend/src/types.ts */

export enum OpCode {
  MOVE = 1,
  STATE_UPDATE = 2,
  GAME_OVER = 3,
  MOVE_REJECTED = 4,
  OPPONENT_JOINED = 5,
  OPPONENT_LEFT = 6,
  TURN_TIMER = 7,
  REMATCH_REQUEST = 8,
  REMATCH_ACCEPTED = 9,
}

export enum Mark {
  EMPTY = 0,
  X = 1,
  O = 2,
}

export enum Phase {
  WAITING = 0,
  PLAYING = 1,
  FINISHED = 2,
}

export enum GameMode {
  CLASSIC = "classic",
  TIMED = "timed",
}

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

export interface LeaderboardRecord {
  ownerId: string;
  username: string;
  score: number;
  subscore: number;
  rank: number;
  stats?: PlayerStats;
}
