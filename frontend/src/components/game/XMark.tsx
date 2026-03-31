import { motion } from "framer-motion";

interface XMarkProps {
  size?: number;
  isWinning?: boolean;
}

export function XMark({ size = 60, isWinning = false }: XMarkProps) {
  const padding = size * 0.2;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.line
        x1={padding}
        y1={padding}
        x2={size - padding}
        y2={size - padding}
        stroke="currentColor"
        strokeWidth={size * 0.08}
        strokeLinecap="round"
        className={`text-player-x ${isWinning ? "drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" : "drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]"}`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      <motion.line
        x1={size - padding}
        y1={padding}
        x2={padding}
        y2={size - padding}
        stroke="currentColor"
        strokeWidth={size * 0.08}
        strokeLinecap="round"
        className={`text-player-x ${isWinning ? "drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" : "drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]"}`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
      />
    </motion.svg>
  );
}
