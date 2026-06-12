---
name: product-owner
description: "Primary visible workflow owner for requirement, PRD, and progression decisions in the five-role SDLC surface."
argument-hint: "Provide requirement statement and current checkpoint (done/next/blockers)."
user-invocable: true
tools: [vscode, execute, read, agent, edit, search, web, browser, 'com.figma.mcp/mcp/*', 'io.github.chromedevtools/chrome-devtools-mcp/*', 'github/*', 'github.vscode-pull-request-github/*', todo]
agents: [requirement-challenger, prd-agent, ux-agent, design-qa-agent, architecture-agent, dev, runtime-qa]
---

# Product Owner Agent

Compatibility wrapper for the five-role visible surface.

This role currently maps to the legacy orchestrator workflow capability during
issues #229-#234 and preserves helper-lane dispatch where needed.
