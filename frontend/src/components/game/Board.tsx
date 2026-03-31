import { motion } from "framer-motion";
import { Mark } from "../../types/game";
import { Cell } from "./Cell";

interface BoardProps {
  board: Mark[];
  winningCells: number[] | null;
  isMyTurn: boolean;
  myMark: Mark;
  onCellClick: (position: number) => void;
}

export function Board({ board, winningCells, isMyTurn, myMark, onCellClick }: BoardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[340px] mx-auto"
    >
      <div className="grid grid-cols-3 gap-3">
        {board.map((mark, index) => (
          <Cell
            key={index}
            index={index}
            mark={mark}
            isWinning={winningCells?.includes(index) ?? false}
            isMyTurn={isMyTurn}
            myMark={myMark}
            onClick={() => onCellClick(index)}
          />
        ))}
      </div>
    </motion.div>
  );
}
