---
name: ux-ui
description: "Primary visible UX/UI role in the five-role SDLC surface; wraps the existing UX lane during transition."
tools: [vscode, execute, read, edit, search, web, browser, agent, 'com.figma.mcp/mcp/*', todo]
argument-hint: "Provide PRD Draft Package and any Product Owner UX, platform, or design-system constraints."
user-invocable: true
agents: [design-qa-agent]
---

# UX/UI Agent

Compatibility wrapper for the five-role visible surface.

This role currently maps to the existing UX implementation lane during
issues #229-#234 while keeping Design QA as an internal helper lane.
