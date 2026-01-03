import type { DefinitionNode, FieldValue, NodeKind } from "../../../domain/workflow";
import type { Issue } from "./runtime";
import { createIssue } from "./runtime";

export type PortDirection = "input" | "output";

export type NodePort = {
  id: string;
  label: string;
  direction: PortDirection;
  dataType: string;
  required?: boolean;
  maxConnections?: number;
};

export type NodeTypeDefinition = {
  kind: NodeKind;
  ports: {
    inputs: NodePort[];
    outputs: NodePort[];
  };
  validate?: (node: DefinitionNode) => Issue[];
};

const isFieldValueFilled = (value?: FieldValue): boolean => {
  if (!value) return false;
  if (value.mode === "expression") return Boolean(value.expression?.trim());
  if (value.mode === "fromAI") {
    return Boolean(
      value.fromAI?.key?.trim() ||
        value.fromAI?.description?.trim() ||
        value.fromAI?.hint?.trim()
    );
  }
  return Boolean(value.value?.trim());
};

const basePorts = {
  inputs: [{ id: "in", label: "in", direction: "input", dataType: "any" }],
  outputs: [{ id: "out", label: "out", direction: "output", dataType: "any" }],
};

export const NODE_TYPE_REGISTRY: Record<NodeKind, NodeTypeDefinition> = {
  text: {
    kind: "text",
    ports: basePorts,
    validate: (node) => {
      if (node.kind !== "text") return [];
      if (node.config.mode === "inline" && !(node.config.text ?? "").trim()) {
        return [
          createIssue({
            severity: "error",
            kind: "field",
            message: "Заполните поле \"Текст\".",
            nodeId: node.id,
            fieldPath: "config.text",
          }),
        ];
      }
      if (node.config.mode === "file" && !(node.config.fileName ?? "").trim()) {
        return [
          createIssue({
            severity: "error",
            kind: "field",
            message: "Заполните поле \"Имя файла\".",
            nodeId: node.id,
            fieldPath: "config.fileName",
          }),
        ];
      }
      return [];
    },
  },
  tgBot: {
    kind: "tgBot",
    ports: basePorts,
    validate: (node) => {
      if (node.kind !== "tgBot") return [];
      const issues: Issue[] = [];
      if (!node.config.token.trim()) {
        issues.push(
          createIssue({
            severity: "error",
            kind: "field",
            message: "Токен бота обязателен.",
            nodeId: node.id,
            fieldPath: "config.token",
          })
        );
      }
      if (!node.config.chatId.trim()) {
        issues.push(
          createIssue({
            severity: "error",
            kind: "field",
            message: "ID чата обязателен.",
            nodeId: node.id,
            fieldPath: "config.chatId",
          })
        );
      }
      return issues;
    },
  },
  relDb: {
    kind: "relDb",
    ports: basePorts,
    validate: (node) => {
      if (node.kind !== "relDb") return [];
      const issues: Issue[] = [];
      const isSqlite = node.config.driver === "sqlite";
      if (!isSqlite && !node.config.host.trim()) {
        issues.push(
          createIssue({
            severity: "error",
            kind: "field",
            message: "Хост базы данных обязателен.",
            nodeId: node.id,
            fieldPath: "config.host",
          })
        );
      }
      if (!isSqlite && !node.config.database.trim()) {
        issues.push(
          createIssue({
            severity: "error",
            kind: "field",
            message: "Имя базы данных обязательно.",
            nodeId: node.id,
            fieldPath: "config.database",
          })
        );
      }
      if (node.config.operation !== "query" && !(node.config.table ?? "").trim()) {
        issues.push(
          createIssue({
            severity: "error",
            kind: "field",
            message: "Таблица обязательна для выбранной операции.",
            nodeId: node.id,
            fieldPath: "config.table",
          })
        );
      }
      return issues;
    },
  },
  llm: {
    kind: "llm",
    ports: {
      inputs: [
        { id: "in", label: "in", direction: "input", dataType: "any", required: true },
      ],
      outputs: basePorts.outputs,
    },
    validate: (node) => {
      if (node.kind !== "llm") return [];
      const issues: Issue[] = [];
      if (!node.config.model.trim()) {
        issues.push(
          createIssue({
            severity: "error",
            kind: "field",
            message: "Модель обязательна.",
            nodeId: node.id,
            fieldPath: "config.model",
          })
        );
      }
      return issues;
    },
  },
  agent: {
    kind: "agent",
    ports: {
      inputs: [
        { id: "in", label: "in", direction: "input", dataType: "any", required: true },
        { id: "tool", label: "tool", direction: "input", dataType: "any" },
        { id: "memory", label: "memory", direction: "input", dataType: "any" },
      ],
      outputs: basePorts.outputs,
    },
    validate: (node) => {
      if (node.kind !== "agent") return [];
      const issues: Issue[] = [];
      if (!node.config.model.trim()) {
        issues.push(
          createIssue({
            severity: "error",
            kind: "field",
            message: "Модель агента обязательна.",
            nodeId: node.id,
            fieldPath: "config.model",
          })
        );
      }
      if (!node.config.system_prompt.trim()) {
        issues.push(
          createIssue({
            severity: "error",
            kind: "field",
            message: "Системный промпт обязателен.",
            nodeId: node.id,
            fieldPath: "config.system_prompt",
          })
        );
      }
      return issues;
    },
  },
  tool: {
    kind: "tool",
    ports: {
      inputs: basePorts.inputs,
      outputs: basePorts.outputs,
    },
    validate: (node) => {
      if (node.kind !== "tool") return [];
      const issues: Issue[] = [];
      if (!node.config.toolName.trim()) {
        issues.push(
          createIssue({
            severity: "error",
            kind: "field",
            message: "Выберите инструмент.",
            nodeId: node.id,
            fieldPath: "config.toolName",
          })
        );
      }

      if (node.config.toolId === "http_request" && node.config.httpRequest) {
        if (!node.config.httpRequest.base.method) {
          issues.push(
            createIssue({
              severity: "error",
              kind: "field",
              message: "Метод HTTP обязателен.",
              nodeId: node.id,
              fieldPath: "config.httpRequest.base.method",
            })
          );
        }
        if (!node.config.httpRequest.base.url.trim()) {
          issues.push(
            createIssue({
              severity: "error",
              kind: "field",
              message: "URL обязателен.",
              nodeId: node.id,
              fieldPath: "config.httpRequest.base.url",
            })
          );
        }
      }

      if (node.config.toolId === "google_sheets" && node.config.googleSheets) {
        if (!node.config.googleSheets.resource) {
          issues.push(
            createIssue({
              severity: "error",
              kind: "field",
              message: "Выберите ресурс Google Sheets.",
              nodeId: node.id,
              fieldPath: "config.googleSheets.resource",
            })
          );
        }
        if (!node.config.googleSheets.operation) {
          issues.push(
            createIssue({
              severity: "error",
              kind: "field",
              message: "Выберите операцию Google Sheets.",
              nodeId: node.id,
              fieldPath: "config.googleSheets.operation",
            })
          );
        }
        const selectors = node.config.googleSheets.selectors;
        if (selectors.documentSelectMode === "byUrl") {
          if (!isFieldValueFilled(selectors.documentUrl)) {
            issues.push(
              createIssue({
                severity: "error",
                kind: "field",
                message: "Укажите URL документа.",
                nodeId: node.id,
                fieldPath: "config.googleSheets.selectors.documentUrl",
              })
            );
          }
        }
        if (selectors.documentSelectMode === "byId") {
          if (!isFieldValueFilled(selectors.spreadsheetId)) {
            issues.push(
              createIssue({
                severity: "error",
                kind: "field",
                message: "Укажите ID документа.",
                nodeId: node.id,
                fieldPath: "config.googleSheets.selectors.spreadsheetId",
              })
            );
          }
        }
        if (selectors.documentSelectMode === "fromList") {
          if (!isFieldValueFilled(selectors.spreadsheetId)) {
            issues.push(
              createIssue({
                severity: "warning",
                kind: "field",
                message: "Документ не выбран.",
                nodeId: node.id,
                fieldPath: "config.googleSheets.selectors.spreadsheetId",
              })
            );
          }
        }
        if (selectors.sheetSelectMode === "byName") {
          if (!isFieldValueFilled(selectors.sheetName)) {
            issues.push(
              createIssue({
                severity: "warning",
                kind: "field",
                message: "Укажите имя листа.",
                nodeId: node.id,
                fieldPath: "config.googleSheets.selectors.sheetName",
              })
            );
          }
        }
        if (selectors.sheetSelectMode === "byId") {
          if (!isFieldValueFilled(selectors.sheetId)) {
            issues.push(
              createIssue({
                severity: "warning",
                kind: "field",
                message: "Укажите ID листа.",
                nodeId: node.id,
                fieldPath: "config.googleSheets.selectors.sheetId",
              })
            );
          }
        }
        if (selectors.sheetSelectMode === "byUrl") {
          if (!isFieldValueFilled(selectors.sheetUrl)) {
            issues.push(
              createIssue({
                severity: "warning",
                kind: "field",
                message: "Укажите URL листа.",
                nodeId: node.id,
                fieldPath: "config.googleSheets.selectors.sheetUrl",
              })
            );
          }
        }
      }

      return issues;
    },
  },
};

export const getPortDefinition = (
  kind: NodeKind,
  handleId: string | null | undefined,
  direction: PortDirection
) => {
  const registry = NODE_TYPE_REGISTRY[kind];
  const normalizedHandle = handleId ?? (direction === "input" ? "in" : "out");
  const list =
    direction === "input" ? registry.ports.inputs : registry.ports.outputs;
  return list.find((port) => port.id === normalizedHandle) ?? null;
};

export const getAllPorts = (kind: NodeKind): NodePort[] => {
  const registry = NODE_TYPE_REGISTRY[kind];
  return registry.ports.inputs.concat(registry.ports.outputs);
};
