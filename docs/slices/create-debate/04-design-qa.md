# Gate 3B - Design QA Critique - create-debate

**Slice:** `create-debate`
**Gate:** `3B - Design QA`
**Status:** `COMPLETE — PASS`
**Date:** `2026-04-26`
**Author:** `design-qa-agent` (GPT-5.3-Codex, copilot)
**Source Artifacts:** `docs/slices/create-debate/03-ux.md`, `docs/slices/create-debate/02-prd.md`
**Amendments covered:** `A-1`, `A-2`, `A-3`, `A-4`, `A-5`
**Primary Figma Review Link:** https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=832-452
**Passes:** 3 (Pass 1 identified blockers, Pass 2 cleared core Gate 3 issues, Pass 3 verified the DS Cancel swap)

---

## Design QA Verdict (Pass 2 - 2026-04-25)

**QA Result: PASS**
**Gate Decision: can proceed to Gate 4 (Architecture)**

All 14 deliverable frames reviewed. One blocker (QG-ICON-1: unbound icon fills in `947:476`) was identified in Pass 1, fixed by UX Agent (bound `961:501`, `947:518`, `947:519`, `947:520` to `color/brand/on-primary` `VariableID:65:4`), and verified in Pass 2. Pass 3 also verified A-5 / AC-40: the ReplaceFlow warning remains inline in the topic input area (nodes `897:475` and `898:475`), and no blocking dialog is shown.

### Pass 2 — QG-ICON-1 Resolution Evidence

| Node | Fix Verified | Bound Variable | Resolved Value |
|---|---|---|---|
| `961:501` (theme-toggle moon, Light) | ✅ | `VariableID:65:4` (color/brand/on-primary) | `#FFFFFF` |
| `947:518` (⋮ dot, Light) | ✅ | `VariableID:65:4` | `#FFFFFF` |
| `947:519` (⋮ dot, Light) | ✅ | `VariableID:65:4` | `#FFFFFF` |
| `947:520` (⋮ dot, Light) | ✅ | `VariableID:65:4` | `#FFFFFF` |

### Advisories — Carry to Gate 4

| # | Advisory |
|---|---|
| ADV-1 | CP-6 interaction: New Debate entry via TopAppBar overflow (⋮); implementation must route overflow action to replace flow |
| ADV-2 | OQ-2 (raw vs trimmed validation) — deferred to Gate 4 architecture decision |
| ADV-3 | OQ-3 (localStorage full fallback contract) — deferred to Gate 4 |
| ADV-4 | Theme toggle icons (24×24 visual); if interactive in implementation, use ≥44×44 touch target |
| ADV-5 | Auto-layout clone gotcha: set `layoutMode = 'NONE'` immediately after clone to prevent child stacking drift |

### All 14 Frames — Final Status

| Frame | Node ID | Verdict |
|---|---|---|
| CreateDebate/EmptyState/Light/Mobile | `837:456` | ✅ PASS |
| CreateDebate/EmptyState/Dark/Mobile | `890:457` | ✅ PASS |
| CreateDebate/InputValid/Light/Mobile | `892:458` | ✅ PASS |
| CreateDebate/InputValid/Dark/Mobile | `893:459` | ✅ PASS |
| CreateDebate/InputTooLong/Light/Mobile | `895:460` | ✅ PASS |
| CreateDebate/InputTooLong/Dark/Mobile | `896:461` | ✅ PASS |
| CreateDebate/ReplaceFlow/Light/Mobile | `897:462` | ✅ PASS |
| CreateDebate/ReplaceFlow/Dark/Mobile | `898:463` | ✅ PASS |
| CreateDebate/EmptyState/Light/Tablet | `925:494` | ✅ PASS |
| CreateDebate/EmptyState/Dark/Tablet | `925:507` | ✅ PASS |
| CreateDebate/EmptyState/Light/Desktop | `926:496` | ✅ PASS |
| CreateDebate/EmptyState/Dark/Desktop | `926:509` | ✅ PASS |
| ActiveDebate/Default/Light/Mobile | `947:476` | ✅ PASS (after QG-1 fix) |
| ActiveDebate/Default/Dark/Mobile | `947:521` | ✅ PASS |

---

## Pass 3 - Gate 3B Spot-Check: QG-NEW DS Cancel Swap (2026-04-26)

**QA Result: PASS**
**Gate Decision: can proceed to Gate 4 (Architecture) - no blockers**
**Scope:** DS-backed Cancel instances in ReplaceFlow frames (`897:462` Light, `898:463` Dark)
**Context:** Native Cancel nodes `936:468` and `936:470` replaced by imported TV DS Button/Text instances after PO published the DS library. Spot-check validates the swap is clean.

### Reviewed Nodes

| Node | Frame | Role |
|---|---|---|
| `897:462` | CreateDebate/ReplaceFlow/Light/Mobile | Parent frame - Light |
| `977:481` | child of `897:462` | Cancel DS instance - Light |
| `898:463` | CreateDebate/ReplaceFlow/Dark/Mobile | Parent frame - Dark |
| `977:483` | child of `898:463` | Cancel DS instance - Dark |

### Verification Results

| Check | Result | Detail |
|---|---|---|
| DS instance type | ✅ PASS | Both `977:481` and `977:483` are `INSTANCE` nodes |
| mainComponentKey | ✅ PASS | Both: `0eee15af12f5a3539394ea96a8edda4ff2744eaf` (TV DS Button/Text state=enabled) |
| Label text | ✅ PASS | `characters = "Cancel"` confirmed in both |
| Placement (x, y) | ✅ PASS | Both at `x=160, y=567` |
| Dimensions | ✅ PASS | Both `68×40px`, HUG horizontal, FIXED vertical |
| Visibility | ✅ PASS | `visible: true` in both |
| Old native nodes removed | ✅ PASS | `936:468` ABSENT, `936:470` ABSENT |
| Visual - Light (`897:462`) | ✅ PASS | Screenshot confirms dark-blue Cancel on white surface (correct light-mode rendering) |
| Visual - Dark (`898:463`) | ✅ PASS | Screenshot confirms lavender Cancel on dark surface (correct dark-mode rendering, mode override active) |
| Frame names / dimensions | ✅ PASS | Unchanged: `CreateDebate/ReplaceFlow/Light/Mobile` and `/Dark/Mobile`, both `390×844px` |
| AC-35 visual coverage | ✅ PASS | Cancel affordance present and legible in both themes |

### Advisories (non-blocking)

**DQG-S1 - Token lineage (advisory):** The Cancel label fill in both instances binds to `VariableID:c79806f9d4af4247e65f8f327dc0a5da3f568cfa/34:1`, which resolves as `color/primary` from the M3 Baseline library (collection `3f8bb364362f342755859d72df0f0e46c5cda70e/4:40`), not directly to TV DS `color/brand/primary` (`VariableID:65:3`). The binding is internal to the TV DS Button/Text component and was not overridden at the instance level. Visual rendering is identical to `color/brand/primary` in both Light and Dark modes (confirmed via screenshot). Component-governed binding is correct behavior; A-4's "fill bound to `color/brand/primary`" was written for the pre-DS-component era. No Gate 4 action required unless DS team wants to align the Button/Text component's internal binding to `color/brand/primary` for token lineage purity.

**DQG-S2 - A-4 doc currency (advisory, closed):** At spot-check time, A-4 in 02-prd.md still referenced legacy Cancel node IDs `936:468` (Light) and `936:470` (Dark). This has now been corrected in A-4 to DS instances `977:481` (Light) and `977:483` (Dark). No further action required.

### Figma Access

| Frame | Link |
|---|---|
| ReplaceFlow/Light (Cancel `977:481`) | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=897-462 |
| ReplaceFlow/Dark (Cancel `977:483`) | https://www.figma.com/design/CsPAyUdLSStdmNpmiBMESQ?node-id=898-463 |

---

## Archive: Earlier Session (pre-Pass 1 — Needs Revision at that point)

> **SUPERSEDED / DO NOT ACTION**
> This archived Pass 1 record is historical only and has been superseded by the **Final Design QA Verdict (Pass 2 — 2026-04-25)** above.
> Do not use the archived "Needs Revision" outcome below for current gate closure or routing decisions.

Persisted from the 2026-04-25 earlier Gate 3B `design-qa-agent` pass. Context: before ActiveDebate frames were added (only 12 deliverable frames; Cancel buttons and CP-6 were the open items at that stage). Kept for traceability only.

## 1. Design QA Readiness

**Needs Revision**

Two quality gaps required resolution before this slice was eligible for Product Owner approval at that time. Both were fixable in a single focused pass; neither expanded scope.

## 2. Figma Access Confirmation

**Section accessed:** `06-create-debate [IN PROGRESS]` - node `832:452`, file `CsPAyUdLSStdmNpmiBMESQ`

**Frame count observed: 13 nodes** in section (12 deliverable frames + 1 baseline clone).

| # | Frame Name | Node ID | Dimensions | Verified |
|---|---|---|---|---|
| 1 | `CreateDebate/EmptyState/Light/Mobile` | `837:456` | 390x844 | Yes |
| 2 | `CreateDebate/EmptyState/Dark/Mobile` | `890:457` | 390x844 | Yes |
| 3 | `CreateDebate/InputValid/Light/Mobile` | `892:458` | 390x844 | Yes |
| 4 | `CreateDebate/InputValid/Dark/Mobile` | `893:459` | 390x844 | Yes |
| 5 | `CreateDebate/InputTooLong/Light/Mobile` | `895:460` | 390x844 | Yes |
| 6 | `CreateDebate/InputTooLong/Dark/Mobile` | `896:461` | 390x844 | Yes |
| 7 | `CreateDebate/ReplaceFlow/Light/Mobile` | `897:462` | 390x844 | Yes |
| 8 | `CreateDebate/ReplaceFlow/Dark/Mobile` | `898:463` | 390x844 | Yes |
| 9 | `CreateDebate/EmptyState/Light/Tablet` | `925:494` | 768x1024 | Yes |
| 10 | `CreateDebate/EmptyState/Dark/Tablet` | `925:507` | 768x1024 | Yes |
| 11 | `CreateDebate/EmptyState/Light/Desktop` | `926:496` | 1440x900 | Yes |
| 12 | `CreateDebate/EmptyState/Dark/Desktop` | `926:509` | 1440x900 | Yes |
| - | `_baseline/DebateScreen/FAB-Collapsed/Light/Mobile` | `832:453` | 390x2328 | Yes (ref) |

Frame naming convention (`<ScreenName>/<State>/<Theme>/<Viewport>`) is correctly applied to all 12 deliverable frames. Baseline clone correctly prefixed `_baseline/`. Section status marker `[IN PROGRESS]` is correct.

Screenshots obtained for `837:456` (EmptyState/Light/Mobile), `890:457` (EmptyState/Dark/Mobile), `897:462` (ReplaceFlow/Light/Mobile), and `898:463` (ReplaceFlow/Dark/Mobile) - all returned valid PNG dimensions (390x844), confirming frames render without errors.

## 3. PRD Traceability Review

Source: `02-prd.md`, AC-29 through AC-39.

| AC | Criterion (summary) | Figma Coverage | Status |
|---|---|---|---|
| AC-29 | Empty state with debate-creation affordance; no Podium | EmptyState frames (837:456, 890:457, 925:494/507, 926:496/509) - TV icon + TextField + counter + disabled Start button; no FAB visible | Covered |
| AC-30 | 10-120 char constraint; blocking + visible error | InputValid frames (button enabled) + InputTooLong frames (button disabled, error text `895:473`/`896:473`, counter shows >120) | Covered |
| AC-31 | Valid submit -> debate created -> UI transitions to active debate | InputValid frames show enabled Start button as the submission trigger; transition is behavioral (Gate 4) | Covered |
| AC-32 | Podium absent before debate creation | No FAB/Podium instance in any CreateDebate frame | Covered |
| AC-33 | Arguments persist; restored on return | `ActiveDebate/Default` covered by baseline clone `832:453` (existing approved design) | Covered (baseline ref) |
| AC-34 | Replace flow: atomic replace with entry trigger | ReplaceFlow frames (897:462, 898:463) cover the replace UI with inline warning; entry trigger (`New Debate` button) not designed - see Quality Gap 2 | Partial |
| AC-35 | Abandoning replace leaves debate intact | UX Flow 3 step 2b says `User clicks Cancel`; UI Control Contract defines a Cancel TextButton; neither ReplaceFlow frame contains a Cancel button node | Gap - see Quality Gap 1 |
| AC-36 | No standalone clear-to-empty-state action | No such action visible in any frame | Covered (negative req) |
| AC-37 | Hardcoded DEBATE constant removed | Code/implementation requirement; EmptyState has no seeded content | Covered by absence |
| AC-38 | No argument count cap | No count-cap UI in any frame | Covered (negative req) |
| AC-39 | localStorage failure -> graceful empty state | CP-11 decision: failure renders same visual as EmptyState - covered by EmptyState frames | Covered (CP-11) |

## 4. UX Coverage Review

Source: `03-ux.md` UX Flows and State Matrix.

| UX Flow / State | Figma Coverage | Status |
|---|---|---|
| Flow 1 - First-time create (steps 1-5) | EmptyState -> InputValid -> (implicit submit) | All states present |
| Flow 2 - Returning visit | Baseline clone `832:453` (active debate with FAB) | Covered (ref baseline) |
| Flow 3 - Replace active debate (steps 1-2a) | ReplaceFlow/Light and /Dark - inline warning + enabled Start | Present |
| Flow 3 - step 2b: `User clicks Cancel -> dismiss` | No Cancel button node in `897:462` or `898:463` | Gap - see Quality Gap 1 |
| Flow 4 - localStorage failure | Covered by EmptyState (CP-11 documented decision) | Covered |
| State: EmptyState M/T/D x L/D | 2 Mobile + 2 Tablet + 2 Desktop = 6 frames | Covered |
| State: InputValid Mobile x L/D | `892:458`, `893:459` | Covered |
| State: InputTooLong Mobile x L/D | `895:460`, `896:461` - error text present | Covered |
| State: InputTooShort | Not a separate frame - EmptyState covers 0-9 chars (disabled button, no error) | Covered (by design) |
| State: ReplaceFlow Mobile x L/D | `897:462`, `898:463` - inline warning present | Covered |
| State: LocalStorageError | Not a separate frame - EmptyState covers (CP-11) | Covered (by design) |
| State: ActiveDebate/Default | Baseline ref `832:453` - existing approved screen | Covered (ref baseline) |
| Mobile-only state coverage decision | PO-confirmed: InputValid, InputTooLong, ReplaceFlow are mobile-only | Consistent |

**Stale history vs structural contradiction check:** The checkpoint ledger (checkpoints 1-20) contains historical execution notes including a stale placeholder `What's the debate about?` (checkpoint 5) and old button sizing notes (358x40) from before the HUG fix. These are harmless history clearly superseded by later checkpoints and the final UI Control Contract. No structural contradiction exists in the historical notes themselves.

The only structural text contradiction is in the CP table - see Quality Gap 2.

## 5. Component and Token Consistency Review

| Check | Finding | Status |
|---|---|---|
| Frame naming convention | All 12 frames follow `<ScreenName>/<State>/<Theme>/<Viewport>` | OK |
| Section naming convention | `06-create-debate [IN PROGRESS]` follows zero-padded + `[STATUS]` spec | OK |
| Frame surface background token | `color/surface` bound on all 8 Mobile frames (Bug 1 remediated, checkpoint 15) | OK |
| TV lettermark - Light | Dark-blue circle (#4555B7) + white `TV` - `color/brand-primary` local variable (legacy naming; current canonical: `color/brand/primary`) | OK |
| TV lettermark - Dark | Lavender circle (#BBC3FF) + dark-navy `TV` - fixed to LOCAL `color/brand/on-primary` (VariableID:65:4) after imported-variable scope bug, checkpoint 17 | OK |
| SystemChrome fills | StatusBar + GestureNav fills bound to `color/surface` (6 nodes x 8 frames, Bug 2 remediated) | OK |
| Placeholder text fill | `color/on-surface-variant` (VariableID:149:8) | OK |
| Counter fill | `color/on-surface-variant` (normal state) | OK |
| TextField stroke | `color/outline` (VariableID:4:28) | OK |
| Button/Filled | DS library instance; disabled state uses label opacity=0.38 per M3 spec (checkpoint 13 fix) | OK |
| Button HUG sizing | Mobile: 82x40, x=154 (center=195 approximately 390/2); Tablet: x=343 (center=384=768/2); Desktop: x=679 (center=720=1440/2) | OK |
| Tablet/Desktop SystemChrome | Not present - correct for non-mobile viewports | OK |
| Acceptable hardcoded values | TextField inner fill (`#ffffff` at opacity=0 - invisible) and `#fffbff` white on TV lettermark - both documented as acceptable per DQG checkpoint 15 | OK (documented) |
| Cancel button token/component | UI Control Contract specifies `Button/Text` or `TextButton` - not present in Figma, no token to verify | Gap |

DS library variables referenced in all frames are from the correct local collection (`VariableCollectionId:65:2`) following the local-vs-imported scope fix (checkpoint 17). No raw hex colors or hardcoded spacing are used in any token-bound node.

## 6. Edge State Coverage Review

| Edge State | PRD | Figma Coverage | Status |
|---|---|---|---|
| Loading (empty, 0 chars) | AC-29 | EmptyState - disabled button, `0 / 120` counter | Covered |
| Valid input (10-120 chars) | AC-30, AC-31 | InputValid - enabled button, wider placeholder node | Covered |
| Error / too long (>120 chars) | AC-30 | InputTooLong - error text node present (`895:473`/`896:473`), button at y=491 accounting for text height | Covered |
| Too short (1-9 chars) | AC-30 | Covered by EmptyState (same visual: disabled, no error) - design decision, no separate frame | Covered |
| Replace flow / inline warning | AC-34 | ReplaceFlow - warning text present (`897:475`/`898:475`), button enabled at y=519 | Covered |
| Replace flow / abandon (Cancel) | AC-35 | No Cancel affordance in Figma - UI Control Contract and UX Flow 3 both specify a Cancel button | Gap |
| localStorage failure | AC-39 | CP-11 decision: EmptyState covers failure gracefully | Covered |
| Podium absent on empty state | AC-32 | No FAB instance in any CreateDebate frame | Covered |

## 7. Quality Gaps

### QG-1 - STRUCTURAL: Cancel affordance absent from both ReplaceFlow frames

**Severity:** Structural - routes back to UX agent.

**What's wrong:** The UI Control Contract defines a `Cancel` `Button/Text` or `TextButton` for the ReplaceFlow (`Label: "Cancel", Behavior: Dismiss replace form; return to active debate - no data change`). UX Flow 3, step 2b reads: `User clicks Cancel -> dismiss -> existing debate fully intact | AC-35, FR-8.` Neither `897:462` (ReplaceFlow/Light/Mobile) nor `898:463` (ReplaceFlow/Dark/Mobile) contains a Cancel button node in Figma. The Orchestrator Resume Packet summary for both frames describes only `inline warning text, enabled Start button` - no Cancel.

**Impact:** AC-35 visual coverage is incomplete. Gate 4 engineers have no visual spec for the abandon affordance: they cannot determine from the Figma design whether Cancel is an explicit button or a system-back-only gesture.

**Resolution required (choose one):**
- **Option A (add Cancel button):** Add a `Cancel` TextButton to both ReplaceFlow frames, positioned below the `Start` button or secondary to it, consistent with M3 Text Button conventions. Update node IDs in the Design Access Snapshot. Label: `Cancel.`
- **Option B (clarify system-back intent):** If the PO's intent is that system back is the only cancel mechanism (consistent with CP-4 for the create flow), then update the UI Control Contract to remove the Cancel Button entry, update UX Flow 3 step 2b to read `User presses system back -> existing debate fully intact` instead of `User clicks Cancel,` and add an explicit note that no Cancel button node is required in the Figma frames. Document this as a PO-confirmed decision in the checkpoint ledger.

Either option resolves the contradiction between the UX text and the Figma frames.

### QG-2 - DOCUMENT: CP-6 resolution status is internally contradictory

**Severity:** Documentation inconsistency - does not require a new Figma frame, but the text must be corrected.

**What's wrong:** The Challenge Phase status footer states `Must Resolve (Phase 2): CP-2, CP-5, CP-6 - all resolved.` However, the individual CP-6 entry reads: `Pending PO confirmation for Phase 2.` No checkpoint in the ledger records a PO decision on the `New Debate` TextButton placement. No Figma frame shows the Active Debate view with a `New Debate` trigger.

**Impact:** The CP-6 entry leaves AC-34's entry trigger visually undesigned. Gate 4 engineers reading the artifact cannot determine the confirmed placement. The footer falsely asserts resolution.

**Resolution required (choose one):**
- **Option A (confirm resolution):** If the PO did verbally confirm the `New Debate` TextButton placement (below topic heading, right-aligned, secondary visual weight), record that decision in CP-6 and add a checkpoint entry. Note whether a Figma frame is required or whether the placement is a Gate 4 implementation decision only.
- **Option B (explicit deferral):** If the `New Debate` trigger placement is genuinely deferred to Gate 4, update the CP-6 entry to read `Deferred to Gate 4 - placement confirmed as implementation decision; no separate Figma frame required for Gate 3.` Update the footer status accordingly.

Either option must make the CP-6 entry and the footer consistent.

## 8. Open Questions

| ID | Question | Status |
|---|---|---|
| OQ-1 | Replace flow confirmation guard | CLOSED - inline warning confirmed by PO. Figma frames execute correctly. |
| OQ-2 | Trimmed vs raw topic validation | Deferred to Gate 4 - correctly not a Gate 3B blocker; no Figma implication. |
| OQ-3 | localStorage fallback contract | Deferred to Gate 4 - AC-39 visual floor (EmptyState graceful fallback) is covered. Not a Gate 3B blocker. |
| OQ-4 | FormOpen state transition | CLOSED - FormOpen eliminated; form is directly in EmptyState. Correctly resolved. |
| CP-6 text | `New Debate` trigger PO confirmation | Unresolved in document - footer says resolved, individual entry says pending. Requires text correction (see QG-2). |
| Cancel button | ReplaceFlow abandon mechanism | Unresolved in Figma - defined in UX text but absent from Figma frames. Requires resolution (see QG-1). |

## 9. Gate Decision

**Route back to ux-agent with revision instructions.**

The slice cannot proceed to Product Owner approval with the following two outstanding items:

**Revision instructions to UX agent:**

1. **QG-1 - Cancel affordance in ReplaceFlow (required before re-review):**
   Target frames: `897:462` (ReplaceFlow/Light/Mobile) and `898:463` (ReplaceFlow/Dark/Mobile).
   Choose Option A or Option B as defined in Quality Gaps section above. If choosing Option A, add a Cancel TextButton node to both frames and update the Design Access Snapshot with any new node IDs. If choosing Option B, update the UI Control Contract (remove Cancel Button entry), update UX Flow 3 step 2b, and confirm with a PO decision marker in the checkpoint ledger.

2. **QG-2 - CP-6 document correction (required before re-review):**
   Update the individual CP-6 entry to be consistent with the footer. Either record the actual PO decision (with checkpoint) or explicitly mark as deferred to Gate 4. Update the footer to reflect the true status.

After both corrections are made, Design QA can be re-run against the updated artifact and frames. If both gaps are resolved, the slice will be Agent-Ready for Product Owner approval.

## 10. Design QA Verdict Package

**Not issued.** The slice is not yet Agent-Ready. The Design QA Verdict Package will be issued in the next pass after QG-1 and QG-2 are resolved and the revised Figma frames and `03-ux.md` artifact have been verified.

## 11. Product Owner Approval Status

**Pending** - Routes back to UX agent for revision. Product Owner review will be requested after the next Design QA pass returns Agent-Ready.

---
