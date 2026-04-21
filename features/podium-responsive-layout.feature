Feature: Podium responsive layout
  As a debate visitor
  I want podium controls to follow mobile, tablet, and desktop responsive layout values
  So that posting interactions stay consistent across viewport tiers

  Scenario: AC-25 tablet-tier podium layout values are present
    Given the podium responsive stylesheet sources are loaded
    Then AC-25 tablet-tier podium FAB spacing values are present
    And AC-25 tablet-tier podium sheet width value is present
    And AC-25 tablet-tier podium dark scrim values are present

  Scenario: AC-26 desktop-tier podium layout values are present
    Given the podium responsive stylesheet sources are loaded
    Then AC-26 desktop-tier podium FAB spacing values are present
    And AC-26 desktop-tier podium sheet width value is present
    And AC-26 desktop-tier podium scrim values are present

  Scenario: AC-27 mobile-tier podium behavior remains frozen
    Given the podium responsive stylesheet sources are loaded
    Then AC-27 mobile-tier podium FAB baseline spacing remains unchanged
    And AC-27 mobile-tier podium sheet width baseline remains unchanged
    And AC-27 mobile-tier podium scrim baseline remains unchanged

  Scenario: AC-28 481px comments are reclassified as mobile-internal
    Given the podium responsive stylesheet sources are loaded
    Then AC-28 the timeline 481px comment is reclassified as mobile-internal
    And AC-28 the timeline 481px comment no longer uses tablet wording
    And AC-28 the debate screen 481px comment is reclassified as mobile-internal
    And AC-28 the debate screen 481px comment no longer uses the tablet divider
    And AC-28 the legend bar 481px comment is reclassified as mobile-internal
    And AC-28 the legend bar 481px comment no longer says tablet and above
    And AC-28 the argument card 481px comment is reclassified as mobile-internal

  Scenario: AC-29 tablet-tier podium layout values match the Figma specification
    Given the podium responsive stylesheet sources are loaded
    Then AC-29 tablet-tier podium FAB spacing matches the Figma specification
    And AC-29 tablet-tier podium sheet width matches the Figma specification
    And AC-29 tablet-tier podium dark scrim matches the Figma specification

  Scenario: AC-30 desktop-tier podium layout values match the Figma specification
    Given the podium responsive stylesheet sources are loaded
    Then AC-30 desktop-tier podium FAB spacing matches the Figma specification
    And AC-30 desktop-tier podium sheet width matches the Figma specification
    And AC-30 desktop-tier podium scrim opacity matches the Figma specification
