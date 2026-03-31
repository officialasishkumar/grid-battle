import {
  matchInit,
  matchJoinAttempt,
  matchJoin,
  matchLeave,
  matchLoop,
  matchTerminate,
  matchSignal,
} from "./match_handler";
import { rpcFindMatch, rpcGetStats, rpcListMatches } from "./rpc";
import { LEADERBOARD_ID, GameMode } from "./types";

/**
 * Nakama server module entry point.
 * Registers match handlers, RPCs, matchmaker hooks, and leaderboards.
 */
const InitModule: nkruntime.InitModule = function (
  ctx,
  logger,
  nk,
  initializer
) {
  logger.info("grid-battle module loaded – version %s", ctx.env["version"] || "dev");

  // ── Register authoritative match handler ──
  initializer.registerMatch("grid_battle", {
    matchInit,
    matchJoinAttempt,
    matchJoin,
    matchLeave,
    matchLoop,
    matchTerminate,
    matchSignal,
  });

  // ── Register RPCs ──
  initializer.registerRpc("find_match", rpcFindMatch);
  initializer.registerRpc("get_stats", rpcGetStats);
  initializer.registerRpc("list_matches", rpcListMatches);

  // ── Matchmaker hook: auto-create match when two players are paired ──
  initializer.registerMatchmakerMatched(function (
    _ctx,
    logger,
    nk,
    matches
  ): string | void {
    // Determine game mode from the first ticket's string properties
    let gameMode = GameMode.CLASSIC;
    if (
      matches.length > 0 &&
      (matches[0].properties as any)?.stringProperties?.["gameMode"] === GameMode.TIMED
    ) {
      gameMode = GameMode.TIMED;
    }

    const matchId = nk.matchCreate("grid_battle", { gameMode });
    logger.info(
      "matchmaker paired %d players → match %s (mode: %s)",
      matches.length,
      matchId,
      gameMode
    );
    return matchId;
  });

  // ── Create leaderboard if it doesn't exist ──
  try {
    nk.leaderboardCreate(
      LEADERBOARD_ID,
      false,         // not authoritative (server writes only via code)
      nkruntime.SortOrder.DESCENDING,
      nkruntime.Operator.SET,
      undefined,     // no reset schedule
      undefined      // no metadata
    );
    logger.info("leaderboard ready: %s", LEADERBOARD_ID);
  } catch (_e) {
    // Already exists — that's fine
    logger.info("leaderboard already exists: %s", LEADERBOARD_ID);
  }

  logger.info("grid-battle module initialized successfully");
};

// Required: expose InitModule to the Nakama runtime.
// @ts-ignore: top-level export for Nakama runtime
!InitModule && InitModule;
