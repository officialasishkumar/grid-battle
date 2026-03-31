import { motion } from "framer-motion";
import { Mark } from "../../types/game";
import { XMark } from "./XMark";
import { OMark } from "./OMark";

interface PlayerCardProps {
  displayName: string;
  mark: Mark;
  isCurrentTurn: boolean;
  isMe: boolean;
  isWinner: boolean;
}

export function PlayerCard({ displayName, mark, isCurrentTurn, isMe, isWinner }: PlayerCardProps) {
  const borderClass = mark === Mark.X ? "neon-border-cyan" : "neon-border-pink";
  const bgGlow = mark === Mark.X
    ? "bg-gradient-to-br from-player-x/5 to-transparent"
    : "bg-gradient-to-br from-player-o/5 to-transparent";

  return (
    <motion.div
      animate={isCurrentTurn ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={isCurrentTurn ? { duration: 1.5, repeat: Infinity } : undefined}
      className={`
        glass-card p-4 flex items-center gap-3 transition-all duration-300
        ${isCurrentTurn ? borderClass : ""}
        ${bgGlow}
        ${isWinner ? "ring-2 ring-neon-green/50" : ""}
      `}
    >
      <div className="w-10 h-10 rounded-lg bg-game-card flex items-center justify-center shrink-0">
        {mark === Mark.X ? <XMark size={28} /> : <OMark size={28} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200 truncate">
            {displayName}
          </span>
          {isMe && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neon-blue/20 text-neon-blue uppercase tracking-wider">
              You
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          {isWinner ? (
            <span className="text-neon-green font-medium">Winner!</span>
          ) : isCurrentTurn ? (
            <span className={mark === Mark.X ? "text-player-x" : "text-player-o"}>
              Thinking...
            </span>
          ) : (
            "Waiting"
          )}
        </div>
      </div>

      {isCurrentTurn && (
        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
          mark === Mark.X ? "bg-player-x" : "bg-player-o"
        }`} />
      )}
    </motion.div>
  );
}
