Feature: Debate Screen Polish
  As a public visitor
  I want to read debate arguments comfortably on mobile
  And see correctly aligned spine dots on tablet and desktop
  So that the timeline is legible and visually coherent

  Scenario: Timeline items carry the timeline item CSS class
    Given the debate screen is loaded
    Then each timeline item has the timeline__item CSS class

  Scenario: Tark timeline items have the tark side class
    Given the debate screen is loaded
    Then each Tark timeline item has the timeline__item--tark class

  Scenario: Vitark timeline items have the vitark side class
    Given the debate screen is loaded
    Then each Vitark timeline item has the timeline__item--vitark class

  Scenario: Each Vitark timeline item contains exactly two grid children
    Given the debate screen is loaded
    Then each Vitark timeline item has exactly 2 direct children

  Scenario: Each Vitark timeline item has a spine cell as its second child
    Given the debate screen is loaded
    Then each Vitark timeline item has a spine cell as its second child

  Scenario: Each Tark timeline item has a spine cell as its second child
    Given the debate screen is loaded
    Then each Tark timeline item has a spine cell as its second child

  Scenario: Spine dots are rendered for all argument cards
    Given the debate screen is loaded
    Then the number of spine dots equals the number of argument cards
