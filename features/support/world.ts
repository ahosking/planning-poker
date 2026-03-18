import { World, setWorldConstructor } from "@cucumber/cucumber";
import { RoomManager } from "../../server/room-manager.js";
import type { ClientRoomState, CardValue } from "../../server/types.js";

/**
 * Represents a completed round snapshot stored in vote history.
 * Defines the contract that production code must fulfill.
 * Will be replaced with the real VoteHistoryEntry type once the server implements it.
 */
export interface HistoryEntry {
  label: string | null;
  votes: Array<{ participant: string; vote: CardValue }>;
  median: number | null;
  consensus: boolean;
  timestamp: number;
}

/**
 * Logical UI state model for testing vote-history-ui.feature.
 * Decoupled from React — tests behavioral rules, not DOM.
 */
export interface UIState {
  historyPanelVisible: boolean;
  expandedEntries: Set<number>;
}

export class PlanningPokerWorld extends World {
  public roomManager!: RoomManager;
  public roomId!: string;
  public currentState!: ClientRoomState;

  // Simulated socket IDs for participants
  public participants: Map<string, string> = new Map(); // name -> socketId
  public creatorSocketId!: string;
  public activeSocketId!: string; // "current user" context

  // Vote history — the feature being TDD'd
  public history: HistoryEntry[] = [];

  // UI state model for vote-history-ui.feature
  public uiState: UIState = {
    historyPanelVisible: false,
    expandedEntries: new Set(),
  };

  // Error tracking
  public lastError: string | null = null;

  // Helper: parse a vote string into a CardValue
  parseVote(raw: string): CardValue {
    if (raw === "?" || raw === "coffee") return raw;
    const num = Number(raw);
    if ([1, 2, 3, 5, 8, 13, 21].includes(num)) return num as CardValue;
    throw new Error(`Invalid vote value: ${raw}`);
  }

  // Helper: compute median from numeric votes (upper-middle, matching app logic)
  computeMedian(votes: CardValue[]): number | null {
    const numeric = votes.filter((v): v is number => typeof v === "number");
    if (numeric.length === 0) return null;
    const sorted = [...numeric].sort((a, b) => a - b);
    const midIndex = Math.ceil((sorted.length - 1) / 2);
    return sorted[midIndex];
  }

  // Helper: add participants to the room
  addParticipant(name: string): string {
    const socketId = `socket-${name.toLowerCase()}`;
    this.roomManager.joinRoom(this.roomId, socketId, name);
    this.participants.set(name, socketId);
    return socketId;
  }

  // Helper: have all participants cast a vote
  castVotesForAll(value: CardValue = 5): void {
    for (const [, socketId] of this.participants) {
      this.roomManager.castVote(socketId, value);
    }
  }

  // Helper: complete a full round (set label, cast votes, reveal)
  completeRound(
    label: string | null,
    votes?: Array<{ participant: string; vote: CardValue }>
  ): void {
    // Set label if provided — calls future setLabel() method
    if (
      label !== null &&
      typeof (this.roomManager as any).setLabel === "function"
    ) {
      (this.roomManager as any).setLabel(this.creatorSocketId, label);
    }

    // Cast votes
    if (votes) {
      for (const { participant, vote } of votes) {
        let socketId = this.participants.get(participant);
        if (!socketId) {
          socketId = this.addParticipant(participant);
        }
        this.roomManager.castVote(socketId, vote);
      }
    } else {
      this.castVotesForAll();
    }

    // Reveal
    this.currentState = this.roomManager.revealVotes(this.creatorSocketId)!;

    // Capture history from room manager — calls future getHistory() method
    if (typeof (this.roomManager as any).getHistory === "function") {
      this.history = (this.roomManager as any).getHistory(this.roomId);
    }
  }

  // Helper: start a new round (reset)
  startNewRound(): void {
    this.currentState = this.roomManager.resetRound(this.creatorSocketId)!;
  }
}

setWorldConstructor(PlanningPokerWorld);
