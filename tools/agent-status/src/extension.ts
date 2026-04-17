import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

type TaskStatus = "done" | "failed" | "needs-clarification";
type RunStatus = "running" | "done" | "failed" | "pending-clarification";

interface TaskResult {
    taskId: string;
    role: string;
    status: TaskStatus;
    error?: string;
}

interface Run {
    runId: string;
    startedAt: string;
    finishedAt?: string;
    status: RunStatus;
    taskIds: string[];
    results: TaskResult[];
    pendingClarification: string[];
}

type RunsSnapshot = Record<string, Run>;

const RUNS_FILE_REL = path.join("logs", "parallel-agents", "runs.json");

function readRuns(runsFile: string): RunsSnapshot {
    try {
        return JSON.parse(fs.readFileSync(runsFile, "utf-8")) as RunsSnapshot;
    } catch {
        return {};
    }
}

/** Returns runs newest-first (JSON object preserves insertion order = chronological). */
function sorted(runs: RunsSnapshot): Run[] {
    return Object.values(runs).reverse();
}

function statusIcon(status: RunStatus): string {
    switch (status) {
        case "running": return "$(sync~spin)";
        case "done": return "$(check)";
        case "failed": return "$(error)";
        case "pending-clarification": return "$(question)";
    }
}

function statusThemeIcon(status: RunStatus): vscode.ThemeIcon {
    switch (status) {
        case "running": return new vscode.ThemeIcon("sync~spin", new vscode.ThemeColor("charts.yellow"));
        case "done": return new vscode.ThemeIcon("check", new vscode.ThemeColor("charts.green"));
        case "failed": return new vscode.ThemeIcon("error", new vscode.ThemeColor("charts.red"));
        case "pending-clarification": return new vscode.ThemeIcon("question", new vscode.ThemeColor("charts.orange"));
    }
}

// ---------------------------------------------------------------------------
// Tree items
// ---------------------------------------------------------------------------

class RunTreeItem extends vscode.TreeItem {
    constructor(readonly run: Run) {
        const taskCount = run.taskIds.length;
        const taskSummary = taskCount === 1
            ? run.taskIds[0]
            : `${taskCount} tasks`;
        const state = run.results.length > 0
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None;
        super(run.runId, state);
        this.description = `${taskSummary}  ·  ${run.status}  ·  ${run.finishedAt ?? run.startedAt}`;
        this.iconPath = statusThemeIcon(run.status);
        this.tooltip = [
            `Run: ${run.runId}`,
            `Tasks: ${run.taskIds.join(", ") || "(none)"}`,
            `Status: ${run.status}`,
            `Started: ${run.startedAt}`,
            run.finishedAt ? `Finished: ${run.finishedAt}` : "(still running)",
            run.pendingClarification.length > 0 ? `Clarification: ${run.pendingClarification.join(", ")}` : "",
        ].filter(Boolean).join("\n");
        this.command = {
            command: "agentStatus.openRun",
            title: "Open Run JSON",
            arguments: [run],
        };
        this.contextValue = "run";
    }
}

class TaskResultItem extends vscode.TreeItem {
    constructor(result: TaskResult) {
        super(result.taskId, vscode.TreeItemCollapsibleState.None);
        this.description = result.status;
        this.iconPath = result.status === "done"
            ? new vscode.ThemeIcon("check", new vscode.ThemeColor("charts.green"))
            : result.status === "failed"
            ? new vscode.ThemeIcon("error", new vscode.ThemeColor("charts.red"))
            : new vscode.ThemeIcon("question");
        if (result.error) this.tooltip = result.error;
        this.contextValue = "taskResult";
    }
}

type AnyItem = RunTreeItem | TaskResultItem;

// ---------------------------------------------------------------------------
// Tree data provider
// ---------------------------------------------------------------------------

class RunsTreeProvider implements vscode.TreeDataProvider<AnyItem> {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private snapshot: RunsSnapshot = {};

    refresh(snapshot: RunsSnapshot): void {
        this.snapshot = snapshot;
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: AnyItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: AnyItem): AnyItem[] {
        if (!element) {
            return sorted(this.snapshot).slice(0, 100).map((r) => new RunTreeItem(r));
        }
        if (element instanceof RunTreeItem) {
            return element.run.results.map((r) => new TaskResultItem(r));
        }
        return [];
    }
}

// ---------------------------------------------------------------------------
// Status bar summary
// ---------------------------------------------------------------------------

function summarise(runs: RunsSnapshot): { label: string; tooltip: string; color?: vscode.ThemeColor } {
    const all = Object.values(runs);
    if (all.length === 0) {
        return { label: "$(circle-slash) No agent runs", tooltip: "No agent runs recorded yet." };
    }

    const running = all.filter((r) => r.status === "running").length;
    const clarification = all.filter((r) => r.status === "pending-clarification").length;
    const failed = all.filter((r) => r.status === "failed").length;
    const done = all.filter((r) => r.status === "done").length;

    const parts: string[] = [];
    if (running > 0) parts.push(`$(sync~spin) ${running} running`);
    if (clarification > 0) parts.push(`$(question) ${clarification} waiting`);
    if (failed > 0) parts.push(`$(error) ${failed} failed`);
    if (running === 0 && clarification === 0 && failed === 0) parts.push(`$(check) ${done} done`);

    const label = "Agents: " + parts.join("  ");

    const tooltipLines = sorted(runs).slice(0, 5).map((r) => {
        const icon = r.status === "running" ? "⟳" : r.status === "done" ? "✓" : r.status === "failed" ? "✗" : "?";
        const tasks = r.taskIds.join(", ");
        const time = r.finishedAt ?? r.startedAt;
        return `${icon} ${tasks} — ${r.status} (${time})`;
    });

    const tooltip = tooltipLines.join("\n") + (all.length > 5 ? `\n…and ${all.length - 5} older runs` : "");

    const color =
        running > 0 ? new vscode.ThemeColor("statusBarItem.warningBackground") :
        clarification > 0 ? new vscode.ThemeColor("statusBarItem.warningBackground") :
        failed > 0 ? new vscode.ThemeColor("statusBarItem.errorBackground") :
        undefined;

    return { label, tooltip, color };
}

// ---------------------------------------------------------------------------
// QuickPick details
// ---------------------------------------------------------------------------

function showDetails(runs: RunsSnapshot): void {
    const all = sorted(runs);
    if (all.length === 0) {
        vscode.window.showInformationMessage("No agent runs recorded.");
        return;
    }

    const items = all.slice(0, 20).map((r) => {
        const taskSummary = r.taskIds.length === 1 ? r.taskIds[0] : `${r.taskIds.length} tasks`;
        return {
            label: `${statusIcon(r.status)} ${r.runId}`,
            description: taskSummary,
            detail: `${r.startedAt}${r.finishedAt ? " → " + r.finishedAt : " (running)"}`,
            run: r,
        };
    });

    vscode.window.showQuickPick(items, {
        title: "Agent Runs (latest first)",
        matchOnDescription: true,
        matchOnDetail: true,
    }).then((picked) => {
        if (!picked) return;
        openRunJson(picked.run);
    });
}

// ---------------------------------------------------------------------------
// Virtual document provider — stable URI per run so tabs are reused
// ---------------------------------------------------------------------------

const RUN_SCHEME = "agent-run";

class RunDocumentProvider implements vscode.TextDocumentContentProvider {
    private readonly _docs = new Map<string, string>();
    private readonly _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    readonly onDidChangeEmitter = this._onDidChange;
    readonly onDidChange = this._onDidChange.event;

    set(runId: string, content: string): void {
        this._docs.set(runId, content);
        this._onDidChange.fire(vscode.Uri.parse(`${RUN_SCHEME}:/${runId}.json`));
    }

    provideTextDocumentContent(uri: vscode.Uri): string {
        const runId = path.basename(uri.path, ".json");
        return this._docs.get(runId) ?? "{}";
    }
}

const runDocProvider = new RunDocumentProvider();

function openRunJson(run: Run): void {
    const content = JSON.stringify(run, null, 2);
    runDocProvider.set(run.runId, content);
    const uri = vscode.Uri.parse(`${RUN_SCHEME}:/${run.runId}.json`);
    vscode.window.showTextDocument(uri, { preview: false, preserveFocus: false });
}

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

export function activate(context: vscode.ExtensionContext): void {
    // Virtual document provider for stable run URIs
    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(RUN_SCHEME, runDocProvider),
        { dispose: () => runDocProvider.onDidChangeEmitter.dispose() }
    );
    // Sidebar tree view — registered unconditionally so VS Code always has a provider
    const treeProvider = new RunsTreeProvider();
    const treeView = vscode.window.createTreeView("agentStatus.runsView", {
        treeDataProvider: treeProvider,
        showCollapseAll: true,
    });
    context.subscriptions.push(treeView);

    // Status bar
    const bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
    bar.command = "agentStatus.showDetails";
    bar.show();
    context.subscriptions.push(bar);

    function getRunsFile(): string | undefined {
        const configured = vscode.workspace.getConfiguration("agentStatus").get<string>("runsFilePath", "").trim();
        if (configured && path.isAbsolute(configured)) return configured;
        const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (root) return path.join(root, configured || RUNS_FILE_REL);
        return undefined;
    }

    function refresh(): void {
        const runsFile = getRunsFile();
        const runs = runsFile ? readRuns(runsFile) : {};
        const { label, tooltip, color } = summarise(runs);
        bar.text = label;
        bar.tooltip = tooltip;
        bar.backgroundColor = color;
        treeProvider.refresh(runs);
    }

    refresh();

    // Watch for file changes
    let watcher: fs.FSWatcher | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    context.subscriptions.push({ dispose: () => { clearTimeout(retryTimer); watcher?.close(); } });

    function startWatcher(): void {
        const runsFile = getRunsFile();
        if (!runsFile) { retryTimer = setTimeout(startWatcher, 5000); return; }
        const dir = path.dirname(runsFile);
        if (!fs.existsSync(dir)) {
            retryTimer = setTimeout(startWatcher, 5000);
            return;
        }
        try {
            // Watch the directory, not the file, so inode replacement from atomic
            // rename (write-to-tmp + rename-into-place in the orchestrator) keeps
            // triggering updates reliably on Linux/inotify and macOS/kqueue.
            watcher = fs.watch(dir, { persistent: false }, (_, filename) => {
                if (String(filename) === path.basename(runsFile)) {
                    refresh();
                }
            });
        } catch {
            retryTimer = setTimeout(startWatcher, 5000);
        }
    }

    startWatcher();

    // Polling fallback every 10s in case fs.watch misses events (known unreliable on Linux)
    const poller = setInterval(() => refresh(), 10_000);
    context.subscriptions.push({ dispose: () => clearInterval(poller) });

    context.subscriptions.push(
        vscode.commands.registerCommand("agentStatus.showDetails", () => {
            const runsFile = getRunsFile();
            showDetails(runsFile ? readRuns(runsFile) : {});
        }),
        vscode.commands.registerCommand("agentStatus.openRun", (run: Run) =>
            openRunJson(run)
        ),
        vscode.commands.registerCommand("agentStatus.refresh", () => refresh())
    );
}

export function deactivate(): void {}
