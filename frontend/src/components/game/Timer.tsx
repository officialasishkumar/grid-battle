import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimerProps {
  remainingMs: number;
  totalSeconds: number;
  isMyTurn: boolean;
}

export function Timer({ remainingMs, totalSeconds, isMyTurn }: TimerProps) {
  const [displayMs, setDisplayMs] = useState(remainingMs);

  // Client-side countdown between server updates
  useEffect(() => {
    setDisplayMs(remainingMs);
    const interval = setInterval(() => {
      setDisplayMs((prev) => Math.max(0, prev - 100));
    }, 100);
    return () => clearInterval(interval);
  }, [remainingMs]);

  const seconds = Math.ceil(displayMs / 1000);
  const progress = displayMs / (totalSeconds * 1000);
  const isLow = seconds <= 10;
  const isCritical = seconds <= 5;

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-game-border/30"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-colors duration-300 ${
              isCritical
                ? "text-red-500"
                : isLow
                  ? "text-neon-amber"
                  : "text-neon-blue"
            }`}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-2xl font-mono font-bold tabular-nums ${
              isCritical
                ? "text-red-400 animate-pulse"
                : isLow
                  ? "text-neon-amber"
                  : "text-slate-200"
            }`}
          >
            {seconds}
          </span>
        </div>
      </div>

      <span className="text-xs text-slate-500">
        {isMyTurn ? "Your turn" : "Opponent's turn"}
      </span>
    </div>
  );
}
