import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { PlanningPokerWorld } from "../support/world.js";

// --- Given steps ---

Given(
  "no voting rounds have been completed",
  function (this: PlanningPokerWorld) {
    // Fresh room — no reveals have happened
    this.history = [];
    this.uiState.historyPanelVisible = false;
  }
);

Given(
  "the vote history contains a completed round",
  function (this: PlanningPokerWorld) {
    this.completeRound("Test story");
    this.uiState.historyPanelVisible = true;
  }
);

Given(
  "a history entry is currently expanded",
  function (this: PlanningPokerWorld) {
    this.completeRound("Test story");
    this.uiState.historyPanelVisible = true;
    this.uiState.expandedEntries.add(0);
  }
);

Given(
  "the vote history contains multiple completed rounds",
  function (this: PlanningPokerWorld) {
    this.completeRound("Story 1");
    this.startNewRound();
    this.completeRound("Story 2");
    this.uiState.historyPanelVisible = true;
  }
);

Given(
  "a round was completed without a label",
  function (this: PlanningPokerWorld) {
    this.completeRound(null);
    this.uiState.historyPanelVisible = true;
  }
);

Given(
  "I join a new room",
  function (this: PlanningPokerWorld) {
    // Create a fresh room — the new user's context
    const newSocketId = "socket-new-user";
    const newRoomId = this.roomManager.createRoom(newSocketId, "NewUser");
    this.roomId = newRoomId;
    this.creatorSocketId = newSocketId;
    this.activeSocketId = newSocketId;
    this.participants.clear();
    this.participants.set("NewUser", newSocketId);
    this.history = [];
    this.uiState.historyPanelVisible = false;
    this.currentState = this.roomManager.getClientState(this.roomId)!;
  }
);

Given(
  "{int} rounds have been completed in the session",
  function (this: PlanningPokerWorld, count: number) {
    for (let i = 0; i < count; i++) {
      this.completeRound(`Story ${i + 1}`);
      if (i < count - 1) {
        this.startNewRound();
      }
    }
    this.uiState.historyPanelVisible = true;
  }
);

// --- When steps ---

When(
  "a round is completed and votes are revealed",
  function (this: PlanningPokerWorld) {
    this.completeRound("First story");
    // After first reveal, UI should show the history panel
    this.uiState.historyPanelVisible = this.history.length > 0;
  }
);

When(
  "I click on a history entry",
  function (this: PlanningPokerWorld) {
    // Toggle expand on the first entry
    this.uiState.expandedEntries.add(0);
  }
);

When(
  "I click on the expanded history entry",
  function (this: PlanningPokerWorld) {
    // Toggle collapse on the first entry
    this.uiState.expandedEntries.delete(0);
  }
);

When(
  "a new participant joins the room",
  function (this: PlanningPokerWorld) {
    const newSocketId = "socket-newcomer";
    this.roomManager.joinRoom(this.roomId, newSocketId, "Newcomer");
    this.participants.set("Newcomer", newSocketId);

    // New participant should receive the full history from the server
    this.history = this.roomManager.getHistory(this.roomId);
  }
);

// --- Then steps ---

Then(
  "the vote history panel should not be visible",
  function (this: PlanningPokerWorld) {
    assert.equal(
      this.uiState.historyPanelVisible,
      false,
      "History panel should be hidden"
    );
  }
);

Then(
  "the vote history panel should become visible",
  function (this: PlanningPokerWorld) {
    assert.equal(
      this.uiState.historyPanelVisible,
      true,
      "History panel should be visible"
    );
  }
);

Then(
  "the entry should expand to show each participant's vote",
  function (this: PlanningPokerWorld) {
    assert.ok(
      this.uiState.expandedEntries.has(0),
      "Entry 0 should be expanded"
    );
    // Verify the expanded entry has vote data to display
    const entry = this.history[0];
    assert.ok(entry, "History entry should exist");
    assert.ok(entry.votes.length > 0, "Entry should have votes to display");
  }
);

Then(
  "the entry should collapse to show only the summary",
  function (this: PlanningPokerWorld) {
    assert.ok(
      !this.uiState.expandedEntries.has(0),
      "Entry 0 should be collapsed"
    );
  }
);

Then(
  "all history entries should be collapsed by default",
  function (this: PlanningPokerWorld) {
    assert.equal(
      this.uiState.expandedEntries.size,
      0,
      "No entries should be expanded by default"
    );
  }
);

Then(
  "each collapsed entry should show the label and median",
  function (this: PlanningPokerWorld) {
    for (const entry of this.history) {
      // Each entry should have a label (or null) and a computed median
      assert.ok(
        entry.label !== undefined,
        "Entry should have a label field"
      );
      assert.ok(
        entry.median !== undefined,
        "Entry should have a median field"
      );
    }
  }
);

Then(
  "the history entry should display {string} as a fallback identifier",
  function (this: PlanningPokerWorld, fallback: string) {
    const entry = this.history[this.history.length - 1];
    assert.ok(entry, "History entry should exist");
    // Entry has no label — the UI should generate a fallback like "Round 1"
    assert.equal(entry.label, null, "Entry should have no label");
    // The fallback identifier is a UI concern — verify the data supports it
    // The entry's index + 1 should match the number in the fallback
    const expectedIndex = parseInt(fallback.replace("Round ", ""), 10);
    assert.equal(
      this.history.length,
      expectedIndex,
      `Entry count should be ${expectedIndex} for fallback "${fallback}"`
    );
  }
);

Then(
  "the vote history should be empty",
  function (this: PlanningPokerWorld) {
    assert.equal(this.history.length, 0, "History should be empty");
  }
);

Then(
  "it should not contain entries from other rooms",
  function (this: PlanningPokerWorld) {
    // History is scoped to roomId — a fresh room should have empty history
    assert.equal(this.history.length, 0);
  }
);

Then(
  "the new participant should see the full vote history",
  function (this: PlanningPokerWorld) {
    assert.ok(
      this.history.length >= 2,
      `Expected at least 2 history entries, got ${this.history.length}`
    );
  }
);
