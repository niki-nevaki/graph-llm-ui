import type { NodeRunStatus } from "./runtime";

export type ExecutionStatus = "running" | "succeeded" | "failed" | "cancelled";

export type Execution = {
  id: string;
  status: ExecutionStatus;
  startedAt: number;
  finishedAt?: number;
  durationMs?: number;
};

export type NodeRun = {
  nodeId: string;
  status: NodeRunStatus;
  startedAt?: number;
  finishedAt?: number;
  durationMs?: number;
  output?: unknown;
  outputSummary?: string;
  error?: {
    message: string;
    details?: string;
  };
};
