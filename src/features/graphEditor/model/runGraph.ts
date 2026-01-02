import type { ExecutionPlan } from "./executionPlan";
import type { Issue, NodeRunStatus } from "./runtime";

type RunGraphOptions = {
  signal: AbortSignal;
  onNodeStatus: (nodeId: string, status: NodeRunStatus) => void;
  delayMs?: number;
};

export type RunGraphResult = {
  status: "succeeded" | "failed_runtime" | "cancelled";
  issues: Issue[];
};

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });

export async function runGraph(
  plan: ExecutionPlan,
  options: RunGraphOptions
): Promise<RunGraphResult> {
  const issues: Issue[] = [];
  const { signal, onNodeStatus, delayMs = 280 } = options;

  for (const nodeId of plan.nodesInOrder) {
    if (signal.aborted) {
      return { status: "cancelled", issues };
    }

    onNodeStatus(nodeId, "running");
    await delay(delayMs);

    if (signal.aborted) {
      return { status: "cancelled", issues };
    }

    onNodeStatus(nodeId, "succeeded");
  }

  return { status: "succeeded", issues };
}
