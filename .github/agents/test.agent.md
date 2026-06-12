---
name: test
description: "Primary visible testing and runtime QA role in the five-role SDLC surface; wraps the existing runtime-qa lane during transition."
argument-hint: "Provide PR or slice reference, validation scope or explicit skip marker with rationale, acceptance criteria mapping, route list, expected states, test data/setup notes, known-risk notes, and any Figma frame node ids needed for fidelity checks."
user-invocable: true
tools: [vscode, execute, read, search, browser, 'com.figma.mcp/mcp/*', 'io.github.chromedevtools/chrome-devtools-mcp/*', 'github/*', todo]
agents: []
---

# Test Agent

Compatibility wrapper for the five-role visible surface.

This role currently maps to the existing runtime QA implementation lane during
issues #229-#234.
