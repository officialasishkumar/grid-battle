import { GameMode, STATS_COLLECTION, STATS_KEY, PlayerStats } from "./types";

/**
 * RPC: Create or find a match.
 *
 * Payload: { "gameMode": "classic" | "timed" }
 * Response: { "matchId": "...", "created": true|false }
 */
export var rpcFindMatch: nkruntime.RpcFunction = function (
  ctx,
  logger,
  nk,
  payload
) {
  let gameMode: GameMode = GameMode.CLASSIC;

  if (payload) {
    try {
      const req = JSON.parse(payload);
      if (req.gameMode === GameMode.TIMED) {
        gameMode = GameMode.TIMED;
      }
    } catch (_e) {
      // use default
    }
  }

  // Search for an existing open match with the same mode
  const matches = nk.matchList(10, true, undefined, 1, 1);

  // Try to find a match the player isn't already in
  for (const match of matches) {
    try {
      const label = JSON.parse(match.label || "{}");
      if (label.gameMode === gameMode && label.open === true) {
        logger.info("found open match %s for user %s", match.matchId, ctx.userId);
        return JSON.stringify({ matchId: match.matchId, created: false });
      }
    } catch (_e) {
      continue;
    }
  }

  // No open match found — create one
  const matchId = nk.matchCreate("grid_battle", {
    gameMode,
  });

  logger.info("created new match %s for user %s (mode: %s)", matchId, ctx.userId, gameMode);
  return JSON.stringify({ matchId, created: true });
};

/**
 * RPC: Get player stats.
 *
 * Payload: { "userId": "..." } (optional, defaults to caller)
 * Response: PlayerStats
 */
export var rpcGetStats: nkruntime.RpcFunction = function (
  ctx,
  _logger,
  nk,
  payload
) {
  let targetUserId: string = ctx.userId!;

  if (payload) {
    try {
      const req = JSON.parse(payload);
      if (req.userId) {
        targetUserId = req.userId;
      }
    } catch (_e) {
      // use caller
    }
  }

  const result = nk.storageRead([
    { collection: STATS_COLLECTION, key: STATS_KEY, userId: targetUserId },
  ]);

  if (result && result.length > 0) {
    return JSON.stringify(result[0].value);
  }

  const defaultStats: PlayerStats = {
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
  };

  return JSON.stringify(defaultStats);
};

/**
 * RPC: Get active matches list.
 *
 * Response: Array of match summaries.
 */
export var rpcListMatches: nkruntime.RpcFunction = function (
  _ctx,
  _logger,
  nk,
  _payload
) {
  const matches = nk.matchList(20, true);

  const result = matches.map((m) => {
    let label = { gameMode: GameMode.CLASSIC, playerCount: 0, open: false };
    try {
      label = JSON.parse(m.label || "{}");
    } catch (_e) {
      // use default
    }

    return {
      matchId: m.matchId,
      playerCount: m.size,
      gameMode: label.gameMode,
      open: label.open,
    };
  });

  return JSON.stringify(result);
};
