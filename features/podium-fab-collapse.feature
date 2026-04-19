Feature: Podium FAB Collapse
  As a mobile user
  I want to access the Podium via a floating action button
  So that debate content is not obscured on small screens

  Scenario: AC-19 — FAB visible on mobile, Podium hidden
    Given I am on the debate screen
    And the viewport is mobile (width < 768px)
    Then I see the Podium FAB button
    And I do not see the inline Podium

  Scenario: AC-20 — FAB expands to show mini-buttons
    Given I am on the debate screen
    And the viewport is mobile (width < 768px)
    When I tap the Podium FAB
    Then I see the Tark mini-button
    And I see the Vitark mini-button
    And I see the dismiss mini-button

  Scenario: AC-21 — Tark side selection opens bottom sheet
    Given I am on the debate screen
    And the viewport is mobile (width < 768px)
    And the FAB is expanded
    When I tap the Tark mini-button
    Then the bottom sheet opens
    And the SegmentedControl has Tark selected

  Scenario: AC-22 — Post submitted via bottom sheet
    Given the bottom sheet is open with Tark selected
    When I type "test argument" in the post text area
    And I tap the Publish button
    Then the post is submitted with side Tark and text "test argument"
    And the bottom sheet closes

  Scenario: AC-23 — FAB and sheet not rendered on desktop
    Given I am on the debate screen
    And the viewport is desktop (width >= 768px)
    Then I do not see the Podium FAB
    And I see the inline Podium
