export type CardValue = 1 | 2 | 3 | 5 | 8 | 13 | 21 | "?" | "coffee";

export interface Participant {
  id: string;
  name: string;
  vote: CardValue | null;
  isCreator: boolean;
}

export interface VoteHistoryEntry {
  roundId: number;
  label: string | null;
  votes: Array<{ participant: string; vote: CardValue }>;
  median: number | null;
  consensus: boolean;
  timestamp: number;
}

export interface RoomState {
  id: string;
  participants: Map<string, Participant>;
  phase: "voting" | "revealed";
  creatorId: string;
  lastActivity: number;
  currentLabel: string | null;
  history: VoteHistoryEntry[];
  roundCounter: number;
}

// What the client receives (sanitized)
export interface ClientParticipant {
  id: string;
  name: string;
  vote: CardValue | null;
  hasVoted: boolean;
  isCreator: boolean;
}

export interface ClientRoomState {
  id: string;
  participants: ClientParticipant[];
  phase: "voting" | "revealed";
  creatorId: string;
  currentLabel: string | null;
  history: VoteHistoryEntry[];
}

// Socket events
export interface ServerToClientEvents {
  "room-state": (state: ClientRoomState) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  "create-room": (
    data: { name: string },
    callback: (response: { roomId: string }) => void
  ) => void;
  "join-room": (data: { roomId: string; name: string }) => void;
  "cast-vote": (data: { value: CardValue }) => void;
  "reveal-votes": () => void;
  "reset-round": () => void;
  "set-round-label": (data: { label: string }) => void;
}
