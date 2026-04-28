Feature: Create Debate Lifecycle
  As a first-time or returning visitor
  I want to create, persist, and replace the active debate
  So that the debate lifecycle works without seeded runtime content

  Scenario: AC-29 AC-30 AC-32 AC-37 empty state gates posting behind valid topic creation
    Given no active debate exists in storage
    And the debate screen is loaded
    Then the debate topic form is visible in empty state
    And the start action is disabled
    And podium entry controls are not visible
    And the hardcoded seeded topic is not shown
    When the visitor enters 121 topic characters
    Then the topic length error is shown
    And the start action is disabled
    When the visitor enters 9 topic characters
    Then the topic length error is not shown
    And the start action is disabled

  Scenario: AC-31 AC-32 AC-33 creating a valid topic transitions into a persisted active debate
    Given no active debate exists in storage
    And the debate screen is loaded
    When the visitor enters debate topic "Should remote work stay flexible?"
    And the visitor presses Start
    Then the active debate heading is "Should remote work stay flexible?"
    And podium entry controls are visible
    When the page is refreshed
    Then the active debate heading is "Should remote work stay flexible?"

  Scenario: AC-34 AC-35 AC-40 replace flow warning and cancel keep the active debate unchanged
    Given an active debate exists in storage
    And the debate screen is loaded
    When the visitor opens debate actions
    And the visitor chooses New Debate
    Then the replace warning is visible
    And the replace form is visible
    When the visitor cancels replacing the debate
    Then the existing active debate remains unchanged

  Scenario: AC-34 replacing an active debate writes a fresh topic and clears prior arguments
    Given an active debate exists in storage
    And the debate screen is loaded
    When the visitor opens debate actions
    And the visitor chooses New Debate
    And the visitor enters debate topic "Should city centers restrict private cars?"
    And the visitor presses Start
    Then the active debate heading is "Should city centers restrict private cars?"
    And the active debate timeline is empty

  Scenario: AC-36 there is no standalone clear action back to empty state
    Given an active debate exists in storage
    And the debate screen is loaded
    Then no standalone clear debate action is available

  Scenario: AC-39 invalid saved debate data returns visitors to create debate state
    Given active debate storage contains corrupt payload
    And the debate screen is loaded
    Then the debate topic form is visible in empty state
    And podium entry controls are not visible

  Scenario: AC-39 unavailable saved debate data returns visitors to create debate state
    Given active debate storage is unavailable
    And the debate screen is loaded
    Then the debate topic form is visible in empty state
    And podium entry controls are not visible
