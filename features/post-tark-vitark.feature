Feature: Post Tark or Vitark to the Debate Screen
  As a public visitor on the Debate Screen
  I want to compose and publish a Tark or Vitark post
  So that my argument appears immediately in the debate

  Scenario: Composer is visible on initial load
    Given the debate screen is loaded
    Then the composer controls are visible

  Scenario: Tark is preselected by default on load
    Given the debate screen is loaded
    Then Tark is selected by default

  Scenario: Visitor changes side to Vitark; last-selected side is remembered
    Given the debate screen is loaded
    When the visitor selects the Vitark side
    Then Vitark remains selected

  Scenario: Whitespace-only input is rejected with an error message
    Given the debate screen is loaded
    When the visitor enters whitespace-only post text
    And the visitor submits the post
    Then a validation error appears saying "Text cannot be empty or whitespace only."
    And no new debate post is added

  Scenario: Input of fewer than 10 characters is rejected
    Given the debate screen is loaded
    When the visitor enters a post with 9 characters
    And the visitor submits the post
    Then a validation error appears saying "Text must be between 10 and 300 characters."
    And no new debate post is added

  Scenario: Input of exactly 10 characters is accepted
    Given the debate screen is loaded
    When the visitor enters a post with 10 characters
    And the visitor submits the post
    Then one new debate post is added
    And no validation error is shown

  Scenario: Input of exactly 300 characters is accepted
    Given the debate screen is loaded
    When the visitor enters a post with 300 characters
    And the visitor submits the post
    Then one new debate post is added
    And no validation error is shown

  Scenario: Input of more than 300 characters is rejected
    Given the debate screen is loaded
    When the visitor enters a post with 301 characters
    And the visitor submits the post
    Then a validation error appears saying "Text must be between 10 and 300 characters."
    And no new debate post is added

  Scenario: Text with internal spaces and newlines is accepted when length is in range
    Given the debate screen is loaded
    When the visitor enters valid multiline post text
    And the visitor submits the post
    Then one new debate post is added
    And no validation error is shown

  Scenario: Valid post is appended at the bottom of the debate
    Given the debate screen is loaded
    When the visitor publishes the post text "This post should appear at the bottom."
    Then one new debate post is added
    And the latest debate post text is "This post should appear at the bottom."

  Scenario: Composer input is cleared after a valid publish
    Given the debate screen is loaded
    When the visitor publishes the post text "This post should clear the composer input."
    Then one new debate post is added
    And the composer input is cleared

  Scenario: Selected side is preserved after a valid publish
    Given the debate screen is loaded
    When the visitor selects the Vitark side
    And the visitor publishes the post text "This Vitark post should keep the side selected."
    Then one new debate post is added
    And Vitark remains selected

  Scenario: Second publish attempt is blocked while first is in progress (busy lock)
    Given a publish is already in progress in the composer
    When the visitor attempts another publish while busy
    Then the second publish attempt is blocked

  Scenario: Full page refresh resets the debate to baseline static content
    Given the debate screen is loaded
    When the visitor publishes the post text "Session-only post that should disappear on refresh."
    And the page is refreshed
    Then the debate resets to baseline static content