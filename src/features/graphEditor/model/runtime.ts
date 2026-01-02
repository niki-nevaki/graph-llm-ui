export type IssueSeverity = "error" | "warning" | "info";
export type IssueKind = "field" | "edge" | "graph" | "runtime";

export type Issue = {
  id: string;
  severity: IssueSeverity;
  kind: IssueKind;
  message: string;
  nodeId?: string;
  edgeId?: string;
  fieldPath?: string;
  details?: string;
  fixHint?: string;
};

export type GraphRunState =
  | "idle"
  | "validating"
  | "ready"
  | "running"
  | "succeeded"
  | "failed_compile"
  | "failed_runtime"
  | "cancelled";

export type NodeRunStatus =
  | "idle"
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped"
  | "cancelled";

export type NodeRunResult = {
  status: NodeRunStatus;
  startedAt?: number;
  endedAt?: number;
  durationMs?: number;
  outputSummary?: string;
  error?: {
    message: string;
    stack?: string;
    code?: string;
    details?: string;
  };
  warnings?: string[];
};

let issueCounter = 0;

export const createIssue = (issue: Omit<Issue, "id">): Issue => ({
  id: `issue-${Date.now()}-${issueCounter++}`,
  ...issue,
});
