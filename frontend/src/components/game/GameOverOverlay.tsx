import { motion, AnimatePresence } from "framer-motion";
import { Mark } from "../../types/game";
import { XMark } from "./XMark";
import { OMark } from "./OMark";

interface GameOverOverlayProps {
  isVisible: boolean;
  isWinner: boolean;
  isDraw: boolean;
  winnerMark: Mark;
  winnerName: string;
  reason: string | null;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export function GameOverOverlay({
  isVisible,
  isWinner,
  isDraw,
  winnerMark,
  winnerName,
  reason,
  onPlayAgain,
  onBackToLobby,
}: GameOverOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="glass-card p-8 max-w-sm w-full text-center"
          >
            {/* Result icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              {isDraw ? (
                <div className="w-20 h-20 mx-auto rounded-2xl bg-game-card flex items-center justify-center">
                  <span className="text-3xl text-slate-400">=</span>
                </div>
              ) : (
                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${
                  isWinner ? "bg-neon-green/10" : "bg-red-500/10"
                }`}>
                  {winnerMark === Mark.X ? <XMark size={48} /> : <OMark size={48} />}
                </div>
              )}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl font-bold mb-2 ${
                isDraw
                  ? "text-slate-300"
                  : isWinner
                    ? "text-neon-green"
                    : "text-red-400"
              }`}
            >
              {isDraw ? "It's a Draw!" : isWinner ? "You Won!" : "You Lost"}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-sm text-slate-400 mb-8"
            >
              {isDraw
                ? "Well played by both sides"
                : reason === "timeout"
                  ? `${isWinner ? "Opponent" : "You"} ran out of time`
                  : reason === "opponent_left"
                    ? "Opponent disconnected"
                    : `${winnerName} wins the match`
              }
            </motion.p>

            {/* Actions */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-3"
            >
              <button
                onClick={onPlayAgain}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-shadow"
              >
                Play Again
              </button>
              <button
                onClick={onBackToLobby}
                className="w-full py-3 px-6 rounded-xl bg-game-card/50 text-slate-300 font-medium hover:bg-game-card transition-colors border border-game-border/30"
              >
                Back to Lobby
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
