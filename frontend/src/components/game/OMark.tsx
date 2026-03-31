import { motion } from "framer-motion";

interface OMarkProps {
  size?: number;
  isWinning?: boolean;
}

export function OMark({ size = 60, isWinning = false }: OMarkProps) {
  const center = size / 2;
  const radius = size * 0.32;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={size * 0.08}
        strokeLinecap="round"
        className={`text-player-o ${isWinning ? "drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]" : "drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]"}`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
