---
name: ux-design-execution
description: "UX and Figma execution workflow: run the Challenge Phase, produce UX Flow/State Package, execute Figma pixel frames via MCP using single-screen-first protocol. Use when: performing Gate 3A UX work directly as the Orchestrator, creating or modifying Figma design frames, executing DS library operations, or validating UX coverage before Design QA."
---

# UX Design Execution Workflow

Use this skill when executing Gate 3A UX work directly. This skill transfers the full UX Agent execution contract to the Orchestrator. Follow every section in order.

## When To Use

- Gate 3A UX+Design single-pass execution
- Creating or modifying Figma design frames on the slice Design page
- Creating or modifying TV Library components in the DS library
- Verifying UX coverage before handing off to Design QA

## Mandatory Link Rule (Applies To Every Screenshot Shown)

**Any time a Figma screenshot is shared** — whether for Phase 1 review, a sandbox frame, a spot-check, or any interim result — you MUST include the node-targeted Figma URL immediately alongside or below the image.

Format: `https://www.figma.com/design/<fileKey>/<fileName>?node-id=<nodeId>`

Convert `:` to `-` in `nodeId` when building the URL (e.g., `304:30` → `node-id=304-30`).

Never share a screenshot without the link. This rule applies to all agents executing this skill.

## Validate-After-Every-Write Protocol (Applies to ALL Figma MCP Writes, Always)

This protocol is not optional and is not scoped to sandbox work. It applies to **every single MCP write call** throughout this skill — DS library changes, frame creation, fill binds, text edits, variant sets, mode assignments, and token assignments.

### Variable Resolution Rule (Cross-File Safety — Mandatory)

Variable IDs are **file-scoped**. A variable written as `VariableID:9:2` in the DS Library has a completely different ID in a slice file, even if it represents the same token. Transporting an ID from one file into another file's write call silently accepts the call and produces a fallback fill (white) with no error.

**Required protocol for every variable binding write:**

1. Identify the **target file** (the file you are writing into: DS Library key or slice file key).
2. Call `figma.variables.getLocalVariables()` (or equivalent MCP list call) **in that target file**.
3. Find the variable by its **semantic name** (e.g., `color/brand/primary`) in that file's variable list.
4. Use the ID returned by that lookup — never copy an ID from a different file, a snippet, or a prior session log.
5. After writing the binding, read it back immediately (Write-Verify-Correct Loop). If the read-back shows no binding or a fallback fill, the ID was wrong — re-resolve from step 2.

### Local vs Imported Variable Scope Rule (Mandatory for All Variable Bindings)

`setExplicitVariableModeForCollection(collectionId, modeId)` applies a mode override **only to the collection whose ID you pass**. If a node is bound to a variable from a *different* collection (e.g., an imported DS library variable whose collection ID ≠ the local file's collection ID), that override has **zero effect** on the imported variable's resolved value.

**This is the most common silent failure pattern for dark-mode color fixes.** The API accepts the call, returns success, and read-back confirms the override is set — but the imported variable never changes its resolved color.

**Required check before every variable binding write:**

1. Call `figma.variables.getLocalVariables()` in the target file and find the variable **by semantic name**.
2. Check `variable.variableCollectionId`. It must match the collection ID you are setting the mode override on.
3. If the variable's `variableCollectionId` does **not** match the frame's mode-overridden collection, you are binding the wrong variable — it is an imported alias from a different collection.
4. **Always bind to the LOCAL file variable** (found via `getLocalVariables()` by name), not to a variable imported via `importVariableByKeyAsync`. The local variable participates in the local collection's mode override; the imported one does not.
5. After binding, confirm `fills[0].boundVariables.color.id` starts with `VariableID:<localCollectionNumericPrefix>` — imported variables have the format `VariableID:<libraryFileKey>/<n>:<m>` and are visually distinguishable.

### Visual Screenshot Verification Rule (Mandatory After Every Color/Token/Mode Fix)

MCP read-back confirms that a property is **set**. It does not confirm what **color the frame actually renders**. Variable resolution is multi-layered (binding → collection scope → mode override → resolved value), and each layer can pass individually while the final render is still wrong.

**Required after any color token binding, mode override, or variable rebind:**

1. **Take a full-frame screenshot** of every affected frame using `get_screenshot`.
2. **Visually inspect the rendered output** — confirm the actual rendered color, not just that a variable ID is bound.
3. **For any frame with Light and Dark variants**, screenshot both variants, not just one.
4. **Only after visual confirmation** → log the fix as complete and update any checkpoint or checklist entry.
5. **Never claim a color/token/mode fix is done based on API data alone.** The fix is done only when the screenshot shows the correct rendered color.

Log format for visual verification:

```
[VISUAL CHECK] <frame node ID> | <theme variant> | expected: <description> | screenshot: taken
[RESULT] ✅ renders correctly | 🔴 still wrong — rebind required
```

### Write-Verify-Correct Loop (Mandatory for Every Change)

1. **Write:** apply the change via MCP (`use_figma`, `update_node`, `set_fills`, `set_variable_mode`, etc.).
2. **Verify immediately:** in the same follow-up MCP call, read back the exact property that was written and compare value-for-value against the intended target.
   - Fill → read `fills[0].color` and `fills[0].boundVariables.color.id`; confirm hex and variable ID match.
   - Variable binding → read the bound variable ID back; confirm it matches the variable you intended.
   - Text → read `characters`; confirm the string.
   - Variant → read the relevant property; confirm the value.
   - Mode assignment → read the explicit variable mode; confirm the collection and mode ID.
   - Geometry (corner radii, size) → read `topLeftRadius`, `topRightRadius`, `bottomLeftRadius`, `bottomRightRadius`, `width`, `height` individually.
3. **If the read-back matches the intent → log the verified result and continue.**
4. **If the read-back does NOT match:**
   - Classify the mismatch type: wrong variable aliased, stale cache, node ID resolved to wrong node, property silently overridden by auto-layout, etc.
   - Attempt the correction using the correct MCP approach (e.g., use `figma.variables.setBoundVariableForPaint` instead of `boundVariables` direct write if binding failed).
   - Re-read to verify the correction.
   - If still not matching after two correction attempts → **raise a loop-back condition** (see Zero Autonomous Gap Decisions below). Do NOT proceed past a failed verify.
5. **For color/token/mode changes: MCP read-back is necessary but not sufficient.** After read-back passes, also run the Visual Screenshot Verification Rule above. A correct binding can still produce the wrong rendered color if the variable is from the wrong collection scope.

### Per-Change Verification Log Format

For every write in a session, append to the in-progress log:

```
[WRITE] <node ID> | <property> | intended: <value> | call: <MCP method>
[VERIFY] read-back: <value> | match: YES / NO
[STATUS] ✅ confirmed | ⚠️ mismatch — correction attempted | 🔴 loop-back
```

This log is embedded in the `Quality Gaps` output section. If no gaps: state ✅ all writes verified.

### Loop Until Clean

No step in this skill is complete until its read-back verify passes. If a verify fails, do not move to the next step. Fix and re-verify before advancing. Keep looping until the intended value is confirmed — there is no maximum iteration limit. The loop ends only on a confirmed match or a declared loop-back condition that requires PO input.

---

## Sandbox Iteration Protocol (Control Finalization)

When working on an isolated sandbox frame (control finalization, not a full gate frame pass):

### 0. Layout-First Rethink (Mandatory Before Any Styling Fix)

Before touching any colour, spacing, or copy, stop and answer these questions from a **human perspective**:

1. **What is the user actually doing?** Name the primary action and how the components support it physically.
2. **How do the components relate to each other?** Is the layout a sequence (do A then B then C) or a composition (do A with B simultaneously)?
3. **Does the current layout match that relationship?** A vertical stack of independent components is a form. A messaging composer is a horizontal composition. A tab + content arrangement is a hierarchy. Pick the right structure before fixing any surface property.
4. **Is the visual weight proportional to the importance of each element?** The primary action must be the most visually prominent. Helper information must be subordinate.
5. **Does it feel intentional or accidental?** Every gap, every alignment, every size relationship must be deliberate. Defaults are not design decisions.

If the layout structure does not match the human mental model of the interaction, **rebuild the layout first**. Do not apply colour or copy fixes to a structurally wrong layout.

### 1. Self-Review After Every Change

After applying any fix, take a screenshot and critique against: layout structure, brand colour fidelity, typography, spacing rhythm, alignment symmetry, surface treatment, copy, and component variant correctness. **Also verify via MCP read-back per the Validate-After-Every-Write Protocol above — screenshot alone is not sufficient.**

### 2. Keep Iterating Until Zero Issues Remain

As long as any issue is found in the self-review OR any MCP read-back verify has failed, continue fixing. Do NOT present to Product Owner while known issues exist. There is no maximum iteration count — continue looping until every property is confirmed clean.

### 3. Batch Related Fixes Per Iteration

Group changes of the same type (e.g., all layout changes, then all colour changes) in one `use_figma` call to minimise round-trips and avoid drift between calls. Then issue a single batched read-back call that verifies all changed properties before moving on.

### 4. Log Each Iteration

For each cycle, record: what was wrong, what was changed, what MCP call was used, what the MCP read-back returned, and what the self-review found after.

### 5. Present Only When Self-Review And All Read-Backs Are Clean

When no further issues are found in the self-review AND every write in this cycle has a confirmed matching read-back, present the final screenshot + node-targeted Figma URL with a concise changelog of all iterations and the verification log.

### 6. Do Not Escalate Mid-Iteration

Do not ask Product Owner for direction or approval while issues are still being resolved. The only exception is a loop-back blocker (missing DS component, MCP tool failure, or ambiguity that requires a product decision).

## Role When Executing This Skill

1. Convert a validated `PRD Draft Package` into explicit user flows and state coverage.
2. Surface UX gaps, missing states, and content ambiguities before frame execution.
3. Preserve scope boundaries and Product Owner decisions from prior gates.
4. Produce a `UX Flow/State Package` as both the text artifact and the authoritative source for Design QA.
5. Execute Figma pixel frames directly using MCP tools.
6. Perform mandatory baseline-lock for continuation slices.
7. Run Component Coverage Check before any frame creation.
8. Ensure every UX pass outputs a mandatory Figma design artifact reference (Figma file URL, never raw key).
9. Block progression when UX coverage is incomplete or inconsistent with the PRD.
10. For interactive journeys, define an explicit `UI Control Contract` and `M3 Control Mapping`.
11. Provide `Design Review Access` with node-targeted links to actual frames created this pass.

## Step 1 — Challenge Phase (Mandatory Before Any Flow Artifacts)

Run an internal stress-test against the PRD Draft Package before producing any flow or frame artifacts. Report all findings before proceeding.

Challenge dimensions:

1. **Ambiguity:** identify any user goal, flow, or requirement that is vague, contradictory, or incompletely specified.
2. **State coverage:** flag missing UI states (loading, empty, error, success, permission, edge-case transitions) not addressed by the PRD.
3. **Flow completeness:** verify every entry point, exit point, and branching path is accounted for.
4. **Content and dependencies:** surface unknown content dependencies, undefined copy, or external integrations not yet resolved.
5. **Constraints:** check for missing accessibility, platform, localization, or DS constraints that would cause speculative design decisions.
6. **Scope:** flag any UX interpretation that would silently expand or contract the PRD scope.
7. **Control-contract:** for every input/submit journey, force explicit decisions on control type, validation trigger timing, error presentation, disabled/loading behavior, success feedback, and keyboard/focus handling.
8. **M3-control:** verify each input/submit control maps to a concrete M3 component and variant, with required interaction states and token/state references documented.

   **Control selection rule (applies to every component, every context):**

   Before placing any component, answer two questions:
   1. **What is this component's semantic role in M3?** (navigation, input, disclosure, action, status, layout) — find this in M3 spec, not by visual appearance.
   2. **Does that role match what the user is doing at this moment?** If the user is tagging metadata, the component must be a metadata control (chip, badge, select). If the user is navigating between views, the component must be a navigation control (tabs, segmented control). If the user is taking a primary action, the component must be an action control (button, FAB).

   A component chosen because it *looks like* what you need — but whose semantic role is different — is a misuse. Visual similarity is not role equivalence. Misused controls create cognitive dissonance that no amount of colour, copy, or spacing polish can fix.

   **Persistent mobile controls:** if a bottom-anchored control's natural content height forces it to exceed approximately 25% of viewport height in its default/resting state, the layout model is wrong. Do not fix it with padding reduction or font scaling — redesign the interaction model (e.g., collapsed pill → expanded sheet).

9. **Layout-First Rethink (applies to every component and every frame, gate or sandbox):** before proposing or fixing any colour, spacing, or copy, answer these from a human perspective:
   - What is the user actually doing? Name the primary action and how each component physically supports it.
   - How do the components relate — sequence (do A then B then C) or composition (do A with B simultaneously)?
   - Does the current layout match that relationship? A vertical stack of independent components is a form. A messaging composer is a horizontal composition. A tab + content arrangement is a hierarchy. Choose the right structure before touching any surface property.
   - Is visual weight proportional to element importance? The primary action must be the most visually prominent; helper information must be subordinate.
   - Does each sizing, gap, and alignment feel intentional or accidental? Defaults are not design decisions.

   If the layout structure does not match the human mental model of the interaction, **rebuild the layout first**. Do not apply colour, copy, or spacing fixes to a structurally wrong layout. This rule applies whether the work is a gate frame pass or a sandbox control.

For each gap: classify as `Must Resolve` (blocks design-tool work) or `Accept With Risk` (can proceed; risk noted). Do not proceed to flow/frame work while any `Must Resolve` gap is unaddressed.

## Step 2 — Produce UX Flows, State Matrix, UI Control Contract, M3 Control Mapping

After Challenge Phase clears:

1. Break the slice into user journeys, screens, transitions, and system states.
2. Identify content, error, loading, empty, and permission states needed for safe design.
3. For interactive journeys, produce a `UI Control Contract` (control type, default/disabled/loading/error/success states, validation timing, keyboard/focus behavior).
4. Produce an `M3 Control Mapping` table (journey step, chosen control, M3 component + variant, required states, token/state references, rationale).

## Step 3 — Frame Blueprint and DS Coverage Declaration

Produce before ANY frame creation:

**Frame Blueprint:** for every required frame, specify:
- Exact frame name: `<Screen>/<State>/<Theme>/<Viewport>` convention
- Viewport dimensions
- Ordered component list — each component named exactly as it appears in the DS library (e.g., `Card/Filled`, `SegmentedControl`, `TextField/Outlined`)

**DS Component Coverage Declaration:** flat deduplicated list of every DS component required across all frames, with layer classification (L1 = M3 primitive, L2+L3 = TV functional).

### Cross-Screen Reuse Scan (Mandatory Before Classifying Any Element as Screen-Local)

**First: enumerate the full Figma file context (mandatory before any reuse judgment).**

1. Call MCP to list all pages in the Figma file.
2. For each page, list all top-level sections and their names.
3. Filter sections to those ending with `[APPROVED]` — these represent all previously shipped screens.
4. Record the page name, section name, and node ID for each `[APPROVED]` section.
5. This inventory is the complete screen universe against which reuse is evaluated. Without it, the reuse question cannot be answered correctly.

Log the result as:
```
[REUSE SCAN — FILE INVENTORY]
Pages found: <list>
APPROVED sections found: <list with page, section name, node ID>
```

Only after the inventory is recorded, review every **structural element** in the layout with this question:

> *Could this element plausibly appear on any other screen in the product, now or in the future?*

If yes, it must be declared as a **DS Library component** (L2+L3) — not a screen-local layer. Screen-local raw layers have zero reuse value and create migration debt.

**Reuse signals to check for each element:**

| Signal | Example |
|---|---|
| Displays a named domain entity | Podium, ArgumentCard, UserAvatar |
| Is a navigation control | BottomNav, TabBar, Breadcrumb |
| Is a status/feedback pattern | Toast, EmptyState, LoadingSpinner |
| Is a layout shell | PageShell, ModalOverlay, SidePanel |
| Encapsulates a domain action | VoteButton, ShareSheet, ReportMenu |

If **any signal applies**, stop and resolve it as a DS component gap (see Step 4 DS Component Gap Protocol) before proceeding.

Elements that are genuinely screen-local (e.g., a one-off decorative illustration, a screen-specific hero layout) must be explicitly flagged as such in the blueprint output with a one-line justification.

## Step 3B — Pre-Flight Gap Scan (Run Before Step 4 — Consolidates All Blockers Into One PO Question)

Before creating any frame, run this scan in full. The purpose is to surface all likely blocking conditions in a single pass and ask the Product Owner one consolidated question — rather than hitting gaps sequentially mid-execution.

**Required checks (all must be run before frame creation begins):**

1. **Component inventory check:** For every component in the Frame Blueprint, verify whether it exists in the TV Library (`design_system_library_file_key`) and is published. Record: component name, layer (L1/L2/L3), exists: YES/NO, published: YES/NO.

2. **Token namespace check:** Call `figma.variables.getLocalVariables()` in the DS library (fresh). This is the single `[TOKEN LIST FETCH]` for the gate run — log it now in the format below and reuse this list for all token-exists checks through to Step 4. For every token referenced in the Frame Blueprint, confirm it exists by semantic name. Record: token name, exists: YES/NO.
   ```
   [TOKEN LIST FETCH] DS library key: <key> | timestamp: <ISO timestamp> | variable count: <n>
   ```

3. **Library publish state check:** Verify no pending unpublished changes exist in the DS library from prior sessions. If any exist, surface them now.

4. **Baseline state check (continuation slices):** Inspect the target page and `docs/slices/<slice-name>/context-log.md` together and classify the state explicitly:
   - **No `[IN PROGRESS]` section present:** pass the baseline check and continue normally.
   - **`[IN PROGRESS]` section present + `gate-status: BLOCKED_AWAITING_PO` marker present in the context log:** treat this as a valid resume path from a previously blocked session. Resume from the blocked point only. Do **not** re-run completed pre-flight checks or recreate frames/components already completed in the prior attempt unless the PO explicitly authorizes rework.
   - **`[IN PROGRESS]` section present + no `gate-status: BLOCKED_AWAITING_PO` marker in the context log:** treat this as a baseline ambiguity/corruption gap. Do **not** proceed with frame execution. Raise it to the PO for confirmation on whether to resume, reset, or discard the prior partial state.

**If any check returns a gap:** consolidate all gaps into a single PO message listing every missing component, unpublished change, token gap, and baseline ambiguity (including any `[IN PROGRESS]` section without a matching `gate-status: BLOCKED_AWAITING_PO` marker) — with the specific authorization or action required for each. Do NOT begin frame execution until the PO message has been sent and all authorizations received.

**If all checks pass:** record the applicable pre-flight status and continue — either `[PRE-FLIGHT] All checks passed — proceeding to Step 4` for a clean start, or `[PRE-FLIGHT] Resume path confirmed via BLOCKED_AWAITING_PO marker — resuming from blocked point` for a continuation that must not re-run completed steps.

---

## Step 4 — Component Coverage Check (Self-Blocking)

Before creating any frame, verify every declared component:

- **L1 (M3 primitive):** verify importable via `m3_baseline_library_mcp_key` in `.figma-config.local`. Never recreate from raw shapes.
- **L2+L3 (TV functional):** verify published in TV Library (`design_system_library_file_key`). If missing, create directly in DS library using M3 primitives from L1, then **publish the library before proceeding** (see Publishing Gate below).

No frame creation until all declared components pass their layer check. Document the check result in output.

### Token-Exists Check (Mandatory Before Creating Any Variable)

**Fetch protocol:** Reuse the timestamped `[TOKEN LIST FETCH]` logged in Step 3B pre-flight for all token-exists checks in this gate run. Do NOT fetch again unless the DS library was published or known to have changed since Step 3B completed. On session resume (no Step 3B in scope), call `figma.variables.getLocalVariables()` fresh and log a new `[TOKEN LIST FETCH]` entry before proceeding.

Before creating any new Figma variable or token, search the timestamped list for existing variables that cover the same semantic role.

**A new variable must NOT be created if:**

- An existing token has the same semantic meaning (e.g., `color/brand/primary` already covers "primary brand surface color").
- The existing token's light/dark values match the reference frame values for this use case.

**Decision tree:**

1. List all variables in the DS library.
2. Search by name pattern and semantic role.
3. If a matching token exists: **use it directly** — do not create a parallel alias or duplicate.
4. If no match exists: document the gap (name, semantic role, light/dark values needed) and request PO authorization before creating.
5. Record the resolution (used existing / created new with authorization) in output.

Silently creating a new token when an equivalent already exists is a protocol violation. It blooms the token namespace and introduces divergence paths.

### Publishing Gate (Hard Block — Cannot Be Deferred or Noted)

Any time a new or modified component is added to the DS library, **publishing is a mandatory blocking step before any downstream work continues** — including sandbox frame presentation, gate frame creation, and PO review. It is not a footnote. It is not a reminder. It is a gate.

**After any DS library component is created or modified:**

1. **STOP immediately** — do not proceed to slice frame work. The publish gate runs first.
2. **Immediately surface the publish requirement to Product Owner** with:
   - Component(s) added or changed
   - Exact action required: open the DS library in Figma UI → **File → Publish library** (or use the Assets panel → Publish changes button)
   - Clear statement that all downstream work is **blocked** until publish is confirmed
3. **Do not build local stand-ins** in the slice file as a workaround. Building local duplicates instead of waiting for publish is a protocol violation — it creates disconnected design tech debt.
4. **Do not present sandbox results as "ready"** until PO confirms the publish has been done.
5. **After PO confirms publish:** verify the component is importable cross-file via `importComponentByKeyAsync` before proceeding. If import fails, the publish did not complete — loop back.
6. **Once confirmed importable:** use `importComponentByKeyAsync` to create instances in the slice file. Only then proceed with slice frame work.

Skipping the publish step and leaving a note at the end is a protocol violation. Building local duplicates as a workaround is also a protocol violation. The work is incomplete until the library is published, import is verified, and real instances are placed.

### DS Component Gap Protocol (Mandatory — No Silent Compromise)

If a required component does not exist in the DS library and no existing component is a correct semantic match:

1. **Stop.** Do not substitute with a visually similar but semantically incorrect component.
2. **Raise a DS Component Gap** with:
   - Component name needed (M3 canonical name, e.g. `FilterChip`, `InputChip`, `FAB/Small`)
   - Semantic role it must fulfil (e.g. "toggleable metadata tag for side selection")
   - Interaction states required (default, selected, disabled, focused)
   - Why every existing DS component fails the semantic match test
3. **Request PO authorization** to either: (a) build the component in the DS library now, or (b) explicitly accept a named compromise and document it.

Do NOT proceed with a compromise unless PO explicitly names the substitute component and approves the tradeoff in writing. Visual similarity is not semantic equivalence — a compromise accepted silently becomes a design debt that compounds.

### DS Component Showcase Protocol (Mandatory After Creating or Modifying Any DS Component)

After every new or modified component is added to the TV DS library, a corresponding showcase entry **must** be created inside the `Component Showcase` frame (`52:24`, located at x=1000 on the TV Components page). Standalone showcase frames placed elsewhere on the canvas are a protocol violation.

**Required structure — must match existing sections exactly:**

```
<Component Name> Section  (FRAME, fills=[], x=40 relative to Component Showcase)
  ├── <Component Name>  (TEXT, Inter Semi Bold 18px, x=0, y=0)
  └── <Component Name> Variants  (FRAME, fills=[], x=0, y=38)
       ├── Light  (FRAME, cornerRadius=8, bg=#FAFBFF, explicit Light mode, x=0)
       │    ├── "LIGHT THEME"  (TEXT, Inter Medium 12px, x=16, y=16)
       │    └── <component instances at x=16, y=43>
       └── Dark   (FRAME, cornerRadius=8, bg=#1C1B1F, explicit Dark mode, x=<Light.w+40>)
            ├── "DARK THEME"  (TEXT, Inter Medium 12px, x=16, y=16, white fill)
            └── <component instances at x=16, y=43>
```

**Rules:**

1. **Right column only.** All new sections go inside `Component Showcase` (`52:24`) at `x=40`. Never place showcase frames at `x=0` or outside the `Component Showcase` frame.
2. **Bottom-append.** Calculate `lastBottom = max(child.y + child.height)` over all existing children of `Component Showcase`. New section starts at `y = lastBottom + 40`.
3. **Component instances, not raw frames.** Use `component.createInstance()` for all component references in showcase sub-frames. Never draw raw shapes as visual stand-ins.
4. **Variable modes — dual-collection rule.** Frames that contain DS library component instances use **two** variable collections: (1) the local file collection and (2) the DS library's published collection. Both must receive an explicit mode override or DS library components will default to their own Light mode regardless of the local override.
   - Discover all active collection IDs: inspect bound variable IDs on fills/strokes/text of DS component nodes → `getVariableByIdAsync(id).variableCollectionId` → `getVariableCollectionByIdAsync(collId).modes`.
   - Call `f.setExplicitVariableModeForCollection(collectionId, modeId)` once per collection per frame. Pass the collection **ID string** and the mode **ID string** (e.g., `"4:0"`), not the collection or mode objects.
   - Verify: inspect `frame.explicitVariableModes` — both collection IDs must be present as keys before the frame is considered correctly themed.
5. **Extend frame height.** After appending all new sections, call `showcaseFrame.resizeWithoutConstraints(1200, newH)` where `newH = lastChild.y + lastChild.height + 60`.
6. **Label style.** Title: Inter Semi Bold 18px, dark fill. Theme label: Inter Medium 12px; dark fill on Light sub-frame, white fill on Dark sub-frame.
7. **Section naming.** Section frame name: `<Component Name> Section`. Inner themes frame name: `<Component Name> States` or `<Component Name> Variants`. Sub-frames: `Light` / `Dark`.

**Icon quality rule (applies to every component with icon content):**

Icons inside DS components must be M3 Material Symbols vector shapes — not text characters (`✏`, `✎`, emoji, or Unicode symbols). When creating or editing any component that contains an icon:

1. Use `figma.createNodeFromSvg(svgString)` with the official M3 SVG path (from [fonts.google.com/icons](https://fonts.google.com/icons)).
2. Resize the resulting node to 24×24 and center it in the component container (e.g., `x = (containerW - 24) / 2`, same for y).
3. Bind all vector `fills` to the correct `on-*` token using `figma.variables.setBoundVariableForPaint`.
4. Never use text nodes with symbol characters as icon substitutes.

## Step 5 — Baseline-Lock (Continuation Slices — Mandatory)

For any slice that adds to or modifies an existing approved screen:

### 5A — Section Resolution + Spec Pre-Read (Mandatory Before Cloning)

**First action — resolve baseline section via MCP:**

1. Call MCP to list all Figma Sections on the current screen page.
2. Filter to sections whose names end with `[APPROVED]`.
3. Sort by numeric prefix (e.g., `01-`, `02-`). The **highest-numbered `[APPROVED]` section is the baseline**.
4. Record the baseline section name and node ID.
5. If no `[APPROVED]` section exists, this is the first slice — proceed to Step 6 directly (no baseline to lock).

**Then pre-read the spec:**

Read `docs/slices/<slice-name>/04-design-qa.md` and extract a **Spec Property Checklist**: every explicitly stated visual property (fills, corner radii per-corner, variant values, token bindings, dimensions). This checklist is the authoritative reference. The spec wins whenever it diverges from the baseline — the baseline is a starting point, not a source of truth.

If `04-design-qa.md` does not exist yet (pre-Gate 3), use `03-ux.md` as the reference.

### 5B — Create Section, Clone, and Place

1. Create a new Figma Section named `<n>-<slice-name> [IN PROGRESS]` (where `<n>` is next sequential zero-padded number) on the screen page.
2. Use Figma MCP `duplicate_node` on each approved baseline frame from the resolved baseline section (same page only). Record source node ID and resulting clone node ID as baseline provenance.
3. Rename each clone with `_baseline/` prefix (e.g., `_baseline/DebateScreen/Default/Light/Mobile`).
4. Place all `_baseline/` frames inside the new `[IN PROGRESS]` section, per canvas layout rules (Step 6).

> **Same-page clone only.** Never `duplicate_node` across pages or across files. Cross-page or cross-file duplication introduces variable mode drift because variable collection mode overrides are file/page-scoped. Cloning on the same page from the same section preserves all overrides intact.

### 5C — IMMEDIATELY Verify (Before Any Other Operation)

Using the Spec Property Checklist from 5A, verify the clone via MCP read-back:

- **Header background fill**: read `fills` array on the Header/Topic node. Empty fills `[]` is a defect even if the baseline had it.
- **Text fill on every filled container**: for every text node that sits inside a container with a non-transparent fill, read `fills[0].boundVariables.color.id` on the text node and compare it against the approved baseline's token for that same node. A wrong token (e.g., on-surface on a brand-colored surface) is invisible at thumbnail scale but renders incorrectly at full size. Token ID mismatch is a defect regardless of whether the rendered color looks plausible.
- **Legend bar fill**: confirm variable binding matches spec.
- **Legend dots**: confirm fill variable bindings (not strokes) on each dot.
- **Card corner radii — per-corner required**: read `topLeftRadius`, `topRightRadius`, `bottomLeftRadius`, `bottomRightRadius` individually for each card via MCP. `cornerRadius` as a single value is insufficient — instances can silently differ. Tark cards must have `topLeftRadius=4`; Vitark cards must have `topRightRadius=4`; all other corners must be `12`.
- **Bubble Tail geometry and fill**: confirm vector path integrity and color variable binding.
- **Card `side` variant property**: confirm intact on each card instance.

For each checked property, report the extracted MCP value. Any deviation from the Spec Property Checklist is a **defect to fix in the clone before proceeding** — do NOT accept baseline-inherited values that contradict the spec.

**Every fix applied during this step is subject to the Validate-After-Every-Write Protocol.** Do not move to Step 5D until every property in the checklist returns a confirmed-matching read-back. If a fix does not take after two attempts, raise a loop-back condition rather than continuing with an unverified state.

### 5D — No Rebuild Rule

Only net-new slice additions are authored fresh. All elements present in the baseline must come from the physical duplicate only.

**NEVER do these after `duplicate_node`:**

| Anti-pattern | Why it breaks fidelity |
|---|---|
| `setExplicitVariableModeForCollection` on the cloned frame | Re-resolves variable aliases differently; causes color drift in topic bar and other token-bound fills |
| `resize()` on the outer cloned frame | Resets `primaryAxisSizingMode` to `FIXED` on all auto-layout children, reflowing card positions and displacing bubble tails |
| Setting component properties en-masse after clone | Can reset variant values (e.g., Card `side`) if applied to parent before children are re-bound |
| Trusting baseline visual state as spec-correct without reading `04-design-qa.md` | Propagates pre-existing baseline defects into the new slice frame |
| Skipping the Step 5C checklist on existing active work frames when beginning a new Phase | Any frame authored before read-back verification was required may carry silent token mismatches. Before adding new content in any Phase, run a full Step 5C token read-back pass against every existing active work frame in the `[IN PROGRESS]` section — not just the `_baseline/` clones. Visual correctness at thumbnail scale is not evidence of correct token bindings. |

If any property in the clone diverges from the Spec Property Checklist and cannot be immediately corrected by a targeted MCP write, report as a loop-back condition — do NOT proceed.

## Step 6 — Canvas Layout

Frames and sections are organized on the screen page as follows:

**Section placement:**

- Read current section positions via MCP before computing any new coordinates (do NOT hardcode).
- New `[IN PROGRESS]` section is placed to the **right of the last existing section** on the page, with a **200px horizontal gap**.
- If no sections exist yet (first slice), place at x=0, y=0.

**Frame layout within a section:**

- Row layout (left to right, 100px horizontal gap): Light/Mobile → Dark/Mobile → Light/Desktop → Dark/Desktop
- Row vertical gap: 300px minimum from bottom of tallest frame in previous row to top of next row.
- `_baseline/` frames occupy the **top row** within their section. Active slice frames go in subsequent rows below.
- The old Baseline Zone rule (`x≥1200`) is **removed** — replaced by the section model above.

**Coordinate computation:**

- Always compute absolute frame coordinates from MCP-read section x/y origin plus in-section relative offsets.
- Never use page-level hardcoded coordinates from previous sessions.

## Step 7 — Single-Screen-First Protocol (Protocol 3.18)

### Mobile-First Principle (Non-Negotiable)

Mobile is always the primary design surface. Every component, layout pattern, interaction model, and spacing decision must be designed for and validated on Mobile viewport first. The Mobile frame is the source of truth. Desktop and Tablet frames are adaptations of an approved Mobile design — they are never designed in parallel or ahead of Mobile approval.

This applies to sandbox work, gate frame passes, and all Figma execution. If a component or layout cannot work on Mobile, it is wrong regardless of how well it works on Desktop.

Gate 3A runs in two phases:

**Phase 1:** Create ONLY the primary frame (`Default/Light/Mobile`). Return to Product Owner for explicit visual approval. Include:
- Screenshot + **node-targeted Figma URL** (required; format: `https://www.figma.com/design/<fileKey>/...?node-id=<nodeId>` with `:` → `-`)
- Clone node ID and node-targeted Figma URL
- Baseline provenance (source → clone)
- Fidelity checklist (Header/Topic fill match, legend bar fill match, card side values, **per-corner radii verified via MCP read-back**, Bubble Tail fill/geometry, no mode override, no resize, Composer present, DS imports used)

**STOP after Phase 1. Do not create any other frames until Product Owner explicitly approves Phase 1.**

**Phase 2 (authorized by PO approval):** Create all remaining frames in one pass following the Frame Blueprint.

## Step 8 — Frame Execution Rules

- Frame names follow `<Screen>/<State>/<Theme>/<Viewport>` convention exactly.
- Import ALL components from TV Library. No local component definitions.
- All values reference DS library variables. No raw hex colors or hardcoded spacing.
- Every screen/state requires both Light and Dark variants.
- After all frames are placed, perform overlap check: retrieve x/y/w/h of every top-level frame on the Design page; verify no two frames overlap (minimum 100px gap). Reposition any overlapping frames. Document result.
- **Every screenshot returned to Product Owner must be accompanied by the node-targeted Figma URL.** See Mandatory Link Rule above.

## Step 9 — Zero Autonomous Gap Decisions

Any unexpected finding during frame execution (missing component, variable binding failure, tool error, layout deviation, visual mismatch vs baseline, or read-back verify failure) is a loop-back condition. Report:
- Expected behavior
- Observed behavior
- Which MCP tool call surfaced it
- Read-back value vs intended value (for write failures)

Do NOT patch inline. Await instruction.

### Blocked-State Persistence (Mandatory on Session Close While Awaiting PO)

If a loop-back condition requires PO input and the session ends before a response is received:

1. Write the following marker to the slice context log (`docs/slices/<slice-name>/context-log.md`) before the session closes:

   ```
   gate-status: BLOCKED_AWAITING_PO
   gate: 3A
   blocked-at: <Step N — description>
   blocker: <exact loop-back condition description>
   frames-in-progress: <list of frame names and node IDs created so far>
   timestamp: <ISO timestamp>
   ```

2. On **any resume of Gate 3A**, before executing any frame step, check the context log for this marker. If found:
   - Read the blocker description.
   - Surface the unresolved blocker to PO and wait for authorization before continuing.
   - Do NOT re-execute any step that was already completed before the block. Use the `frames-in-progress` list to identify what exists.
   - Only remove the `gate-status: BLOCKED_AWAITING_PO` marker after PO has explicitly authorized continuation.

Skipping this check on resume and re-executing Phase 1 will create duplicate `[IN PROGRESS]` sections. This is a protocol violation.

## Step 10 — End-of-Pass Full Verification Sweep

Before declaring any frame pass complete (Phase 1 or Phase 2), run a final systematic read-back sweep across every node modified in this pass:

1. For each modified node, read back every property that was written and confirm it matches the intent.
2. Take a screenshot of each frame and compare visually against the UX approved reference (UX Flows page frames or PRD spec, whichever was declared the correct reference for this slice).
3. Cross-check: the screenshot must be consistent with the read-back values. If the screenshot shows a color that does not match the read-back hex, the reference page or variable mode is wrong — investigate and fix.
4. Record the result as `End-of-Pass Verification: ✅ clean` or list each remaining mismatch.
5. Do NOT return output to Product Owner until the end-of-pass sweep is clean.

## Step 11 — Design Quality Gate (Mandatory Pre-PO Presentation Block)

> Sources: [M3 Typography](https://m3.material.io/styles/typography/applying-type), [M3 Layout Spacing](https://m3.material.io/foundations/layout/understanding-layout/spacing), [Apple HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [NN/g Heuristic #8: Aesthetic and Minimalist Design](https://www.nngroup.com/articles/aesthetic-minimalist-design/).

This step runs **after** Step 10 (End-of-Pass Full Verification Sweep) and **before** any screenshot or output is returned to Product Owner. Every criterion must pass. Any failure restarts the iteration — no partial presentation.

### QG-1: Typography Role Correctness (M3 Spec)

M3 defines 5 roles. Each content element must map to exactly one role. Using the wrong role is a defect regardless of whether the font size looks approximately correct.

| Role | Correct use | Failure pattern |
|---|---|---|
| `display` | Short hero text or numerals on large screens only | Applying to any mobile body content |
| `headline` | Short, high-emphasis text — primary screen titles on mobile | Using for every section header regardless of emphasis level |
| `title` | Medium-emphasis secondary passages, section dividers | Using for primary content, collapsing hierarchy |
| `body` | Longer readable passages — never inside components | Using for button labels or metadata inside components |
| `label` | Text inside components (buttons = `label/large`), captions, timestamps | Using for passages that require readability at rest |

**Line height rule (M3):** Display/Headline/Title → line height ≥ 1.2× type size. Body/Label → line height ≈ 1.5× type size.

**Test:** For every text node, state its M3 role and confirm it matches the table. If two adjacent text elements with different importance levels both use the same M3 role (e.g., screen title and section subhead both `title/medium`), one is wrong — fix it before proceeding.

### QG-2: Spacing Rhythm (4dp Grid — M3 + Apple HIG)

All padding and gap values must be multiples of 4dp. Non-multiples (e.g. 6px, 10px, 14px) are rhythm violations.

**Grouping rules (M3):**
- Tightly related elements (icon + label, value + unit): gap ≤ 8dp.
- Distinct elements within the same section: gap 12–16dp.
- Distinct sections (different content areas): gap ≥ 24dp or a divider token.

**Crowding rule (Apple HIG):** The most important element on the screen must have more whitespace around it than secondary elements. If essential information is crowded by non-essential details, the hierarchy is wrong.

**Density rule:** Any two interactive elements with fewer than 8dp between touch targets are too close. Grouping by proximity only works when distinct groups have visibly more space between them than within them.

**Test:** For each container, read padding via MCP and confirm every value is a multiple of 4. For each pair of grouped elements, confirm their internal gap is smaller than the gap separating them from unrelated elements. If spacing between groups equals spacing within groups, hierarchy is broken — fix before proceeding.

### QG-3: Visual Weight Hierarchy and Mandatory Greyscale Check

The primary action must be the most visually dominant element. Visual dominance must survive colour removal — if hierarchy collapses in greyscale, it was carried by colour alone, which fails for colour-blind users and is a design defect.

**Greyscale check (mandatory):**
1. Take a screenshot of the completed frame via Figma MCP.
2. Mentally strip all colour (imagine the screenshot printed in black and white).
3. Identify which element draws the eye first.
4. If the answer is not the primary action element, the hierarchy is wrong. Fix size, weight, or whitespace — not colour — to correct it.
5. Log the result: `[GREYSCALE CHECK] Primary action draws eye first in greyscale: YES / NO`

A NO result is a blocker. Do not present to Product Owner until the greyscale check passes.

**Additional visual weight rules:**
- The primary action element must be larger or heavier (font weight or container size) than all secondary elements at the same screen level.
- Decorative elements (dividers, background fills, inactive labels) must have lower visual contrast than interactive elements. Any decorative element that competes visually with the primary action is a defect.
- If two elements at the same hierarchy level have the same visual weight, one is over-styled or under-styled — they must be differentiated by size, weight, or whitespace.

### QG-4: Colour Minimalism (NN/g Heuristic #8 + M3)

Every colour on screen must justify its presence by communicating a specific semantic role.

**Rules:**
1. No decorative colour. Every colour must map to a semantic role: brand surface, interactive, success, warning, error, neutral.
2. Small text (< 18pt): minimum contrast ratio 4.5:1 against background (M3/WCAG AA).
3. Large text (≥ 18pt): minimum contrast ratio 3:1.
4. Secondary/muted text must use the `on-surface-variant` token — not a raw opacity applied to `on-surface`. Opacity-based muting breaks dark mode token resolution.
5. Never use flat grey text on a coloured background. Use a colour-matched muted variant token for that surface. Pure grey over brand colour is always a token misuse.
6. Count distinct colour families visible in the frame. More than 4 (brand, neutral, feedback, overlay) without explicit design system justification is over-saturation.

**Test:** List every unique fill colour visible in the frame. For each, answer: *what semantic role does this communicate?* If the answer is "none" or "decoration", remove it or replace with the correct surface token.

### QG-5: Content Minimalism (NN/g Heuristic #8)

Every element in the frame must support the user's primary goal. Elements that do not support the primary goal compete with those that do and must be removed.

**Rules:**
1. No placeholder decoration — empty dividers between non-existent groups, icons used for visual balance, decorative lines.
2. Every icon must either have a visible text label or be universally standard (close ×, back ←, hamburger ☰). Unlabelled novel icons are a failure.
3. No redundant information. If position already communicates something, a label repeating it is noise. If colour communicates state, shape or text must also communicate it (accessibility + token compliance).
4. One-question test: *What is the single most important thing the user does on this screen?* If the answer requires more than one sentence, the screen is doing too much.

### QG-6: Social App Benchmark Checklist (Pre-PO Gate)

tark-vitark is a social/debate app. The quality standard is: **would this frame look at home alongside Threads, Reddit, or Discord screenshots in the App Store — for a first-time user who does not know the product?**

Before presenting any frame to Product Owner, answer every question. Any NO is a blocker — fix before presenting.

| # | Question | Required answer |
|---|---|---|
| 1 | Does the primary action draw the eye first in the greyscale check? | YES |
| 2 | Are all spacing values multiples of 4dp (confirmed via MCP read-back)? | YES |
| 3 | Do closely related elements have smaller internal gaps than the gaps between distinct sections? | YES |
| 4 | Does every text element use the correct M3 role (display / headline / title / body / label) — not just an approximate size? | YES |
| 5 | Does the layout hierarchy survive greyscale — primary action still dominant without colour? | YES |
| 6 | Is every colour present for a semantic reason, not decoration? | YES |
| 7 | Is contrast ≥ 4.5:1 for small text, ≥ 3:1 for large text? | YES |
| 8 | Does every icon have a label or universal recognition? | YES |
| 9 | Would this frame look at home alongside Threads, Reddit, or Discord in the App Store? | YES |
| 10 | Is the visual rhythm (font scale, spacing, colour saturation, border radius) consistent with other `[APPROVED]` frames in this file? | YES |

Q10 requires both a visual check AND objective MCP read-back consistency checks:

**Visual check:** take a screenshot of the nearest `[APPROVED]` section baseline frame and compare side by side. Font scales, spacing rhythm, colour saturation, and border radius patterns must feel like the same product.

**MCP consistency checks (mandatory — must accompany the visual check):** select the nearest `[APPROVED]` baseline frame and read the following properties via MCP, then read the same properties from the new frame and compare value-for-value:

| Property | How to read | Pass condition |
|---|---|---|
| Primary text token | `fills[0].boundVariables.color.id` on the primary text node | Same variable ID |
| Card corner radii | `topLeftRadius`, `topRightRadius`, `bottomLeftRadius`, `bottomRightRadius` on a Card instance | All 4 values identical |
| Container padding | `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight` on the outermost content frame | All values identical |
| Section gap | `itemSpacing` on the primary vertical auto-layout frame | Same value |
| Surface fill token | `fills[0].boundVariables.color.id` on the screen background frame | Same variable ID |

Log the result as:
```
[Q10 CONSISTENCY CHECK]
Baseline frame: <node ID>
New frame: <node ID>
Primary text token: baseline=<id> / new=<id> | match: YES/NO
Card radii (TL/TR/BL/BR): baseline=<values> / new=<values> | match: YES/NO
Container padding: baseline=<values> / new=<values> | match: YES/NO
Section gap: baseline=<value> / new=<value> | match: YES/NO
Surface fill token: baseline=<id> / new=<id> | match: YES/NO
Visual check: same product family: YES/NO
Q10 result: PASS / FAIL
```

Any NO in the MCP checks is a blocker — fix the mismatched property before presenting, even if the visual check passed. The visual check alone is not sufficient.

**Log format for this step:**

```
[DESIGN QUALITY GATE]
QG-1 Typography roles: ✅ / ❌ <issues>
QG-2 Spacing rhythm: ✅ / ❌ <values that failed>
QG-3 Greyscale check: ✅ / ❌ <which element drew eye, was it primary action?>
QG-4 Colour minimalism: ✅ / ❌ <colours without semantic role>
QG-5 Content minimalism: ✅ / ❌ <redundant or decorative elements>
QG-6 Benchmark checklist: ✅ all YES / ❌ Q<n> failed — <reason>
Overall: PASS — proceed to output | FAIL — fix required before presenting
```

## Output: Required Sections (in this order)

1. `UX Readiness`: Ready | Needs Clarification | Blocked
2. `UX Flows`: primary journeys and flow summaries
3. `State Matrix`: screen/state coverage and transitions
4. `UI Control Contract`: explicit control decisions for input/submit journeys
5. `M3 Control Mapping`: M3 component and state mapping for input/submit journeys
6. `Frame Blueprint`: per-frame name, dimensions, ordered component list (DS library-canonical names)
7. `DS Component Coverage Declaration`: flat deduplicated list of all DS components
8. `Component Coverage Check`: result of pre-frame component verification
9. `Baseline Provenance` (continuation slices only): source node ID(s) and clone node ID(s)
10. `Design Execution`: Figma frames created (frame name, node ID, dimensions, theme variant)
11. `Overlap Check`: bounding-box verification result across all top-level frames
12. `Design Coverage Map`: every frame/state mapped to UX flow + PRD criterion
13. `Interaction Notes`: content, validation, accessibility, dependency notes
14. `Quality Gaps`: unexpected findings during frame execution (expected / observed / tool call / action required). State "none" explicitly if none.
15. `Design Quality Gate`: QG-1 through QG-6 log with `Overall: PASS` or `FAIL` result.
16. `Open Questions`: unresolved items with owner decision status
17. `Gate Decision`: can proceed to design-qa | must loop back
18. `Design Artifact`: mandatory Figma file URL (not raw key)
19. `Design Review Access`: node-targeted Figma URL(s) (`?node-id=` with actual node IDs), page list, frame/state index with node IDs, pass-level change summary, review focus

## UX Quality Checks — When "UX Readiness: Ready" May Be Claimed

All of the following must be true:

1. Primary user flows are explicit and consistent with PRD scope.
2. Critical states and edge cases are covered.
3. Interaction notes are concrete enough for Design QA review.
4. No contradiction between UX flows and PRD requirements.
5. Open questions are resolved or explicitly accepted by Product Owner.
6. `Design Artifact` reference (Figma file URL) is present and valid.
7. For interactive journeys: control-level decisions explicit (control type, state behavior, validation timing, error presentation, keyboard/focus behavior).
8. For DS-governed interactive journeys: M3 component mapping explicit (variant, required states, token/state references).
9. `Frame Blueprint` present for every required frame (name, dimensions, ordered component list).
10. `DS Component Coverage Declaration` present as flat deduplicated list.
11. Component Coverage Check completed and documented before any frame was created.
12. Phase 1 approved by PO. Phase 2 complete: all frames created via MCP following Frame Blueprint. Both Light and Dark variants exist for every required frame.
13. Baseline provenance recorded for every continuation slice.
14. Overlap check completed and documented: no frames overlap, minimum 100px gap confirmed.
15. Design Quality Gate (Step 11) passed: all QG-1 through QG-6 criteria confirmed, log present with `Overall: PASS`.
16. `Design Review Access` present with node-targeted URLs containing actual node IDs from this pass.

## UX Flow/State Package Schema

The consolidated artifact handed to Design QA:

1. Canonical requirement summary
2. Scope boundaries from PRD
3. Primary users, goals, and flow inventory
4. Screen/state matrix with transitions
5. UI Control Contract
6. M3 Control Mapping
7. Frame Blueprint (per-frame name, dimensions, ordered component list)
8. DS Component Coverage Declaration
9. Component Coverage Check result
10. Baseline provenance (continuation slices only)
11. Design Execution summary (frame name, node ID, dimensions, theme per row)
12. Overlap check result
13. Design Quality Gate (QG-1..QG-6 mandatory pre-PO checklist result — pass/fail per criterion; every criterion must pass before PO review)
14. Design Coverage Map (frame/state → UX flow → PRD criterion)
15. Interaction rules, validation, and content notes
16. Dependencies, risks, and mitigations
17. Open questions with owner status
18. Design artifact reference (Figma file URL)
19. Design review access packet (node-targeted URLs, page list, frame/state index, pass-level change summary, review focus)
20. Traceability snapshot to PRD requirements
