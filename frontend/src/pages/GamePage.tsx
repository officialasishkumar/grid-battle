import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { nakama } from "../services/nakama";
import { Mark, Phase, GameMode } from "../types/game";
import { Board } from "../components/game/Board";
import { PlayerCard } from "../components/game/PlayerCard";
import { Timer } from "../components/game/Timer";
import { GameOverOverlay } from "../components/game/GameOverOverlay";

export function GamePage() {
  const {
    matchId,
    board,
    currentTurn,
    players,
    phase,
    gameMode,
    turnTimeLimit,
    turnRemainingMs,
    myMark,
    winner,
    winningCells,
    isDraw,
    gameOverReason,
    makeMove,
    leaveMatch,
    findMatch,
  } = useGameStore();

  const navigate = useNavigate();
  const userId = nakama.userId;

  // Redirect if no match
  useEffect(() => {
    if (!matchId) {
      navigate("/lobby");
    }
  }, [matchId, navigate]);

  if (!matchId) return null;

  const isMyTurn = currentTurn === userId;
  const playerEntries = Object.entries(players);
  const myPlayer = playerEntries.find(([id]) => id === userId);
  const opponentPlayer = playerEntries.find(([id]) => id !== userId);

  const winnerMark = winner && players[winner] ? players[winner].mark : Mark.EMPTY;
  const winnerName = winner && players[winner] ? players[winner].displayName : "";
  const amIWinner = winner === userId;

  const handlePlayAgain = () => {
    leaveMatch();
    findMatch(gameMode);
  };

  const handleBackToLobby = () => {
    leaveMatch();
    navigate("/lobby");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      {/* Match info bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <button
          onClick={handleBackToLobby}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Leave
        </button>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            gameMode === GameMode.TIMED
              ? "bg-neon-amber/10 text-neon-amber"
              : "bg-neon-blue/10 text-neon-blue"
          }`}>
            {gameMode === GameMode.TIMED ? "Timed" : "Classic"}
          </span>
          {phase === Phase.WAITING && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-neon-green/10 text-neon-green animate-pulse">
              Waiting for opponent...
            </span>
          )}
        </div>
      </motion.div>

      {/* Player cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <PlayerCard
          displayName={myPlayer ? myPlayer[1].displayName : "You"}
          mark={myMark || Mark.X}
          isCurrentTurn={isMyTurn && phase === Phase.PLAYING}
          isMe={true}
          isWinner={amIWinner}
        />
        <PlayerCard
          displayName={opponentPlayer ? opponentPlayer[1].displayName : "Waiting..."}
          mark={opponentPlayer ? opponentPlayer[1].mark : Mark.O}
          isCurrentTurn={!isMyTurn && phase === Phase.PLAYING}
          isMe={false}
          isWinner={winner !== null && !amIWinner && !isDraw}
        />
      </div>

      {/* Turn indicator */}
      {phase === Phase.PLAYING && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-6"
        >
          <span className={`text-sm font-medium ${
            isMyTurn ? "text-neon-green" : "text-slate-400"
          }`}>
            {isMyTurn ? "Your turn — make a move!" : "Opponent is thinking..."}
          </span>
        </motion.div>
      )}

      {/* Timer (timed mode) */}
      {gameMode === GameMode.TIMED && phase === Phase.PLAYING && turnTimeLimit > 0 && (
        <div className="flex justify-center mb-6">
          <Timer
            remainingMs={turnRemainingMs}
            totalSeconds={turnTimeLimit}
            isMyTurn={isMyTurn}
          />
        </div>
      )}

      {/* Game board */}
      <Board
        board={board}
        winningCells={winningCells}
        isMyTurn={isMyTurn && phase === Phase.PLAYING}
        myMark={myMark}
        onCellClick={makeMove}
      />

      {/* Waiting state overlay */}
      {phase === Phase.WAITING && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-game-card/50 border border-game-border/30">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-neon-blue animate-bounce [animation-delay:0ms]" />
              <div className="w-2 h-2 rounded-full bg-neon-purple animate-bounce [animation-delay:150ms]" />
              <div className="w-2 h-2 rounded-full bg-neon-pink animate-bounce [animation-delay:300ms]" />
            </div>
            <span className="text-sm text-slate-300">Waiting for an opponent to join...</span>
          </div>
        </motion.div>
      )}

      {/* Game Over overlay */}
      <GameOverOverlay
        isVisible={phase === Phase.FINISHED}
        isWinner={amIWinner}
        isDraw={isDraw}
        winnerMark={winnerMark}
        winnerName={winnerName}
        reason={gameOverReason}
        onPlayAgain={handlePlayAgain}
        onBackToLobby={handleBackToLobby}
      />
    </div>
  );
}
