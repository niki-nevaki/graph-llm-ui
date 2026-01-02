import type { DefinitionEdge, DefinitionNode, FieldValue } from "./types";

const isFieldProvided = (field?: FieldValue): boolean => {
  if (!field) return false;
  if (field.mode === "expression") return Boolean(field.expression?.trim());
  if (field.mode === "fromAI") {
    return Boolean(
      field.fromAI?.key?.trim() || field.fromAI?.description?.trim()
    );
  }
  return Boolean(field.value?.trim());
};

const getFixedValue = (field?: FieldValue): string => {
  if (!field || field.mode !== "fixed") return "";
  return field.value?.trim() ?? "";
};

const getFixedNumber = (field?: FieldValue): number => {
  if (!field || field.mode !== "fixed") return Number.NaN;
  const value = field.value?.trim() ?? "";
  return Number(value);
};

const isA1Range = (value: string) =>
  /^[A-Za-z]+[0-9]+(:[A-Za-z]+[0-9]+)?$/.test(value);

const isColumnName = (value: string) => /^[A-Za-z]+$/.test(value);

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
      if (node.config.toolId === "http_request" && node.config.httpRequest) {
        const http = node.config.httpRequest;
        if (!http.base.method) issues.push("HTTP method is required.");
        if (!http.base.url.trim()) issues.push("URL is required.");

        if (http.query.sendQueryParameters && http.query.queryParamsMode === "fields") {
          http.query.queryParameters.forEach((param, index) => {
            if (!param.name.trim()) {
              issues.push(`Query param #${index + 1} name is empty.`);
            }
          });
        }

        if (http.headers.sendHeaders && http.headers.headersMode === "fields") {
          http.headers.headerParameters.forEach((param, index) => {
            if (!param.name.trim()) {
              issues.push(`Header #${index + 1} name is empty.`);
            }
          });
        }

        if (http.body.sendBody) {
          if (!http.body.bodyContentType) {
            issues.push("Body content type is required.");
          }

          if (http.body.bodyContentType === "raw") {
            if (!http.body.rawContentType.trim()) {
              issues.push("Raw content type is required.");
            }
            if (!http.body.rawBody.trim()) {
              issues.push("Raw body is required.");
            }
          }

          if (http.body.bodyContentType === "n8nBinaryFile") {
            if (!http.body.inputDataFieldName.trim()) {
              issues.push("Input data field name is required.");
            }
          }

          if (http.body.bodyContentType === "formData") {
            http.body.bodyParameters.forEach((param, index) => {
              if (param.isBinary && !param.inputDataFieldName?.trim()) {
                issues.push(
                  `Form data param #${index + 1} requires input data field name.`
                );
              }
            });
          }
        }

        if (
          http.options.responseOptions.responseFormat === "file" ||
          http.options.responseOptions.responseFormat === "text"
        ) {
          if (!http.options.responseOptions.putOutputInField.trim()) {
            issues.push("Output field name is required for file/text response.");
          }
        }
      }
      if (node.config.toolId === "google_sheets" && node.config.googleSheets) {
        const gs = node.config.googleSheets;
        const documentOps = new Set(["createDocument", "deleteDocument"]);
        const sheetOps = new Set([
          "appendRow",
          "upsertRow",
          "updateRow",
          "getRows",
          "clear",
          "createSheet",
          "deleteSheet",
          "deleteRowsOrColumns",
        ]);

        if (!gs.resource) issues.push("Resource is required.");
        if (!gs.operation) issues.push("Operation is required.");

        if (gs.resource === "document" && !documentOps.has(gs.operation)) {
          issues.push("Operation not supported for document resource.");
        }
        if (gs.resource === "sheet" && !sheetOps.has(gs.operation)) {
          issues.push("Operation not supported for sheet resource.");
        }

        switch (gs.selectors.documentSelectMode) {
          case "byUrl":
            if (!isFieldProvided(gs.selectors.documentUrl)) {
              issues.push("Document URL is required.");
            }
            break;
          case "byId":
            if (!isFieldProvided(gs.selectors.spreadsheetId)) {
              issues.push("Spreadsheet ID is required.");
            }
            break;
          case "fromList":
            if (!isFieldProvided(gs.selectors.spreadsheetId)) {
              issues.push("Document selection is required.");
            }
            break;
        }

        const needsSheetSelectors =
          gs.resource === "sheet" &&
          gs.operation !== "createSheet" &&
          gs.operation !== "createDocument";

        if (needsSheetSelectors) {
          switch (gs.selectors.sheetSelectMode) {
            case "byUrl":
              if (!isFieldProvided(gs.selectors.sheetUrl)) {
                issues.push("Sheet URL is required.");
              }
              break;
            case "byId":
              if (!isFieldProvided(gs.selectors.sheetId)) {
                issues.push("Sheet ID is required.");
              }
              break;
            case "byName":
              if (!isFieldProvided(gs.selectors.sheetName)) {
                issues.push("Sheet name is required.");
              }
              break;
            case "fromList":
              if (!isFieldProvided(gs.selectors.sheetId)) {
                issues.push("Sheet selection is required.");
              }
              break;
          }
        }

        if (gs.resource === "document" && gs.operation === "createDocument") {
          const params = gs.params.document.createDocument;
          if (!isFieldProvided(params.title)) {
            issues.push("Document title is required.");
          }
          if (!params.sheets.length) {
            issues.push("At least one sheet name is required.");
          }
          params.sheets.forEach((sheet, index) => {
            if (!isFieldProvided(sheet)) {
              issues.push(`Sheet name #${index + 1} is empty.`);
            }
          });
        }

        if (gs.resource === "sheet") {
          const sheetParams = gs.params.sheet;

          if (gs.operation === "appendRow") {
            if (sheetParams.appendRow.mappingMode === "manual") {
              sheetParams.appendRow.dataManual.forEach((row, index) => {
                if (!isFieldProvided(row.column)) {
                  issues.push(`Manual mapping #${index + 1} column is empty.`);
                }
              });
            }
          }

          if (gs.operation === "upsertRow") {
            if (sheetParams.upsertRow.mappingMode === "manual") {
              sheetParams.upsertRow.dataManual.forEach((row, index) => {
                if (!isFieldProvided(row.column)) {
                  issues.push(`Manual mapping #${index + 1} column is empty.`);
                }
              });
            }
            if (!isFieldProvided(sheetParams.upsertRow.match.matchColumn)) {
              issues.push("Match column is required.");
            }
            if (!isFieldProvided(sheetParams.upsertRow.match.matchValue)) {
              issues.push("Match value is required.");
            }
          }

          if (gs.operation === "updateRow") {
            const rowNumber = sheetParams.updateRow.rowNumber;
            if (!isFieldProvided(rowNumber)) {
              issues.push("Row number is required.");
            } else {
              const numeric = getFixedNumber(rowNumber);
              if (!Number.isNaN(numeric) && numeric < 1) {
                issues.push("Row number must be >= 1.");
              }
            }
            if (sheetParams.updateRow.mappingMode === "manual") {
              sheetParams.updateRow.dataManual.forEach((row, index) => {
                if (!isFieldProvided(row.column)) {
                  issues.push(`Manual mapping #${index + 1} column is empty.`);
                }
              });
            }
          }

          if (gs.operation === "clear") {
            const clear = sheetParams.clear;
            if (clear.clearMode === "specificRange") {
              if (!isFieldProvided(clear.specificRange.a1Range)) {
                issues.push("A1 range is required.");
              } else {
                const value = getFixedValue(clear.specificRange.a1Range);
                if (value && !isA1Range(value)) {
                  issues.push("A1 range format is invalid.");
                }
              }
            }
            if (clear.clearMode === "specificRows") {
              if (!isFieldProvided(clear.specificRows.startRow)) {
                issues.push("Start row is required.");
              }
              const count = getFixedNumber(clear.specificRows.count);
              if (!Number.isNaN(count) && count <= 0) {
                issues.push("Row count must be > 0.");
              }
            }
            if (clear.clearMode === "specificColumns") {
              if (!isFieldProvided(clear.specificColumns.startColumn)) {
                issues.push("Start column is required.");
              } else {
                const value = getFixedValue(clear.specificColumns.startColumn);
                if (value && !isColumnName(value)) {
                  issues.push("Column name format is invalid.");
                }
              }
              const count = getFixedNumber(clear.specificColumns.count);
              if (!Number.isNaN(count) && count <= 0) {
                issues.push("Column count must be > 0.");
              }
            }
          }

          if (gs.operation === "deleteRowsOrColumns") {
            const params = sheetParams.deleteRowsOrColumns;
            const count = getFixedNumber(params.count);
            if (!Number.isNaN(count) && count <= 0) {
              issues.push("Delete count must be > 0.");
            }
            if (params.deleteType === "rows") {
              if (!isFieldProvided(params.startRow)) {
                issues.push("Start row is required.");
              }
            }
            if (params.deleteType === "columns") {
              if (!isFieldProvided(params.startColumn)) {
                issues.push("Start column is required.");
              } else {
                const value = getFixedValue(params.startColumn);
                if (value && !isColumnName(value)) {
                  issues.push("Column name format is invalid.");
                }
              }
            }
          }
        }
      }
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
