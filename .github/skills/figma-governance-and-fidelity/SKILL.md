---
name: figma-governance-and-fidelity
description: "Figma design governance workflow: enforce file structure conventions, design system token/library rules, and Figma-to-code fidelity evidence. Use when: preparing Gate 3 artifacts, creating or validating Figma files, enforcing tokenized design values, or verifying frame-level parity requirements."
---

# Figma Governance And Fidelity

Use this skill to enforce shared Figma conventions and fidelity expectations across design and implementation gates.

## When To Use

- Preparing or validating Gate 3 UX, Figma, and Design QA artifacts
- Creating, updating, or reviewing slice Figma files
- Enforcing design-system token and variable usage
- Verifying Figma-to-code parity evidence in PRs

## Figma File Structure Convention

### One File Per Screen (Permanent Living Document)

1. **One Figma file per screen, not per slice.** A screen file is permanent — it outlives all individual slices that touch it.
2. File naming convention: `screen-<screen-name>` (e.g. `screen-debate`, `screen-coming-soon`, `screen-podium`). Prefix `screen-` is mandatory so screen files are distinguishable at a glance in the project.
3. **One page per screen inside the file.** Page name matches the screen name in title case (e.g. `Debate Screen`, `Podium`). There is no `Design` page, no `UX Flows` page, no `QA Notes` page — only the single named screen page. UX flow/state coverage is captured in the `03-ux.md` text artifact only. QA evidence is recorded in comments and in `04-design-qa.md` — not in a separate Figma page.
4. All Figma files must reside in the `TarkVitark` project (not Drafts). MCP `create_new_file` creates files in Drafts (API limitation); the Product Owner must manually move the file to the designated project before any further design work proceeds. No design activity on files in Drafts.
5. Figma file URL is recorded in `03-ux.md` and `04-design-qa.md`. Raw file keys must not appear in git-tracked artifacts — store them only in `.figma-config.local`.

### Section-Per-Slice Layout (Within the Screen Page)

The single screen page is organized into **Figma Sections**, one section per slice that touches the screen.

**Section naming convention:**
```
<zero-padded-slice-number>-<slice-name>  [STATUS]
```
Examples:
```
01-debate-screen  [APPROVED]
02-podium-component  [APPROVED]
03-search-filter  [IN PROGRESS]
```

**STATUS values — exactly one must be present on every section at all times:**

| Status | Meaning |
|---|---|
| `[IN PROGRESS]` | Gate 3A open; active design work in this section |
| `[APPROVED]` | Gate 6 merged; this section is the new canonical baseline |
| `[ARCHIVED]` | Moved off active canvas; preserved for history |

Only one section may have `[IN PROGRESS]` status at any time for a given screen. If a second slice opens while a previous slice is still `[IN PROGRESS]`, that is a gate sequencing violation.

### Frame Naming Convention

All frames use the full canonical path regardless of which section they live in:
```
<ScreenName>/<State>/<Theme>/<Viewport>
```
Example: `DebateScreen/Default/Light/Mobile`

The full name is mandatory because node-targeted URLs carry no page or section context — the frame name is the only self-describing identifier when shared in gate artifacts, PR descriptions, and Issue comments.

**Baseline clone frames** (the reference copy created at the start of a new slice section) are prefixed `_baseline/`:
```
_baseline/DebateScreen/Default/Light/Mobile
```
This distinguishes the reference clone from the active work frame within the same section at a glance.

### Archive Trigger

Archiving is PO-declared — it is not automated. Suggested trigger: canvas page exceeds approximately 500 nodes or Figma canvas performance degrades noticeably. When triggered, PO moves the oldest `[APPROVED]` sections to an `_archive` page manually in Figma desktop (intentionally a human action; it is irreversible and outside MCP scope). Archived sections have their status renamed to `[ARCHIVED]`.

### Migration From Per-Slice Files

Existing per-slice Figma files are migrated to the screen-scoped model at the natural moment: the start of the next slice that touches that screen. Migration steps:
1. Create a new `screen-<name>` file in the `TarkVitark` project.
2. Copy the approved frames from the old slice file into a `01-<original-slice-name> [APPROVED]` section on the new screen page.
3. Record the new file key in `.figma-config.local` under `screen_<name>_file_key`.
4. Retire the old per-slice file (rename to `_deprecated-<original-name>` in the project).
5. Update `03-ux.md` and `04-design-qa.md` in the slice docs folder with the new file URL.

## Figma Baseline-Lock Policy

### Approved Section Is The Baseline (Zero Ambiguity Rule)

The authoritative baseline for any continuation slice is always the frames inside the **highest-numbered `[APPROVED]` section** on the same screen page. There is no other source of truth. No cross-file baseline lookup. No cross-page lookup. No judgment call.

Agent baseline resolution algorithm (mandatory, must be executed via MCP before any frame work):
1. Read all section names on the screen page via MCP.
2. Filter to sections with status `[APPROVED]`.
3. Sort by the zero-padded slice number prefix.
4. Select the highest-numbered result — that section’s frames are the baseline.
5. Record: section name, section node ID, and the node IDs of all approved frames within it. This is the **Baseline Provenance Record**.

If no `[APPROVED]` section exists, this is a new-screen slice — see rule 5 below.

### Baseline-Lock Execution Rules

1. **Continuation slice baseline-lock is mandatory.** UX Agent’s first action after opening a new slice section is `duplicate_node` on each approved frame from the resolved baseline section. The clone lands in the new slice section on the **same page** — no cross-page operations, eliminating variable mode drift.
2. **Rename clones immediately.** Each cloned frame is prefixed `_baseline/` before any other operation. Example: `DebateScreen/Default/Light/Mobile` → `_baseline/DebateScreen/Default/Light/Mobile`.
3. **No rebuilding approved elements.** All elements already present in the approved baseline must come from the physical duplicate only — never rebuilt from raw shapes or new primitives. Only net-new slice additions are authored fresh.
4. **No cross-page or cross-file baseline cloning.** Same-page `duplicate_node` is the only permitted baseline-lock mechanism. If a required baseline frame lives in a different file (legacy per-slice file), the migration protocol must be run first before Gate 3A proceeds.
5. **New-screen slices** have no baseline to duplicate. The first section is created fresh; all elements must reference Design System library variables only.
6. Baseline Provenance Record (approved section name, approved section node ID, source frame node IDs → clone node IDs) is a required field in `Design Review Access`. Missing provenance for a continuation slice is a loop-back condition.
7. **Baseline duplication does NOT guarantee spec compliance.** The baseline frame may contain pre-existing defects that were never corrected. After cloning, the agent must diff against all explicitly stated properties in `04-design-qa.md` (or `03-ux.md` if Design QA has not run yet) and patch any divergence before net-new work proceeds. The spec overrides the baseline value unconditionally.

### Gate 6 Section Promotion (Mandatory Post-Merge Step)

After a PR merges (Gate 6 complete), the Orchestrator renames the active section from `[IN PROGRESS]` → `[APPROVED]` via MCP. This is a required gate closure step — not optional cleanup. Until the rename is done, the baseline algorithm in the next slice will not find this section.

**Promotion checklist:**
- [ ] Section rename: `<n>-<slice-name> [IN PROGRESS]` → `<n>-<slice-name> [APPROVED]`
- [ ] `_baseline/` frames may be deleted from the section (they are superseded by the frames they supported)
- [ ] Figma file URL + approved section node ID recorded in the slice’s `06-tasks.md`

## Design System Foundation Policy

1. The Design System uses a dedicated Figma library file.
2. If the library does not exist, first Gate 3 run bootstraps it and records `design_system_library_file_key` in `.figma-config.local`.
3. Variables use categories: `color/*`, `spacing/*`, `typography/*`, `radius/*`, `shadow/*`, `breakpoint/*`.
4. Theme collection must provide Light and Dark modes from day one.
5. Slice designs must use library variables only.
6. Every screen and state must provide Light and Dark variants.
7. Canonical code-side token file path is `src/styles/tokens.css`. It must define both theme variants using `[data-theme]` selectors plus `prefers-color-scheme` fallback. Slice CSS files import this token file.
8. Figma variable names map 1:1 to CSS custom properties.
9. Design QA must enforce token compliance.
10. **The design system follows a 3-layer library chain (see `3-Layer Design System Architecture` section). M3 primitive components are sourced from the M3 Baseline Kit (L1) — never recreated from raw shapes. TV functional components live in the TV Library file (L2+L3). Slice files import from the TV Library only — no direct M3 Kit enablement in slice files. UX Agent runs a Component Coverage Check before any frame creation; DS library gaps are resolved by UX Agent directly in the DS library.**
11. `.figma-config.local.example` is the committed schema reference for local `.figma-config.local` files.
12. **Variable IDs are file-scoped.** Before writing any variable binding via MCP, look up the variable **by name** in the target file's variable list to get its file-scoped ID. Never transport a `VariableID` from one file into a write call targeting a different file — Figma accepts the write silently but resolves to a fallback fill (white) with no error. Always read back the binding immediately to confirm it resolved correctly.
13. **Token-exists check before creation.** Before creating any variable, call `figma.variables.getLocalVariables()` in the DS library and search by semantic role. If an existing token covers the same use case and its values match the reference, use it — create nothing new. Silently creating a redundant token is a protocol violation.
14. **Always resolve variable IDs fresh at script start.** Never use a `VariableID:XX:YY` value from memory, session notes, or conversation summaries — IDs are file-scoped and differ across files. At the top of every `use_figma` build script, call `figma.variables.getLocalVariableCollections()` and look up each variable by name to obtain its current file-scoped ID.
15. **Verify token bindings immediately after every write.** `figma.variables.setBoundVariableForPaint` fails silently when the variable argument is `null` — it returns a plain hardcoded SOLID paint with no error, which looks visually correct in one theme but never adapts to the other. After building any token-bound node, assert `node.fills[0]?.boundVariables?.color?.id` (and the strokes equivalent) is non-null before declaring the component done. A missing binding ID is a blocking defect.
16. **Component Showcase is mandatory.** The DS Library page must contain a `Component Showcase` frame that displays every published component in both Light and Dark themes. When a new component is added to the DS Library, a corresponding showcase section (Light + Dark instances) must be appended to the Showcase frame in the same gate run. The Showcase is a human reference artifact — it contains only component instances, never component definitions.

## 3-Layer Design System Architecture

The tark-vitark design system uses a strict 3-layer library chain. All agent and tool decisions must respect layer boundaries.

| Layer | File | Contains | Enabled in |
|---|---|---|---|
| **L1 — M3 Baseline** | Material 3 Design Kit (official Google UI Kit, `m3_baseline_library_name` in `.figma-config.local`) | 357 Google M3 spec components — Button, TextField, SegmentedControl, Card, FAB, NavigationBar, Chips, etc. Read-only, never modified. | TV Library file only |
| **L2+L3 — TV Library** | TarkVitark Design System (`design_system_library_file_key`) | Two pages: `Theme Overrides` (brand variable/token overrides on M3 color roles) and `TV Components` (TV-specific functional components: ArgumentCard, Topic, LegendBar, Timeline, SafeArea, etc.) | Slice files |
| **Slice files** | Per-slice file (`<slice>_file_key`) | Design frames only — no component definitions | (end consumers) |

### Library Chain Rules

1. **L1 is read-only.** Never modify, duplicate, or recreate M3 Kit components. Import using `importComponentByKeyAsync` with the M3 Kit component key only.
2. **M3 Kit is enabled only in the TV Library file.** Slice files must NOT enable the M3 Kit directly. M3 components reach slice frames only as nested instances inside TV Components.
3. **TV Components are built using M3 primitives from L1.** When UX Agent creates a TV component in L2+L3, it imports the required M3 primitive via `importComponentByKeyAsync` — never draws from raw shapes.
4. **Slice files enable only the TV Library.** Slice frames place TV Component instances only — never raw M3 primitives.
5. **No recreating M3 primitives anywhere.** If a component exists in the M3 Kit (Button, TextField, SegmentedControl, Card, FAB, etc.) it must be imported from there — never recreated from raw shapes in any file.
6. **`m3_baseline_library_name` and `m3_baseline_library_mcp_key` are required fields in `.figma-config.local`.** UX Agent must verify these are populated before any Component Coverage Check.

### Component Coverage Check (mandatory, self-blocking)

Before building any slice frame, UX Agent must classify each declared component as L1 or L2+L3:

1. **L1 component (M3 primitive):** Verify the component key is queryable via `m3_baseline_library_mcp_key`. Import via `importComponentByKeyAsync`. Never recreate.
2. **L2+L3 component (TV functional):** Verify it is published in the TV Library (`design_system_library_file_key`). If missing, create it in the TV Library using M3 primitives from L1, then publish before proceeding.
3. No slice frame creation until all declared components pass their layer check.
4. Missing or skipped Component Coverage Check is a self-blocking condition.
5. Coverage check result (with layer classification per component) must be documented in the design output.

### Gate-Blocking Conditions

- `UX Readiness: Ready` cannot be claimed if any frame uses a locally-defined component instead of a DS library import.
- `UX Readiness: Ready` cannot be claimed if the M3 Kit is enabled in a slice file.
- `UX Readiness: Ready` cannot be claimed if any M3 primitive was recreated from raw shapes instead of imported from L1.

## Component Promotion Protocol

Applies when a component that was built as a screen-local layer or stand-in (in a screen file) is later required on a second screen and must become a DS Library component.

> **Prevention first.** The Cross-Screen Reuse Scan in Step 3 of `ux-design-execution` is designed to catch this before it happens. This protocol handles the migration when prevention failed.

### Migration Steps (Mandatory Order)

1. **Recreate in DS Library.** Build the component definition in the TV Library (`design_system_library_file_key`) using M3 primitives from L1. Never move layers between files via copy-paste — recreate to ensure clean structure and proper variable bindings.
2. **Publish DS Library.** File — Publish library (or Assets panel — Publish changes). This is a blocking step — no downstream work until PO confirms publish is complete.
3. **Verify import.** Confirm the new component is importable cross-file via `importComponentByKeyAsync` before touching any screen file.
4. **Swap in original screen file.** In the screen file where the local layer existed, replace every local layer instance with a library-imported instance via MCP. Verify all overrides (fills, text content, variant values) are intact after swap.
5. **Verify via read-back.** For each swapped instance, MCP-read `componentId` to confirm it now resolves to the DS Library component key, not a local frame ID.
6. **Use library import in new screen file.** The new screen never sees the local layer — it imports the DS Library component directly.
7. **Record in 06-tasks.md.** Log the promotion event: component name, screens affected, date, and which gate it was actioned in.

### Figma Constraint Note

Figma has no "move component to library" API or UI action. The component definition must be **recreated** in the DS Library. The old local layer becomes dead weight after the swap and should be deleted.

### Gate-Blocking Condition

If a component required on a new screen exists only as a local layer in another screen file, `UX Readiness: Ready` cannot be claimed for the new screen until the promotion migration is complete and import is verified.

## Figma Fidelity Policy

1. For Figma-parity tasks, extract and apply frame-level values from Figma as source of truth.
2. Screenshot-only approximation is insufficient when extractable frame values are available.
3. Responsive implementations map approved Figma frames to explicit breakpoints.
4. PR evidence must include frame-to-code traceability and intentional deviations.

## Validation Checklist

Before approving design or parity work, verify:

1. File/project placement and page/frame naming conventions are satisfied.
2. All design values use Design System library variables.
3. Both Light and Dark variants exist for required states.
4. Figma-to-code evidence is explicit where fidelity is in scope.
