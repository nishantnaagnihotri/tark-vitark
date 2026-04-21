Feature: Podium responsive layout
  As a debate visitor
  I want podium controls to follow mobile, tablet, and desktop responsive layout values
  So that posting interactions stay consistent across viewport tiers

  Scenario: AC-25 tablet-tier podium layout values are present
    Given the podium responsive stylesheet sources are loaded
    Then AC-25 tablet-tier podium layout values are present

  Scenario: AC-26 desktop-tier podium layout values are present
    Given the podium responsive stylesheet sources are loaded
    Then AC-26 desktop-tier podium layout values are present

  Scenario: AC-27 mobile-tier podium behavior remains frozen
    Given the podium responsive stylesheet sources are loaded
    Then AC-27 mobile-tier podium baseline values remain unchanged

  Scenario: AC-28 481px comments are reclassified as mobile-internal
    Given the podium responsive stylesheet sources are loaded
    Then AC-28 the 481px comments are reclassified as mobile-internal

  Scenario: AC-29 Figma tablet values are wired in responsive CSS
    Given the podium responsive stylesheet sources are loaded
    Then AC-29 Figma tablet values are wired in responsive CSS

  Scenario: AC-30 Figma desktop values are wired in responsive CSS
    Given the podium responsive stylesheet sources are loaded
    Then AC-30 Figma desktop values are wired in responsive CSS
