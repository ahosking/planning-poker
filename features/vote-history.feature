@server
Feature: Vote History
  As a planner
  I want to see a history of votes with optional labels
  So that I can reference past estimates during planning sessions

  Background:
    Given I am a planner in an active planning poker session

  # --- Core scenarios from the user story ---

  Scenario: View vote history after a labeled round is revealed
    Given a voting round has been completed with the label "User login flow"
    And the votes were:
      | Participant | Vote |
      | Alice       | 5    |
      | Bob         | 8    |
      | Priti       | 5    |
    When the votes are revealed
    Then the vote history should contain an entry with label "User login flow"
    And the entry should show each participant's vote

  Scenario: View vote history for an unlabeled round
    Given a voting round has been completed without a label
    When the votes are revealed
    Then the vote history should contain an entry with no label
    And the entry should still show each participant's vote

  # --- History accumulation ---

  Scenario: History accumulates across multiple rounds
    Given a voting round has been completed with the label "Login flow"
    And the votes are revealed
    And a new round is started with the label "Signup flow"
    And all participants have voted
    When the votes are revealed
    Then the vote history should contain 2 entries
    And the most recent entry should have the label "Signup flow"
    And the oldest entry should have the label "Login flow"

  Scenario: History preserves order with newest first
    Given 3 voting rounds have been completed with labels:
      | Label           |
      | Story A         |
      | Story B         |
      | Story C         |
    Then the vote history should list entries in reverse chronological order

  # --- Entry content ---

  Scenario: History entry records the median result
    Given a voting round has been completed with the label "API design"
    And the votes were:
      | Participant | Vote |
      | Alice       | 3    |
      | Bob         | 5    |
      | Priti       | 5    |
    When the votes are revealed
    Then the history entry for "API design" should show a median of 5

  Scenario: History entry records a consensus result
    Given a voting round has been completed with the label "Quick fix"
    And the votes were:
      | Participant | Vote |
      | Alice       | 2    |
      | Bob         | 2    |
      | Priti       | 2    |
    When the votes are revealed
    Then the history entry for "Quick fix" should indicate consensus at 2

  Scenario: History entry handles non-numeric votes
    Given a voting round has been completed with the label "Unknown scope"
    And the votes were:
      | Participant | Vote   |
      | Alice       | ?      |
      | Bob         | 8      |
      | Priti       | coffee |
    When the votes are revealed
    Then the history entry should show all votes including "?" and "coffee"
    And the median should be calculated from numeric votes only
