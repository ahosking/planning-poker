@ui
Feature: Vote History UI
  As a planner
  I want to view and interact with the vote history panel
  So that I can easily reference past estimates

  Background:
    Given I am a planner in an active planning poker session

  # --- Visibility ---

  Scenario: History panel is hidden when no rounds have been completed
    Given no voting rounds have been completed
    Then the vote history panel should not be visible

  Scenario: History panel appears after the first round is revealed
    Given no voting rounds have been completed
    When a round is completed and votes are revealed
    Then the vote history panel should become visible

  # --- Expanding and collapsing entries ---

  Scenario: History entry can be expanded to show vote details
    Given the vote history contains a completed round
    When I click on a history entry
    Then the entry should expand to show each participant's vote

  Scenario: History entry can be collapsed to hide vote details
    Given a history entry is currently expanded
    When I click on the expanded history entry
    Then the entry should collapse to show only the summary

  Scenario: History entries are collapsed by default
    Given the vote history contains multiple completed rounds
    Then all history entries should be collapsed by default
    And each collapsed entry should show the label and median

  # --- Empty and edge states ---

  Scenario: Unlabeled entries display a default identifier
    Given a round was completed without a label
    Then the history entry should display "Round 1" as a fallback identifier

  Scenario: History is scoped to the current session
    Given I join a new room
    Then the vote history should be empty
    And it should not contain entries from other rooms

  # --- Participant who joins mid-session ---

  Scenario: New participant sees existing vote history
    Given 2 rounds have been completed in the session
    When a new participant joins the room
    Then the new participant should see the full vote history
