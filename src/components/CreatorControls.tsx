import { Eye, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

interface CreatorControlsProps {
  phase: "voting" | "revealed";
  onReveal: () => void;
  onReset: () => void;
  hasAnyVotes: boolean;
}

export function CreatorControls({
  phase,
  onReveal,
  onReset,
  hasAnyVotes,
}: CreatorControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4" role="group" aria-label="Round controls">
      {phase === "voting" ? (
        <Button
          onClick={onReveal}
          disabled={!hasAnyVotes}
          size="lg"
          className="gap-2 text-base"
        >
          <Eye className="w-5 h-5" aria-hidden="true" />
          Reveal Votes
        </Button>
      ) : (
        <Button
          onClick={onReset}
          size="lg"
          variant="secondary"
          className="gap-2 text-base"
        >
          <RotateCcw className="w-5 h-5" aria-hidden="true" />
          New Round
        </Button>
      )}
    </div>
  );
}
