import { motion } from "framer-motion";
import { PokerCard } from "./PokerCard";
import { computeMedian } from "../../server/votes";
import type { ClientParticipant } from "../../server/types";
import type { CardValue } from "../../server/types";

interface VoteResultsProps {
  participants: ClientParticipant[];
}

export function VoteResults({ participants }: VoteResultsProps) {
  const votes = participants
    .map((p) => p.vote)
    .filter((v): v is CardValue => v !== null);
  const { median, consensus: isConsensus } = computeMedian(votes);
  const medianValue: CardValue = median ?? "?";

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      role="status"
      aria-label={`Vote result: median is ${medianValue}${isConsensus ? ", consensus reached" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <PokerCard value={medianValue} faceUp size="lg" />
      <span className="text-sm text-muted-foreground font-medium">Median</span>
      {isConsensus && (
        <motion.span
          className="text-sm font-semibold text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Consensus!
        </motion.span>
      )}
    </motion.div>
  );
}
