import { motion } from "framer-motion";
import { Mark } from "../../types/game";
import { XMark } from "./XMark";
import { OMark } from "./OMark";

interface CellProps {
  index: number;
  mark: Mark;
  isWinning: boolean;
  isMyTurn: boolean;
  myMark: Mark;
  onClick: () => void;
}

export function Cell({ mark, isWinning, isMyTurn, myMark, onClick }: CellProps) {
  const isEmpty = mark === Mark.EMPTY;
  const canClick = isEmpty && isMyTurn;

  return (
    <motion.button
      onClick={onClick}
      disabled={!canClick}
      whileHover={canClick ? { scale: 1.03 } : undefined}
      whileTap={canClick ? { scale: 0.97 } : undefined}
      className={`
        relative aspect-square rounded-xl border transition-all duration-200
        flex items-center justify-center
        ${isWinning
          ? "bg-white/10 border-neon-green/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          : isEmpty && canClick
            ? "bg-game-card/40 border-game-border/40 hover:bg-game-card/70 hover:border-neon-blue/30 cursor-pointer"
            : "bg-game-card/30 border-game-border/30"
        }
        ${!canClick && isEmpty ? "cursor-not-allowed" : ""}
      `}
    >
      {/* Hover preview */}
      {isEmpty && canClick && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-20 transition-opacity">
          {myMark === Mark.X ? <XMark size={50} /> : <OMark size={50} />}
        </div>
      )}

      {/* Placed mark */}
      {mark === Mark.X && <XMark size={50} isWinning={isWinning} />}
      {mark === Mark.O && <OMark size={50} isWinning={isWinning} />}
    </motion.button>
  );
}
