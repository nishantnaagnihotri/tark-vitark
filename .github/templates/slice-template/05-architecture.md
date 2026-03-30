# Architecture Plan

**Template Note:** This is Gate 4 output from architecture-agent. Fill in all sections below with technical design, module boundaries, risks, and task breakdown.

## Slice: `[slice-kebab-name]`
## Gate: 4 — Architecture & Task Decomposition
## Status: READY | Needs Clarification | Blocked
## Version: 0.1.0
## Date: [YYYY-MM-DD]
## Author: Architecture Agent (Gate 4)
## Source: `docs/slices/[slice-name]/04-design-qa.md`

---

## 1. Architecture Readiness

**Status: READY**

**Rationale:**
- [Design is complete and verified]
- [Acceptance criteria are mapped to implementation areas]
- [Module boundaries are clear]
- [Risk mitigation plans are in place]
- [Task decomposition is atomic and ordered]

---

## 2. Architecture Overview

### High-Level Design

[2-3 paragraphs describing the overall approach]

**Key Design Decisions:**
- [Decision 1: Why this approach?]
- [Decision 2: Why this approach?]
- [Decision 3: Why this approach?]

**Traceability:** References to AC-1, AC-2, AC-3 (how design choices satisfy acceptance criteria)

---

## 3. Module Responsibilities

### Module 1: [Module Name]
- **Purpose:** [What does this module do?]
- **Ownership:** [Who implements?]
- **Inputs:** [What depends on this?]
- **Outputs:** [What does it produce?]
- **Files/Folders:**
  - `src/[module-name]/`
  - `tests/[module-name]/`
- **Related AC:** AC-1, AC-2

### Module 2: [Module Name]
- **Purpose:** [What does this module do?]
- **Ownership:** [Who implements?]
- **Inputs:** [What depends on this?]
- **Outputs:** [What does it produce?]
- **Files/Folders:**
  - `src/[module-name]/`
  - `tests/[module-name]/`
- **Related AC:** AC-3, AC-4

---

## 4. Integration Points

| Module A | Module B | Contract | Verification |
|---|---|---|---|
| [Module 1] | [Module 2] | [What does Module 1 export? How is it used?] | [How to test they work together?] |
| [Module 2] | [Module 3] | [What interface between them?] | [How to test they work together?] |

---

## 5. Impact Analysis

### Files to Create
- `src/[path]/[file1].js`
- `src/[path]/[file2].js`
- `tests/[path]/[file1].test.js`

### Files to Modify
- `[existing-file.js]` — [Why? What changes?]
- `[package.json]` — [New dependencies?]

### Files to Delete
- [Any deprecated files?]

### Backward Compatibility
- [Breaking changes?]
- [Deprecation warnings needed?]

---

## 6. Risk & Mitigation Plan

### Risk 1: [Risk Description]
- **Likelihood:** High | Medium | Low
- **Impact:** Critical | Major | Minor
- **Mitigation:** [How to prevent or reduce?]
- **Escalation:** [When do we escalate?]
- **Related AC:** AC-1

### Risk 2: [Risk Description]
- **Likelihood:** High | Medium | Low
- **Impact:** Critical | Major | Minor
- **Mitigation:** [How to prevent or reduce?]
- **Escalation:** [When do we escalate?]
- **Related AC:** AC-2

---

## 7. Verification Strategy

### Unit Tests
- [Module 1 unit tests] → AC-1, AC-2
- [Module 2 unit tests] → AC-3, AC-4

### Integration Tests
- [How modules work together] → AC-1, AC-2, AC-3

### End-to-End Tests
- [Full flow verification] → AC-1 through AC-5

### Manual Verification
- [Steps to verify in browser/device?]

---

## 8. Rollback Plan

**Rollback Approach:** [How is this slice rolled back if issues arise?]

**Rollback Steps:**
1. [Step 1]
2. [Step 2]
3. [Verification that rollback succeeded]

**Rollback Risk:** [Residual risk after rollback]

---

## 9. Task Decomposition

### T1: [Task Title]
- **Objective:** [What delivers?]
- **Files:** [What changes?]
- **Acceptance Criteria:** AC-1
- **Dependencies:** None
- **Estimated complexity:** Small | Medium | Large

### T2: [Task Title]
- **Objective:** [What delivers?]
- **Files:** [What changes?]
- **Acceptance Criteria:** AC-2
- **Dependencies:** T1
- **Estimated complexity:** Small | Medium | Large

### T3: [Task Title]
- **Objective:** [What delivers?]
- **Files:** [What changes?]
- **Acceptance Criteria:** AC-3
- **Dependencies:** T1, T2
- **Estimated complexity:** Small | Medium | Large

### T4: [Task Title]
- **Objective:** [What delivers?]
- **Files:** [What changes?]
- **Acceptance Criteria:** AC-4
- **Dependencies:** T2
- **Estimated complexity:** Small | Medium | Large

### T5: [Task Title]
- **Objective:** [What delivers?]
- **Files:** [What changes?]
- **Acceptance Criteria:** AC-5
- **Dependencies:** T1, T2, T3, T4
- **Estimated complexity:** Small | Medium | Large

---

## 10. BDD Scenarios (Given-When-Then)

**Implementation Contract:** Each scenario below maps to one acceptance criterion (AC). Developer converts each scenario into an executable test (test-first).

### Scenario 1: AC-1
- **Given:** [Initial state or precondition in domain language]
- **When:** [User action or system event in domain language]
- **Then:** [Expected outcome or assertion in domain language]

### Scenario 2: AC-2
- **Given:** [Initial state or precondition in domain language]
- **When:** [User action or system event in domain language]
- **Then:** [Expected outcome or assertion in domain language]

### Scenario 3: AC-3
- **Given:** [Initial state or precondition in domain language]
- **When:** [User action or system event in domain language]
- **Then:** [Expected outcome or assertion in domain language]

### Scenario 4: AC-4
- **Given:** [Initial state or precondition in domain language]
- **When:** [User action or system event in domain language]
- **Then:** [Expected outcome or assertion in domain language]

### Scenario 5: AC-5
- **Given:** [Initial state or precondition in domain language]
- **When:** [User action or system event in domain language]
- **Then:** [Expected outcome or assertion in domain language]

**Test Implementation Guidance:**
- Each scenario becomes one test (e.g., `test: SplashPage displays energetic messaging when loaded`).
- Test names read as domain behavior, not infrastructure (not `testDOMRender()`).
- Developer implements tests first; code passes tests second.
- All tests must pass before PR submission.

---

## 11. Quality Gaps

- [Any ambiguities in module responsibilities?]
- [Any untested integration points?]
- [Any unmitigated risks?]
- [Any BDD scenarios needing clarification?]

---

## 12. Open Questions

| ID | Question | Source | Status | Resolution |
|---|---|---|---|---|
| Q-1 | [Question] | [from PRD/UX] | Resolved / Accepted | [Owner decision] |

---

## 13. Gate Decision

**Gate Decision: can proceed to build | must loop back**

**Rationale:**
- Architecture stays within approved scope.
- All module boundaries are clear.
- All risks have mitigation plans.
- Task decomposition is atomic and dependency-ordered.
- All BDD scenarios are defined in domain language.
- Gate 5 (Build) is authorized once tasks are created as GitHub Issues.
