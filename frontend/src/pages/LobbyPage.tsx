import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { useAuthStore } from "../store/authStore";
import { nakama } from "../services/nakama";
import { GameMode, MatchInfo, PlayerStats } from "../types/game";

export function LobbyPage() {
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.CLASSIC);
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const { findMatch, isSearching, matchId, error } = useGameStore();
  const { username } = useAuthStore();
  const navigate = useNavigate();

  // Navigate to game when match is found
  useEffect(() => {
    if (matchId) {
      navigate("/game");
    }
  }, [matchId, navigate]);

  // Load stats and matches on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, matchesRes] = await Promise.all([
          nakama.rpc<PlayerStats>("get_stats"),
          nakama.rpc<MatchInfo[]>("list_matches"),
        ]);
        setStats(statsRes);
        setMatches(matchesRes.filter((m) => m.open));
      } catch {
        // non-critical
      }
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFindMatch = () => {
    findMatch(selectedMode);
  };

  const handleJoinMatch = (matchId: string) => {
    useGameStore.getState().joinMatch(matchId);
  };

  const winRate = stats && stats.totalGames > 0
    ? Math.round((stats.wins / stats.totalGames) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Welcome back, <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">{username}</span>
        </h1>
        <p className="text-slate-400">Choose your battle mode and find an opponent</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main panel - Find Match */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Find a Match</h2>

            {/* Game mode selector */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setSelectedMode(GameMode.CLASSIC)}
                className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                  selectedMode === GameMode.CLASSIC
                    ? "border-neon-blue/50 bg-neon-blue/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                    : "border-game-border/30 bg-game-card/30 hover:border-game-border/50"
                }`}
              >
                {selectedMode === GameMode.CLASSIC && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-neon-blue flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Classic</h3>
                <p className="text-xs text-slate-400">No time limit. Think carefully.</p>
              </button>

              <button
                onClick={() => setSelectedMode(GameMode.TIMED)}
                className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                  selectedMode === GameMode.TIMED
                    ? "border-neon-amber/50 bg-neon-amber/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                    : "border-game-border/30 bg-game-card/30 hover:border-game-border/50"
                }`}
              >
                {selectedMode === GameMode.TIMED && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-neon-amber flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="w-10 h-10 rounded-lg bg-neon-amber/10 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-neon-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Timed</h3>
                <p className="text-xs text-slate-400">30 seconds per move. Fast and intense!</p>
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Find Match button */}
            <button
              onClick={handleFindMatch}
              disabled={isSearching}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all disabled:opacity-70"
            >
              {isSearching ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Searching for opponent...
                </span>
              ) : (
                "Find Match"
              )}
            </button>
          </div>

          {/* Open matches */}
          {matches.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6 mt-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                Open Matches
                <span className="ml-2 text-xs text-slate-400 font-normal">
                  ({matches.length} available)
                </span>
              </h2>
              <div className="space-y-3">
                {matches.map((match) => (
                  <div
                    key={match.matchId}
                    className="flex items-center justify-between p-4 rounded-xl bg-game-card/30 border border-game-border/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        match.open ? "bg-neon-green animate-pulse" : "bg-slate-500"
                      }`} />
                      <div>
                        <span className="text-sm text-slate-200 font-medium">
                          {match.gameMode === GameMode.TIMED ? "Timed" : "Classic"} Match
                        </span>
                        <span className="text-xs text-slate-500 ml-2">
                          {match.playerCount}/2 players
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinMatch(match.matchId)}
                      className="px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue text-sm font-medium hover:bg-neon-blue/20 transition-colors"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Side panel - Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Quick stats */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Your Stats</h2>
            {stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-game-card/30">
                    <div className="text-xl font-bold text-neon-green">{stats.wins}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Wins</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-game-card/30">
                    <div className="text-xl font-bold text-red-400">{stats.losses}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Losses</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-game-card/30">
                    <div className="text-xl font-bold text-slate-300">{stats.draws}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Draws</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Win Rate</span>
                    <span className="text-white font-medium">{winRate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-game-card overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-green transition-all duration-500"
                      style={{ width: `${winRate}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Current Streak</span>
                    <span className="text-neon-amber font-medium">{stats.currentStreak}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Best Streak</span>
                    <span className="text-neon-purple font-medium">{stats.bestStreak}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Games</span>
                    <span className="text-white font-medium">{stats.totalGames}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-shimmer h-40 rounded-lg" />
            )}
          </div>

          {/* Quick link to leaderboard */}
          <button
            onClick={() => navigate("/leaderboard")}
            className="w-full glass-card p-4 flex items-center gap-3 hover:bg-game-card/50 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-neon-amber/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-neon-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">Leaderboard</div>
              <div className="text-xs text-slate-400">See global rankings</div>
            </div>
            <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
