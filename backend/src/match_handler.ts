import {
  OpCode,
  Mark,
  Phase,
  GameMode,
  MatchState,
  MatchLabel,
  MoveMessage,
  StateUpdateMessage,
  GameOverMessage,
  LEADERBOARD_ID,
  STATS_COLLECTION,
  STATS_KEY,
  PlayerStats,
} from "./types";

/** All eight possible winning lines on a 3x3 board. */
const WIN_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
];

const TICK_RATE = 5; // ticks per second
const TIMED_TURN_SECONDS = 30;

/** Create an empty board. */
function emptyBoard(): Mark[] {
  return [
    Mark.EMPTY, Mark.EMPTY, Mark.EMPTY,
    Mark.EMPTY, Mark.EMPTY, Mark.EMPTY,
    Mark.EMPTY, Mark.EMPTY, Mark.EMPTY,
  ];
}

/** Check if a player has won. Returns the winning cells or null. */
function checkWin(board: Mark[], mark: Mark): number[] | null {
  for (const line of WIN_LINES) {
    if (line.every((i) => board[i] === mark)) {
      return line;
    }
  }
  return null;
}

/** Build the state-update payload clients receive. */
function buildStateUpdate(state: MatchState, tick: number): StateUpdateMessage {
  const players: StateUpdateMessage["players"] = {};
  for (const [uid, p] of Object.entries(state.players)) {
    players[uid] = { mark: p.mark, displayName: p.odisplayName };
  }

  let turnRemainingMs = 0;
  if (state.gameMode === GameMode.TIMED && state.phase === Phase.PLAYING) {
    const elapsed = (tick - state.turnStartTick) / state.tickRate;
    turnRemainingMs = Math.max(0, (state.turnTimeLimit - elapsed) * 1000);
  }

  return {
    board: state.board,
    currentTurn: state.currentTurn,
    players,
    phase: state.phase,
    moveCount: state.moveCount,
    gameMode: state.gameMode,
    turnTimeLimit: state.turnTimeLimit,
    turnRemainingMs,
  };
}

/** Update the match label used for listing. */
function updateLabel(state: MatchState): string {
  state.label = {
    gameMode: state.gameMode,
    playerCount: Object.keys(state.players).length,
    open: state.phase === Phase.WAITING,
  };
  return JSON.stringify(state.label);
}

// ── Match handler functions ───────────────────────────────────

export var matchInit: nkruntime.MatchInitFunction = function (
  _ctx,
  logger,
  _nk,
  params
): { state: nkruntime.MatchState; tickRate: number; label: string } {
  const gameMode =
    params && params["gameMode"] === GameMode.TIMED
      ? GameMode.TIMED
      : GameMode.CLASSIC;

  const state: MatchState = {
    board: emptyBoard(),
    players: {},
    playerOrder: [],
    currentTurn: "",
    phase: Phase.WAITING,
    winner: null,
    winningCells: null,
    isDraw: false,
    moveCount: 0,
    gameMode,
    turnTimeLimit: gameMode === GameMode.TIMED ? TIMED_TURN_SECONDS : 0,
    turnStartTick: 0,
    tickRate: TICK_RATE,
    rematchRequested: null,
    label: { gameMode, playerCount: 0, open: true },
  };

  logger.info("match created – mode: %s", gameMode);

  return {
    state,
    tickRate: TICK_RATE,
    label: JSON.stringify(state.label),
  };
};

export var matchJoinAttempt: nkruntime.MatchJoinAttemptFunction = function (
  _ctx,
  logger,
  _nk,
  _dispatcher,
  _tick,
  state: nkruntime.MatchState,
  presence,
  _metadata
) {
  const s = state as MatchState;

  // Reject if already full or game started
  if (Object.keys(s.players).length >= 2) {
    logger.warn("join rejected – match full: %s", presence.userId);
    return { state: s, accept: false, rejectMessage: "Match is full" };
  }
  if (s.phase === Phase.PLAYING) {
    return { state: s, accept: false, rejectMessage: "Game in progress" };
  }

  return { state: s, accept: true };
};

export var matchJoin: nkruntime.MatchJoinFunction = function (
  _ctx,
  logger,
  nk,
  dispatcher,
  tick,
  state: nkruntime.MatchState,
  presences
) {
  const s = state as MatchState;

  for (const p of presences) {
    // Assign mark: first player = X, second = O
    const mark = s.playerOrder.length === 0 ? Mark.X : Mark.O;

    let displayName = "Player";
    try {
      const users = nk.usersGetId([p.userId]);
      if (users && users.length > 0 && users[0].displayName) {
        displayName = users[0].displayName;
      } else if (users && users.length > 0 && users[0].username) {
        displayName = users[0].username;
      }
    } catch (_e) {
      // fallback
    }

    s.players[p.userId] = {
      odid: p.userId,
      odisplayName: displayName,
      mark,
      joinedAt: Date.now(),
    };
    s.playerOrder.push(p.userId);

    logger.info("player joined: %s as %s", displayName, mark === Mark.X ? "X" : "O");

    // Notify others that a player joined
    dispatcher.broadcastMessage(
      OpCode.OPPONENT_JOINED,
      JSON.stringify({
        userId: p.userId,
        displayName,
        mark,
      }),
      null,
      null,
      true
    );
  }

  // If we now have 2 players, start the game
  if (s.playerOrder.length === 2) {
    s.phase = Phase.PLAYING;
    s.currentTurn = s.playerOrder[0]; // X goes first
    s.turnStartTick = tick;

    logger.info("game started – X: %s, O: %s", s.playerOrder[0], s.playerOrder[1]);
  }

  dispatcher.matchLabelUpdate(updateLabel(s));

  // Broadcast current state to all players
  dispatcher.broadcastMessage(
    OpCode.STATE_UPDATE,
    JSON.stringify(buildStateUpdate(s, tick)),
    null,
    null,
    true
  );

  return { state: s };
};

export var matchLeave: nkruntime.MatchLeaveFunction = function (
  _ctx,
  logger,
  nk,
  dispatcher,
  tick,
  state: nkruntime.MatchState,
  presences
) {
  const s = state as MatchState;

  for (const p of presences) {
    logger.info("player left: %s", p.userId);

    dispatcher.broadcastMessage(
      OpCode.OPPONENT_LEFT,
      JSON.stringify({ userId: p.userId }),
      null,
      null,
      true
    );

    // If game was in progress, the remaining player wins by forfeit
    if (s.phase === Phase.PLAYING) {
      const remainingId = s.playerOrder.find((id) => id !== p.userId);
      if (remainingId) {
        s.winner = remainingId;
        s.phase = Phase.FINISHED;

        dispatcher.broadcastMessage(
          OpCode.GAME_OVER,
          JSON.stringify({
            winner: remainingId,
            winningCells: null,
            isDraw: false,
            board: s.board,
            reason: "opponent_left",
          } as GameOverMessage & { reason: string }),
          null,
          null,
          true
        );

        updatePlayerStats(nk, logger, s);
      }
    }

    delete s.players[p.userId];
    s.playerOrder = s.playerOrder.filter((id) => id !== p.userId);
  }

  dispatcher.matchLabelUpdate(updateLabel(s));

  // End match if empty
  if (Object.keys(s.players).length === 0) {
    return null;
  }

  return { state: s };
};

export var matchLoop: nkruntime.MatchLoopFunction = function (
  _ctx,
  logger,
  nk,
  dispatcher,
  tick,
  state: nkruntime.MatchState,
  messages
) {
  const s = state as MatchState;

  if (s.phase !== Phase.PLAYING) {
    return { state: s };
  }

  // ── Process incoming moves ──
  for (const msg of messages) {
    if (msg.opCode !== OpCode.MOVE) continue;

    // Only the current turn player can move
    if (msg.sender.userId !== s.currentTurn) {
      dispatcher.broadcastMessage(
        OpCode.MOVE_REJECTED,
        JSON.stringify({ reason: "not_your_turn" }),
        [msg.sender],
        null,
        true
      );
      continue;
    }

    let move: MoveMessage;
    try {
      move = JSON.parse(nk.binaryToString(msg.data));
    } catch (_e) {
      dispatcher.broadcastMessage(
        OpCode.MOVE_REJECTED,
        JSON.stringify({ reason: "invalid_data" }),
        [msg.sender],
        null,
        true
      );
      continue;
    }

    // Validate position
    if (
      typeof move.position !== "number" ||
      move.position < 0 ||
      move.position > 8 ||
      !Number.isInteger(move.position)
    ) {
      dispatcher.broadcastMessage(
        OpCode.MOVE_REJECTED,
        JSON.stringify({ reason: "invalid_position" }),
        [msg.sender],
        null,
        true
      );
      continue;
    }

    // Cell must be empty
    if (s.board[move.position] !== Mark.EMPTY) {
      dispatcher.broadcastMessage(
        OpCode.MOVE_REJECTED,
        JSON.stringify({ reason: "cell_occupied" }),
        [msg.sender],
        null,
        true
      );
      continue;
    }

    // Apply move
    const playerMark = s.players[msg.sender.userId].mark;
    s.board[move.position] = playerMark;
    s.moveCount++;

    // Check for win
    const winLine = checkWin(s.board, playerMark);
    if (winLine) {
      s.winner = msg.sender.userId;
      s.winningCells = winLine;
      s.phase = Phase.FINISHED;

      logger.info("winner: %s", msg.sender.userId);

      dispatcher.broadcastMessage(
        OpCode.GAME_OVER,
        JSON.stringify({
          winner: msg.sender.userId,
          winningCells: winLine,
          isDraw: false,
          board: s.board,
        } as GameOverMessage),
        null,
        null,
        true
      );

      updatePlayerStats(nk, logger, s);
      dispatcher.matchLabelUpdate(updateLabel(s));
      return { state: s };
    }

    // Check for draw (all cells filled)
    if (s.moveCount >= 9) {
      s.isDraw = true;
      s.phase = Phase.FINISHED;

      logger.info("game ended in draw");

      dispatcher.broadcastMessage(
        OpCode.GAME_OVER,
        JSON.stringify({
          winner: null,
          winningCells: null,
          isDraw: true,
          board: s.board,
        } as GameOverMessage),
        null,
        null,
        true
      );

      updatePlayerStats(nk, logger, s);
      dispatcher.matchLabelUpdate(updateLabel(s));
      return { state: s };
    }

    // Switch turn
    s.currentTurn =
      s.playerOrder[0] === msg.sender.userId
        ? s.playerOrder[1]
        : s.playerOrder[0];
    s.turnStartTick = tick;

    // Broadcast updated state
    dispatcher.broadcastMessage(
      OpCode.STATE_UPDATE,
      JSON.stringify(buildStateUpdate(s, tick)),
      null,
      null,
      true
    );
  }

  // ── Timer check (timed mode only) ──
  if (s.gameMode === GameMode.TIMED && s.turnTimeLimit > 0) {
    const elapsedSeconds = (tick - s.turnStartTick) / s.tickRate;

    // Broadcast timer update every second
    if (tick % s.tickRate === 0) {
      const remainingMs = Math.max(0, (s.turnTimeLimit - elapsedSeconds) * 1000);
      dispatcher.broadcastMessage(
        OpCode.TURN_TIMER,
        JSON.stringify({ remainingMs, currentTurn: s.currentTurn }),
        null,
        null,
        true
      );
    }

    // Time's up — current player loses
    if (elapsedSeconds >= s.turnTimeLimit) {
      const loserId = s.currentTurn;
      const winnerId = s.playerOrder.find((id) => id !== loserId)!;

      s.winner = winnerId;
      s.phase = Phase.FINISHED;

      logger.info("timeout – %s forfeited, %s wins", loserId, winnerId);

      dispatcher.broadcastMessage(
        OpCode.GAME_OVER,
        JSON.stringify({
          winner: winnerId,
          winningCells: null,
          isDraw: false,
          board: s.board,
          reason: "timeout",
        } as GameOverMessage & { reason: string }),
        null,
        null,
        true
      );

      updatePlayerStats(nk, logger, s);
      dispatcher.matchLabelUpdate(updateLabel(s));
    }
  }

  return { state: s };
};

export var matchTerminate: nkruntime.MatchTerminateFunction = function (
  _ctx,
  logger,
  _nk,
  dispatcher,
  _tick,
  state: nkruntime.MatchState,
  _graceSeconds
) {
  logger.info("match terminated");

  dispatcher.broadcastMessage(
    OpCode.GAME_OVER,
    JSON.stringify({
      winner: null,
      winningCells: null,
      isDraw: true,
      board: (state as MatchState).board,
    } as GameOverMessage),
    null,
    null,
    true
  );

  return { state };
};

export var matchSignal: nkruntime.MatchSignalFunction = function (
  _ctx,
  _logger,
  _nk,
  _dispatcher,
  _tick,
  state: nkruntime.MatchState,
  _data
) {
  return { state, data: "" };
};

// ── Leaderboard & stats helpers ───────────────────────────────

function updatePlayerStats(
  nk: nkruntime.Nakama,
  logger: nkruntime.Logger,
  state: MatchState
): void {
  for (const userId of state.playerOrder) {
    try {
      // Read existing stats
      let stats: PlayerStats = {
        wins: 0,
        losses: 0,
        draws: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalGames: 0,
      };

      const existing = nk.storageRead([
        { collection: STATS_COLLECTION, key: STATS_KEY, userId },
      ]);
      if (existing && existing.length > 0) {
        stats = existing[0].value as unknown as PlayerStats;
      }

      stats.totalGames++;

      if (state.isDraw) {
        stats.draws++;
        stats.currentStreak = 0;
      } else if (state.winner === userId) {
        stats.wins++;
        stats.currentStreak++;
        if (stats.currentStreak > stats.bestStreak) {
          stats.bestStreak = stats.currentStreak;
        }
      } else {
        stats.losses++;
        stats.currentStreak = 0;
      }

      // Write stats
      nk.storageWrite([
        {
          collection: STATS_COLLECTION,
          key: STATS_KEY,
          userId,
          value: stats as unknown as { [key: string]: unknown },
          permissionRead: 2, // public read
          permissionWrite: 0, // server only
        },
      ]);

      // Update leaderboard (score = wins * 100 - losses * 50 + draws * 10)
      const score = stats.wins * 100 - stats.losses * 50 + stats.draws * 10;
      const subscore = stats.bestStreak;
      nk.leaderboardRecordWrite(LEADERBOARD_ID, userId, undefined, score, subscore, undefined);

      logger.info(
        "stats updated for %s: W%d L%d D%d streak:%d",
        userId,
        stats.wins,
        stats.losses,
        stats.draws,
        stats.currentStreak
      );
    } catch (e) {
      logger.error("failed to update stats for %s: %s", userId, e);
    }
  }
}
