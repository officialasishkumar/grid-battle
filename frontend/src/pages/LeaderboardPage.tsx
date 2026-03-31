import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { nakama } from "../services/nakama";
import type { PlayerStats } from "../types/game";

interface LeaderboardEntry {
  ownerId: string;
  username: string;
  score: number;
  subscore: number;
  rank: number;
}

export function LeaderboardPage() {
  const [entries, setEntries] = useState<(LeaderboardEntry & { stats?: PlayerStats })[]>([]);
  const [loading, setLoading] = useState(true);
  const myUserId = nakama.userId;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const result = await nakama.getLeaderboard(50);
        if (!result.records) {
          setEntries([]);
          setLoading(false);
          return;
        }

        const records: (LeaderboardEntry & { stats?: PlayerStats })[] =
          result.records.map((r, i) => ({
            ownerId: r.owner_id!,
            username: (r.username as unknown as { value: string } | undefined)?.value || r.username as unknown as string || "Unknown",
            score: Number(r.score) || 0,
            subscore: Number(r.subscore) || 0,
            rank: r.rank ? Number(r.rank) : i + 1,
          }));

        // Fetch stats for each player
        for (const entry of records) {
          try {
            entry.stats = await nakama.rpc<PlayerStats>("get_stats", {
              userId: entry.ownerId,
            });
          } catch {
            // non-critical
          }
        }

        setEntries(records);
      } catch {
        // leaderboard may not exist yet
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-400";
      case 2: return "text-slate-300";
      case 3: return "text-amber-600";
      default: return "text-slate-500";
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank > 3) return null;
    return (
      <svg className={`w-5 h-5 ${getMedalColor(rank)}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 1l2.39 4.84L17.5 6.7l-3.75 3.66.89 5.14L10 13.18 5.36 15.5l.89-5.14L2.5 6.7l5.11-.86L10 1z" />
      </svg>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Leaderboard
        </h1>
        <p className="text-slate-400">Top players ranked by performance</p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-shimmer h-16 rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-game-card flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Rankings Yet</h3>
          <p className="text-sm text-slate-500">Play some matches to appear on the leaderboard!</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-2 text-center">Score</div>
            <div className="col-span-1 text-center">W</div>
            <div className="col-span-1 text-center">L</div>
            <div className="col-span-1 text-center">D</div>
            <div className="col-span-1 text-center">Rate</div>
            <div className="col-span-1 text-center">Streak</div>
          </div>

          {entries.map((entry, i) => {
            const isMe = entry.ownerId === myUserId;
            const winRate =
              entry.stats && entry.stats.totalGames > 0
                ? Math.round((entry.stats.wins / entry.stats.totalGames) * 100)
                : 0;

            return (
              <motion.div
                key={entry.ownerId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card px-5 py-4 transition-all ${
                  isMe
                    ? "ring-1 ring-neon-blue/30 bg-neon-blue/5"
                    : "hover:bg-game-card/50"
                }`}
              >
                {/* Mobile layout */}
                <div className="sm:hidden flex items-center gap-3">
                  <div className="w-8 text-center shrink-0">
                    {getMedalIcon(entry.rank) || (
                      <span className="text-sm font-mono text-slate-500">#{entry.rank}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200 truncate">
                        {entry.username}
                      </span>
                      {isMe && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-neon-blue/20 text-neon-blue">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Score: {entry.score} | W{entry.stats?.wins ?? 0} L{entry.stats?.losses ?? 0}
                    </div>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1 flex justify-center">
                    {getMedalIcon(entry.rank) || (
                      <span className="text-sm font-mono text-slate-500">#{entry.rank}</span>
                    )}
                  </div>
                  <div className="col-span-4 flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-slate-300">
                        {entry.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-200 truncate">
                      {entry.username}
                    </span>
                    {isMe && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-neon-blue/20 text-neon-blue shrink-0">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-bold text-white">{entry.score}</span>
                  </div>
                  <div className="col-span-1 text-center text-sm text-neon-green">
                    {entry.stats?.wins ?? 0}
                  </div>
                  <div className="col-span-1 text-center text-sm text-red-400">
                    {entry.stats?.losses ?? 0}
                  </div>
                  <div className="col-span-1 text-center text-sm text-slate-400">
                    {entry.stats?.draws ?? 0}
                  </div>
                  <div className="col-span-1 text-center text-sm text-neon-blue">
                    {winRate}%
                  </div>
                  <div className="col-span-1 text-center text-sm text-neon-amber">
                    {entry.stats?.bestStreak ?? 0}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
