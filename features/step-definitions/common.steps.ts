import { Given } from "@cucumber/cucumber";
import type { PlanningPokerWorld } from "../support/world.js";

/**
 * Background step: sets up a room with the current user as a participant.
 * Creates a room with a creator ("Creator") and joins the active user.
 */
Given(
  "I am a planner in an active planning poker session",
  function (this: PlanningPokerWorld) {
    this.creatorSocketId = "socket-creator";
    this.roomId = this.roomManager.createRoom(
      this.creatorSocketId,
      "Creator"
    );
    this.participants.set("Creator", this.creatorSocketId);

    // Add default participants for vote scenarios
    this.addParticipant("Alice");
    this.addParticipant("Bob");
    this.addParticipant("Priti");

    this.activeSocketId = this.creatorSocketId;
    this.currentState = this.roomManager.getClientState(this.roomId)!;
  }
);

/**
 * Background step: sets up the current user explicitly as the session creator.
 */
Given(
  "I am the session creator in an active planning poker session",
  function (this: PlanningPokerWorld) {
    this.creatorSocketId = "socket-creator";
    this.roomId = this.roomManager.createRoom(
      this.creatorSocketId,
      "Creator"
    );
    this.participants.set("Creator", this.creatorSocketId);

    // Add a second participant so labeling scenarios are realistic
    this.addParticipant("Alice");

    this.activeSocketId = this.creatorSocketId;
    this.currentState = this.roomManager.getClientState(this.roomId)!;
  }
);
