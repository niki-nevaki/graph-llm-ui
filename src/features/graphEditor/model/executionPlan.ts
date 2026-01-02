import type { DefinitionNode } from "../../../domain/workflow";
import type { Edge } from "@xyflow/react";
import { createIssue } from "./runtime";
import type { Issue } from "./runtime";

export type ExecutionPlan = {
  nodesInOrder: string[];
  adjacency: Record<string, string[]>;
  startNodes: string[];
  unreachableNodes: string[];
};

export function compileExecutionPlan(
  nodes: DefinitionNode[],
  edges: Edge[]
): { plan?: ExecutionPlan; issues: Issue[] } {
  const issues: Issue[] = [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  const adjacency: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};

  nodes.forEach((node) => {
    adjacency[node.id] = [];
    inDegree[node.id] = 0;
  });

  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return;
    adjacency[edge.source].push(edge.target);
    inDegree[edge.target] += 1;
  });

  const startNodes = nodes.filter((node) => inDegree[node.id] === 0).map((n) => n.id);
  if (startNodes.length === 0) {
    issues.push(
      createIssue({
        severity: "error",
        kind: "graph",
        message: "В графе нет стартовой ноды.",
      })
    );
  }

  const queue = [...startNodes];
  const nodesInOrder: string[] = [];
  const inDegreeMutable = { ...inDegree };

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    nodesInOrder.push(current);
    adjacency[current].forEach((next) => {
      inDegreeMutable[next] -= 1;
      if (inDegreeMutable[next] === 0) {
        queue.push(next);
      }
    });
  }

  if (nodesInOrder.length !== nodes.length) {
    issues.push(
      createIssue({
        severity: "error",
        kind: "graph",
        message: "В графе обнаружен цикл. Выполнение возможно только для DAG.",
      })
    );
  }

  const reachable = new Set<string>();
  const stack = [...startNodes];
  while (stack.length > 0) {
    const nodeId = stack.pop();
    if (!nodeId || reachable.has(nodeId)) continue;
    reachable.add(nodeId);
    adjacency[nodeId]?.forEach((next) => stack.push(next));
  }

  const unreachableNodes = nodes
    .map((node) => node.id)
    .filter((id) => !reachable.has(id));
  unreachableNodes.forEach((nodeId) => {
    issues.push(
      createIssue({
        severity: "warning",
        kind: "graph",
        message: "Нода недостижима из стартовых.",
        nodeId,
      })
    );
  });

  if (issues.some((issue) => issue.severity === "error")) {
    return { issues };
  }

  return {
    issues,
    plan: {
      nodesInOrder,
      adjacency,
      startNodes,
      unreachableNodes,
    },
  };
}
