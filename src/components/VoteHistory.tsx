import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, History } from "lucide-react";
import { cn } from "../lib/utils";
import { CARD_LABELS } from "../lib/constants";
import type { VoteHistoryEntry } from "../../server/types";

interface VoteHistoryProps {
  history: VoteHistoryEntry[];
}

export function VoteHistory({ history }: VoteHistoryProps) {
  if (history.length === 0) return null;

  return (
    <section aria-label="Vote history" className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-3 px-1">
        <History className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          History
        </h2>
        <span
          className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full"
          aria-label={`${history.length} completed ${history.length === 1 ? "round" : "rounds"}`}
        >
          {history.length}
        </span>
      </div>

      <ol aria-label="Completed voting rounds" className="space-y-2">
        {history.map((entry, index) => (
          <HistoryEntry
            key={entry.roundId}
            entry={entry}
            roundNumber={history.length - index}
          />
        ))}
      </ol>
    </section>
  );
}

function HistoryEntry({
  entry,
  roundNumber,
}: {
  entry: VoteHistoryEntry;
  roundNumber: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayLabel = entry.label ?? `Round ${roundNumber}`;
  const medianDisplay =
    entry.median !== null ? String(entry.median) : "—";

  return (
    <li className="rounded-lg border border-border bg-card/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={`history-details-${entry.roundId}`}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 text-left",
          "hover:bg-muted/50 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        )}
      >
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform shrink-0",
            expanded && "rotate-180"
          )}
          aria-hidden="true"
        />

        <span className="flex-1 text-sm font-medium text-foreground truncate">
          {displayLabel}
        </span>

        <span className="flex items-center gap-2 shrink-0">
          {entry.consensus && (
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Consensus
            </span>
          )}
          <span
            className="text-sm font-bold text-foreground bg-muted px-2 py-0.5 rounded"
            aria-label={`Median: ${medianDisplay}`}
          >
            {medianDisplay}
          </span>
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            id={`history-details-${entry.roundId}`}
            role="region"
            aria-label={`Vote details for ${displayLabel}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1 border-t border-border/50">
              <table
                className="w-full text-sm"
                aria-label={`Votes for ${displayLabel}`}
              >
                <thead>
                  <tr className="text-muted-foreground">
                    <th scope="col" className="text-left font-medium py-1">
                      Participant
                    </th>
                    <th scope="col" className="text-right font-medium py-1">
                      Vote
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entry.votes.map((v) => (
                    <tr key={v.participant} className="border-t border-border/30">
                      <td className="py-1.5 text-foreground">{v.participant}</td>
                      <td className="py-1.5 text-right font-mono font-bold text-foreground">
                        {CARD_LABELS[String(v.vote)] ?? String(v.vote)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
