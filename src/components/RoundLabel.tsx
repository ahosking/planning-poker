import { useState, useEffect, useRef } from "react";
import { Tag } from "lucide-react";

interface RoundLabelProps {
  currentLabel: string | null;
  isCreator: boolean;
  onLabelChange: (label: string) => void;
}

export function RoundLabel({
  currentLabel,
  isCreator,
  onLabelChange,
}: RoundLabelProps) {
  const [localValue, setLocalValue] = useState(currentLabel ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from server when label changes externally (e.g. new round clears it)
  useEffect(() => {
    setLocalValue(currentLabel ?? "");
  }, [currentLabel]);

  // Clean up pending debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleChange(value: string) {
    setLocalValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onLabelChange(value);
    }, 300);
  }

  if (!isCreator) {
    if (!currentLabel) return null;
    return (
      <div
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
        aria-label={`Current round: ${currentLabel}`}
      >
        <Tag className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="font-medium text-foreground">{currentLabel}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
      <label htmlFor="round-label" className="sr-only">
        Round label
      </label>
      <Tag className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
      <input
        id="round-label"
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Label this round (e.g. User login flow)"
        maxLength={100}
        className="w-full text-sm text-center bg-transparent border-b border-border/50
          text-foreground placeholder:text-muted-foreground/50
          focus:border-primary focus:outline-none
          py-1 transition-colors"
        aria-describedby="round-label-hint"
      />
      <span id="round-label-hint" className="sr-only">
        Optional label to identify what this round is estimating
      </span>
    </div>
  );
}
