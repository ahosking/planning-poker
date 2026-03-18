@server
Feature: Round Labeling
  As a planner
  I want to optionally label a voting round
  So that I can identify what each round was estimating

  Background:
    Given I am the session creator in an active planning poker session

  # --- Setting a label ---

  Scenario: Creator sets a label before voting begins
    Given a new voting round has started
    When I set the round label to "User login flow"
    Then all participants should see the label "User login flow" for the current round

  Scenario: Creator updates a label during voting
    Given a new voting round has started with the label "Draft label"
    When I update the round label to "User login flow"
    Then all participants should see the updated label "User login flow"

  Scenario: Round proceeds without a label
    Given a new voting round has started
    And no label has been set
    When participants cast their votes
    Then the round should proceed normally without a label

  # --- Label persistence through reveal and reset ---

  Scenario: Label is preserved when votes are revealed
    Given a voting round is in progress with the label "Payment integration"
    And all participants have voted
    When the votes are revealed
    Then the label "Payment integration" should still be displayed

  Scenario: Label is cleared when a new round starts
    Given a voting round was completed with the label "Old story"
    When the creator starts a new round
    Then the current round label should be empty

  # --- Permissions ---

  Scenario: Only the creator can set the round label
    Given I am a non-creator participant
    When I attempt to set the round label
    Then the label should not be updated
