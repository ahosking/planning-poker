import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { PlanningPokerWorld } from "../support/world.js";

// --- Given steps ---

Given(
  "a new voting round has started",
  function (this: PlanningPokerWorld) {
    assert.equal(this.currentState.phase, "voting");
  }
);

Given(
  "a new voting round has started with the label {string}",
  function (this: PlanningPokerWorld, label: string) {
    assert.equal(this.currentState.phase, "voting");
    (this.roomManager as any).setLabel(this.creatorSocketId, label);
    this.currentState = this.roomManager.getClientState(this.roomId)!;
  }
);

Given(
  "no label has been set",
  function (this: PlanningPokerWorld) {
    const state = this.roomManager.getClientState(this.roomId)! as any;
    assert.ok(
      state.currentLabel === null || state.currentLabel === undefined,
      "Expected no label to be set"
    );
  }
);

Given(
  "a voting round is in progress with the label {string}",
  function (this: PlanningPokerWorld, label: string) {
    assert.equal(this.currentState.phase, "voting");
    (this.roomManager as any).setLabel(this.creatorSocketId, label);
    this.currentState = this.roomManager.getClientState(this.roomId)!;
  }
);

Given(
  "a voting round was completed with the label {string}",
  function (this: PlanningPokerWorld, label: string) {
    (this.roomManager as any).setLabel(this.creatorSocketId, label);
    this.castVotesForAll(5);
    this.currentState = this.roomManager.revealVotes(this.creatorSocketId)!;
  }
);

Given(
  "I am a non-creator participant",
  function (this: PlanningPokerWorld) {
    const aliceSocketId = this.participants.get("Alice");
    assert.ok(aliceSocketId, "Alice should exist as a participant");
    this.activeSocketId = aliceSocketId;
  }
);

// --- When steps ---

When(
  "I set the round label to {string}",
  function (this: PlanningPokerWorld, label: string) {
    const result = (this.roomManager as any).setLabel(
      this.activeSocketId,
      label
    );
    if (result) {
      this.currentState = result;
    } else {
      this.lastError = "Label update rejected";
    }
  }
);

When(
  "I update the round label to {string}",
  function (this: PlanningPokerWorld, label: string) {
    const result = (this.roomManager as any).setLabel(
      this.activeSocketId,
      label
    );
    if (result) {
      this.currentState = result;
    }
  }
);

When(
  "participants cast their votes",
  function (this: PlanningPokerWorld) {
    this.castVotesForAll(5);
    this.currentState = this.roomManager.getClientState(this.roomId)!;
  }
);

When(
  "the creator starts a new round",
  function (this: PlanningPokerWorld) {
    this.startNewRound();
    this.currentState = this.roomManager.getClientState(this.roomId)!;
  }
);

When(
  "I attempt to set the round label",
  function (this: PlanningPokerWorld) {
    const result = (this.roomManager as any).setLabel(
      this.activeSocketId,
      "Should not work"
    );
    if (result) {
      this.currentState = result;
    } else {
      this.lastError = "Label update rejected";
    }
  }
);

// --- Then steps ---

Then(
  "all participants should see the label {string} for the current round",
  function (this: PlanningPokerWorld, label: string) {
    const state = this.roomManager.getClientState(this.roomId)! as any;
    assert.equal(state.currentLabel, label);
  }
);

Then(
  "all participants should see the updated label {string}",
  function (this: PlanningPokerWorld, label: string) {
    const state = this.roomManager.getClientState(this.roomId)! as any;
    assert.equal(state.currentLabel, label);
  }
);

Then(
  "the round should proceed normally without a label",
  function (this: PlanningPokerWorld) {
    const state = this.roomManager.getClientState(this.roomId)!;
    const votedCount = state.participants.filter((p) => p.hasVoted).length;
    assert.ok(votedCount > 0, "Participants should have voted");
    assert.ok(
      (state as any).currentLabel === null ||
        (state as any).currentLabel === undefined
    );
  }
);

Then(
  "the label {string} should still be displayed",
  function (this: PlanningPokerWorld, label: string) {
    const state = this.roomManager.getClientState(this.roomId)! as any;
    assert.equal(state.currentLabel, label);
  }
);

Then(
  "the current round label should be empty",
  function (this: PlanningPokerWorld) {
    const state = this.roomManager.getClientState(this.roomId)! as any;
    assert.ok(
      state.currentLabel === null || state.currentLabel === undefined,
      `Expected empty label, got "${state.currentLabel}"`
    );
  }
);

Then(
  "the label should not be updated",
  function (this: PlanningPokerWorld) {
    assert.equal(this.lastError, "Label update rejected");
    const state = this.roomManager.getClientState(this.roomId)! as any;
    assert.notEqual(state.currentLabel, "Should not work");
  }
);
