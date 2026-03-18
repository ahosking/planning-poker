import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { PlanningPokerWorld } from "../support/world.js";
import type { DataTable } from "@cucumber/cucumber";

// --- Given steps ---

Given(
  "a voting round has been completed with the label {string}",
  function (this: PlanningPokerWorld, label: string) {
    this.roomManager.setLabel(this.creatorSocketId, label);
  }
);

Given(
  "the votes were:",
  function (this: PlanningPokerWorld, dataTable: DataTable) {
    const rows = dataTable.hashes();
    for (const row of rows) {
      const name = row["Participant"];
      const vote = this.parseVote(row["Vote"]);
      let socketId = this.participants.get(name);
      if (!socketId) {
        socketId = this.addParticipant(name);
      }
      this.roomManager.castVote(socketId, vote);
    }
  }
);

Given(
  "a voting round has been completed without a label",
  function (this: PlanningPokerWorld) {
    // No label set — just have participants vote with defaults
    this.castVotesForAll(5);
  }
);

Given(
  "a new round is started with the label {string}",
  function (this: PlanningPokerWorld, label: string) {
    this.startNewRound();
    this.roomManager.setLabel(this.creatorSocketId, label);
  }
);

Given(
  "all participants have voted",
  function (this: PlanningPokerWorld) {
    this.castVotesForAll(5);
  }
);

Given(
  "{int} voting rounds have been completed with labels:",
  function (
    this: PlanningPokerWorld,
    count: number,
    dataTable: DataTable
  ) {
    const labels = dataTable.hashes().map((row) => row["Label"]);
    assert.equal(labels.length, count, `Expected ${count} labels`);

    for (const label of labels) {
      // Set label, vote, reveal, then start a new round (except after last)
      this.roomManager.setLabel(this.creatorSocketId, label);
      this.castVotesForAll(5);
      this.currentState = this.roomManager.revealVotes(this.creatorSocketId)!;

      if (label !== labels[labels.length - 1]) {
        this.startNewRound();
      }
    }

    this.history = this.roomManager.getHistory(this.roomId);
  }
);

// --- Shared step (used as both Given and When across features) ---

// Cucumber matches step text regardless of keyword, so we use a single definition.
// "And the votes are revealed" (Given context) and "When the votes are revealed" both match.
When(
  "the votes are revealed",
  function (this: PlanningPokerWorld) {
    this.currentState = this.roomManager.revealVotes(this.creatorSocketId)!;
    this.history = this.roomManager.getHistory(this.roomId);
  }
);

// --- Then steps ---

Then(
  "the vote history should contain an entry with label {string}",
  function (this: PlanningPokerWorld, label: string) {
    const entry = this.history.find((e) => e.label === label);
    assert.ok(entry, `No history entry found with label "${label}"`);
  }
);

Then(
  "the entry should show each participant's vote",
  function (this: PlanningPokerWorld) {
    const entry = this.history[0];
    assert.ok(entry, "No history entry found");
    assert.ok(entry.votes.length > 0, "History entry has no votes");

    // Verify each participant who voted is represented
    for (const v of entry.votes) {
      assert.ok(v.participant, "Vote missing participant name");
      assert.ok(v.vote !== undefined, "Vote missing value");
    }
  }
);

Then(
  "the vote history should contain an entry with no label",
  function (this: PlanningPokerWorld) {
    const entry = this.history.find((e) => e.label === null);
    assert.ok(entry, "No unlabeled history entry found");
  }
);

Then(
  "the entry should still show each participant's vote",
  function (this: PlanningPokerWorld) {
    const entry = this.history[this.history.length - 1];
    assert.ok(entry, "No history entry found");
    assert.ok(entry.votes.length > 0, "History entry has no votes");
  }
);

Then(
  "the vote history should contain {int} entries",
  function (this: PlanningPokerWorld, count: number) {
    assert.equal(
      this.history.length,
      count,
      `Expected ${count} history entries, got ${this.history.length}`
    );
  }
);

Then(
  "the most recent entry should have the label {string}",
  function (this: PlanningPokerWorld, label: string) {
    assert.equal(this.history[0].label, label);
  }
);

Then(
  "the oldest entry should have the label {string}",
  function (this: PlanningPokerWorld, label: string) {
    assert.equal(this.history[this.history.length - 1].label, label);
  }
);

Then(
  "the vote history should list entries in reverse chronological order",
  function (this: PlanningPokerWorld) {
    for (let i = 0; i < this.history.length - 1; i++) {
      assert.ok(
        this.history[i].timestamp >= this.history[i + 1].timestamp,
        "History entries are not in reverse chronological order"
      );
    }
  }
);

Then(
  "the history entry for {string} should show a median of {int}",
  function (this: PlanningPokerWorld, label: string, expectedMedian: number) {
    const entry = this.history.find((e) => e.label === label);
    assert.ok(entry, `No history entry found with label "${label}"`);
    assert.equal(entry.median, expectedMedian);
  }
);

Then(
  "the history entry for {string} should indicate consensus at {int}",
  function (this: PlanningPokerWorld, label: string, value: number) {
    const entry = this.history.find((e) => e.label === label);
    assert.ok(entry, `No history entry found with label "${label}"`);
    assert.equal(entry.consensus, true, "Entry should indicate consensus");
    assert.equal(entry.median, value);
  }
);

Then(
  "the history entry should show all votes including {string} and {string}",
  function (this: PlanningPokerWorld, vote1: string, vote2: string) {
    const entry = this.history[this.history.length - 1];
    assert.ok(entry, "No history entry found");
    const voteValues = entry.votes.map((v) => String(v.vote));
    assert.ok(voteValues.includes(vote1), `Missing vote "${vote1}"`);
    assert.ok(voteValues.includes(vote2), `Missing vote "${vote2}"`);
  }
);

Then(
  "the median should be calculated from numeric votes only",
  function (this: PlanningPokerWorld) {
    const entry = this.history[this.history.length - 1];
    assert.ok(entry, "No history entry found");
    // With votes [?, 8, coffee], only numeric vote is 8 → median is 8
    const numericVotes = entry.votes
      .map((v) => v.vote)
      .filter((v): v is number => typeof v === "number");
    const expectedMedian = this.computeMedian(numericVotes);
    assert.equal(entry.median, expectedMedian);
  }
);
