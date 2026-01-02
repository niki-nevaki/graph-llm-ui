import type { DefinitionEdge, DefinitionNode } from "./types";

export function validateNode(node: DefinitionNode): {
  ok: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!node.name.trim()) issues.push("Name is empty.");

  switch (node.kind) {
    case "text": {
      const text = node.config.text ?? "";
      const fileName = node.config.fileName ?? "";
      if (node.config.mode === "inline" && !text.trim()) {
        issues.push("Text is empty.");
      }
      if (node.config.mode === "file" && !fileName.trim()) {
        issues.push("File name is empty.");
      }
      break;
    }
    case "tgBot":
      if (!node.config.token.trim()) issues.push("Telegram token is empty.");
      if (!node.config.chatId.trim()) issues.push("Chat id is empty.");
      break;
    case "relDb":
      if (!node.config.host.trim() && node.config.driver !== "sqlite") {
        issues.push("DB host is empty.");
      }
      if (!node.config.database.trim() && node.config.driver !== "sqlite") {
        issues.push("DB name is empty.");
      }
      if (node.config.operation === "query" && !(node.config.sql ?? "").trim()) {
        issues.push("SQL is empty.");
      }
      if (
        node.config.operation !== "query" &&
        !(node.config.table ?? "").trim()
      ) {
        issues.push("Table is empty.");
      }
      break;
    case "llm":
      if (!node.config.apiKey.trim()) issues.push("LLM API key is empty.");
      if (!node.config.model.trim()) issues.push("Model is empty.");
      break;
    case "agent":
      break;
    case "tool":
      break;
  }

  return { ok: issues.length === 0, issues };
}

export function validateGraph(
  nodes: DefinitionNode[],
  edges: DefinitionEdge[]
): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const nodeIds = new Set<string>();
  let hasDuplicate = false;

  for (const node of nodes) {
    if (nodeIds.has(node.id)) {
      hasDuplicate = true;
    }
    nodeIds.add(node.id);
    const result = validateNode(node);
    if (!result.ok) {
      issues.push(...result.issues.map((issue) => `${node.id}: ${issue}`));
    }
  }

  if (hasDuplicate) {
    issues.push("Duplicate node ids detected.");
  }

  for (const edge of edges) {
    if (!nodeIds.has(edge.source.nodeId)) {
      issues.push(`Edge ${edge.id} source missing: ${edge.source.nodeId}`);
    }
    if (!nodeIds.has(edge.target.nodeId)) {
      issues.push(`Edge ${edge.id} target missing: ${edge.target.nodeId}`);
    }
  }

  return { ok: issues.length === 0, issues };
}
