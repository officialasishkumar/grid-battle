/** Op codes for match data messages between client and server. */
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

/** Marks on the board. */
export enum Mark {
  EMPTY = 0,
  X = 1,
  O = 2,
}

/** Game phase lifecycle. */
export enum Phase {
  WAITING = 0,
  PLAYING = 1,
  FINISHED = 2,
}

/** Game mode variants. */
export enum GameMode {
  CLASSIC = "classic",
  TIMED = "timed",
}

/** Per-player state tracked inside a match. */
export interface PlayerState {
  odid: string;
  odisplayName: string;
  mark: Mark;
  joinedAt: number;
}

/** Full authoritative match state held on the server. */
export interface MatchState {
  board: Mark[];
  players: { [userId: string]: PlayerState };
  playerOrder: string[];      // [X-player-id, O-player-id]
  currentTurn: string;        // userId whose turn it is
  phase: Phase;
  winner: string | null;
  winningCells: number[] | null;
  isDraw: boolean;
  moveCount: number;
  gameMode: GameMode;
  turnTimeLimit: number;      // seconds (0 = unlimited)
  turnStartTick: number;      // tick when current turn started
  tickRate: number;
  rematchRequested: string | null;
  label: MatchLabel;
}

/** Match label exposed for listing/querying matches. */
export interface MatchLabel {
  gameMode: GameMode;
  playerCount: number;
  open: boolean;
}

/** Client-to-server move payload. */
export interface MoveMessage {
  position: number; // 0–8
}

/** Server-to-client state update. */
export interface StateUpdateMessage {
  board: Mark[];
  currentTurn: string;
  players: { [userId: string]: { mark: Mark; displayName: string } };
  phase: Phase;
  moveCount: number;
  gameMode: GameMode;
  turnTimeLimit: number;
  turnRemainingMs: number;
}

/** Server-to-client game over. */
export interface GameOverMessage {
  winner: string | null;
  winningCells: number[] | null;
  isDraw: boolean;
  board: Mark[];
}

/** Leaderboard record keys. */
export const LEADERBOARD_ID = "global_rankings";
export const STATS_COLLECTION = "player_stats";
export const STATS_KEY = "stats";

/** Player stats stored in Nakama storage. */
export interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  totalGames: number;
}
