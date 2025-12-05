import type { CounterId } from "./utils";

export interface Participant {
  id: string;
  name: string;
  session: number; // 1-4
  votes: number;
}

export interface VotingConfig {
  isOpen: boolean;
  currentSession: number; // 1-4
}

export interface SessionResult {
  sessionNumber: number;
  timestamp: string;
  participants: {
    id: string;
    name: string;
    votes: number;
    cluster: CounterId;
  }[];
}
