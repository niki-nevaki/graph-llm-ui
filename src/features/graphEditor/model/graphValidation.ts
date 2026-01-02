import type { DefinitionNode } from "../../../domain/workflow";
import type { Edge } from "@xyflow/react";
import { compileExecutionPlan } from "./executionPlan";
import { createIssue, type Issue } from "./runtime";
import { NODE_TYPE_REGISTRY, getPortDefinition, getAllPorts } from "./nodeRegistry";

type ValidationResult = {
  issues: Issue[];
  errors: Issue[];
  warnings: Issue[];
  missingRequired: number;
  plan?: ReturnType<typeof compileExecutionPlan>["plan"];
};

const isTypeCompatible = (sourceType: string, targetType: string) =>
  sourceType === "any" || targetType === "any" || sourceType === targetType;

export function validateGraphOnSubmit(
  nodes: DefinitionNode[],
  edges: Edge[]
): ValidationResult {
  const issues: Issue[] = [];
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  nodes.forEach((node) => {
    const registry = NODE_TYPE_REGISTRY[node.kind];
    if (!registry) {
      issues.push(
        createIssue({
          severity: "error",
          kind: "graph",
          message: "Неизвестный тип ноды.",
          nodeId: node.id,
        })
      );
      return;
    }

    const nodeIssues = registry.validate?.(node) ?? [];
    issues.push(...nodeIssues);
  });

  const edgeKeySet = new Set<string>();
  edges.forEach((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (edge.source === edge.target) {
      issues.push(
        createIssue({
          severity: "error",
          kind: "edge",
          message: "Нельзя соединять ноду саму с собой.",
          edgeId: edge.id,
          nodeId: edge.source,
        })
      );
      return;
    }

    if (!sourceNode || !targetNode) {
      issues.push(
        createIssue({
          severity: "error",
          kind: "edge",
          message: "Связь указывает на несуществующую ноду.",
          edgeId: edge.id,
        })
      );
      return;
    }

    const sourcePort = getPortDefinition(
      sourceNode.kind,
      edge.sourceHandle ?? null,
      "output"
    );
    const targetPort = getPortDefinition(
      targetNode.kind,
      edge.targetHandle ?? null,
      "input"
    );

    if (!sourcePort) {
      issues.push(
        createIssue({
          severity: "error",
          kind: "edge",
          message: "Исходящий порт не найден.",
          edgeId: edge.id,
          nodeId: sourceNode.id,
        })
      );
    }

    if (!targetPort) {
      issues.push(
        createIssue({
          severity: "error",
          kind: "edge",
          message: "Входной порт не найден.",
          edgeId: edge.id,
          nodeId: targetNode.id,
        })
      );
    }

    if (sourcePort && targetPort) {
      if (!isTypeCompatible(sourcePort.dataType, targetPort.dataType)) {
        issues.push(
          createIssue({
            severity: "error",
            kind: "edge",
            message: "Несовместимые типы данных на портах.",
            edgeId: edge.id,
            nodeId: targetNode.id,
          })
        );
      }
    }

    const key = `${edge.source}:${edge.sourceHandle ?? "out"}->${edge.target}:${
      edge.targetHandle ?? "in"
    }`;
    if (edgeKeySet.has(key)) {
      issues.push(
        createIssue({
          severity: "warning",
          kind: "edge",
          message: "Дублирующая связь.",
          edgeId: edge.id,
        })
      );
    } else {
      edgeKeySet.add(key);
    }
  });

  nodes.forEach((node) => {
    const ports = getAllPorts(node.kind).filter((port) => port.direction === "input");
    ports.forEach((port) => {
      if (!port.required) return;
      const incoming = edges.filter(
        (edge) =>
          edge.target === node.id &&
          (edge.targetHandle ?? "in") === port.id
      );
      if (incoming.length === 0) {
        issues.push(
          createIssue({
            severity: "error",
            kind: "edge",
            message: "Обязательный вход не подключен.",
            nodeId: node.id,
          })
        );
      }
    });
  });

  nodes.forEach((node) => {
    const registry = NODE_TYPE_REGISTRY[node.kind];
    const outputs = registry?.ports.outputs ?? [];
    outputs.forEach((port) => {
      if (!port.maxConnections) return;
      const outgoing = edges.filter(
        (edge) =>
          edge.source === node.id &&
          (edge.sourceHandle ?? "out") === port.id
      );
      if (outgoing.length > port.maxConnections) {
        issues.push(
          createIssue({
            severity: "error",
            kind: "edge",
            message: "Превышено число соединений на порту.",
            nodeId: node.id,
          })
        );
      }
    });
  });

  const compileResult = compileExecutionPlan(nodes, edges);
  issues.push(...compileResult.issues);

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const missingRequired = issues.filter(
    (issue) => issue.severity === "error" && issue.kind === "field"
  ).length;

  return {
    issues,
    errors,
    warnings,
    missingRequired,
    plan: errors.length === 0 ? compileResult.plan : undefined,
  };
}
