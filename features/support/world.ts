import { World, setWorldConstructor } from "@cucumber/cucumber";
import { RoomManager } from "../../server/room-manager.js";
import { computeMedian } from "../../server/votes.js";
import type {
  ClientRoomState,
  CardValue,
  VoteHistoryEntry,
} from "../../server/types.js";

export class PlanningPokerWorld extends World {
  public roomManager!: RoomManager;
  public roomId!: string;
  public currentState!: ClientRoomState;

  // Simulated socket IDs for participants
  public participants: Map<string, string> = new Map(); // name -> socketId
  public creatorSocketId!: string;
  public activeSocketId!: string; // "current user" context

  // Vote history
  public history: VoteHistoryEntry[] = [];

  // UI state model for vote-history-ui.feature
  public uiState = {
    historyPanelVisible: false,
    expandedEntries: new Set<number>(),
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

  // Helper: compute median — delegates to shared utility
  computeMedian(votes: CardValue[]): number | null {
    return computeMedian(votes).median;
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
    if (label !== null) {
      this.roomManager.setLabel(this.creatorSocketId, label);
    }

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

    this.currentState = this.roomManager.revealVotes(this.creatorSocketId)!;
    this.history = this.roomManager.getHistory(this.roomId);
  }

  // Helper: start a new round (reset)
  startNewRound(): void {
    this.currentState = this.roomManager.resetRound(this.creatorSocketId)!;
  }
}

setWorldConstructor(PlanningPokerWorld);
