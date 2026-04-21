# Agentic Workflow — tark-vitark

```mermaid
flowchart TD
    PO(["👤 Product Owner"])

    PO -->|requirement| G1["Gate 1\nRequirement Challenge\n🤖 Requirement Challenger"]
    G1 -->|approved| D1{Trivial?}
    D1 -->|yes| G5
    D1 -->|no| G2["Gate 2\nPRD\n🤖 PRD Agent"]
    G2 -->|approved| G3["Gate 3\nDesign\n🤖 Orchestrator + Design QA"]
    G3 -->|approved| G4["Gate 4\nArchitecture\n🤖 Architecture Agent"]
    G4 -->|issues created| G5["Gate 5\nBuild\n🤖 Dev Agent"]
    G5 -->|PR opened| CR["Code Review\n🤖 Code Reviewer"]
    CR -->|review clean| D55{UI change?}
    D55 -->|no| G6
    D55 -->|yes| G55["Gate 5.5\nRuntime QA\n🤖 Runtime QA Agent"]
    G55 -->|pass| G6["Gate 6\nMerge Readiness\n🤖 Orchestrator"]
    G6 -->|recommend| MERGE(["Merge\nPO: default branch\nOrchestrator: slice/*"])
    MERGE --> DONE(["✅ Shipped"])

    G1 -->|needs work| G1
    G2 -->|needs work| G2
    G3 -->|needs work| G3
    G4 -->|needs work| G4
    CR -->|needs fixes| G5
    G55 -->|fail| G5
    G6 -->|gaps| G5

    classDef gate fill:#1e3a5f,stroke:#4a90d9,color:#e8f4fd
    classDef po fill:#3d1a3d,stroke:#c97dd4,color:#fae8fd
    classDef done fill:#1a3d2b,stroke:#4caf7d,color:#e8f5ec
    classDef decision fill:#3d3519,stroke:#d4c24e,color:#fdf8e8

    class G1,G2,G3,G4,G5,CR,G55,G6 gate
    class PO,MERGE po
    class DONE done
    class D1,D55 decision
```

## Gates at a Glance

| Gate | Who | Output |
|---|---|---|
| 1 — Requirement Challenge | Requirement Challenger | Requirement Context Package |
| 2 — PRD | PRD Agent | PRD Draft Package |
| 3 — Design *(local-only)* | Orchestrator + Design QA Agent | Figma frames + QA verdict |
| 4 — Architecture | Architecture Agent | Architecture plan + task issues |
| 5 — Build | Dev Agent | Code + tests + PR |
| Code Review | Code Reviewer | Latest Copilot review body says `generated 0 comments` (or equivalent) |
| 5.5 — Runtime QA | Runtime QA Agent | Browser journey verdict |
| 6 — Merge Readiness | Orchestrator | Merge recommendation |

> **Trivial slices** (copy, config, favicon) skip Gates 2, 3, and 4.
> **Default-branch merges** are performed by the Product Owner directly. For PRs targeting `slice/*` integration branches, the Orchestrator may merge under the documented exception.
