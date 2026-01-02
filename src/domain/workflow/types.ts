export type NodeKind = "text" | "tgBot" | "relDb" | "llm" | "agent" | "tool";

export type ValueMode = "fixed" | "expression" | "fromAI";

export type FieldValueFromAI = {
  hint?: string;
  key?: string;
  description?: string;
  type?: string;
  defaultValue?: unknown;
};

export type FieldValue = {
  mode: ValueMode;
  value?: string;
  expression?: string;
  fromAI?: FieldValueFromAI;
};

export type NodeMeta = {
  description?: string;
  tags?: string[];
};

export type TextNodeConfig = {
  mode: "inline" | "file";
  text?: string;
  fileName?: string;
};

export type TgBotNodeConfig = {
  direction: "in" | "out" | "inout";
  token: string;
  chatId: string;
  parseMode: "plain" | "markdown" | "html";
};

export type RelDbNodeConfig = {
  driver: "postgres" | "mysql" | "mssql" | "sqlite";
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  operation: "query" | "select" | "insert" | "update" | "delete";
  table?: string;
};

export type LlmNodeConfig = {
  provider: "openai" | "anthropic" | "azure";
  apiKey: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
};

export type AgentNodeConfig = {
  mode: "chat" | "task" | "planner";
  model: string;
  temperature: number;
  system_prompt: string;
  use_memory: boolean;
};

export type HttpRequestAuthType =
  | "none"
  | "predefined"
  | "basic"
  | "digest"
  | "header"
  | "bearer"
  | "oauth1"
  | "oauth2"
  | "query"
  | "custom";

export type InlineAuthConfig = {
  basic?: { username: FieldValue; password: FieldValue };
  digest?: { username: FieldValue; password: FieldValue };
  header?: { headerName: string; headerValue: FieldValue };
  bearer?: { token: FieldValue };
  oauth1?: {
    consumerKey: FieldValue;
    consumerSecret: FieldValue;
    token: FieldValue;
    tokenSecret: FieldValue;
    signatureMethod?: string;
  };
  oauth2?: { accessToken: FieldValue };
  query?: { queryName: string; queryValue: FieldValue };
  custom?: { customAuthJson: string };
};

export type HttpRequestToolConfig = {
  base: {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
    url: string;
    authentication: {
      authType: HttpRequestAuthType;
      credentialRef?: {
        id?: string;
        name?: string;
      };
      inlineAuth?: InlineAuthConfig;
    };
  };
  query: {
    sendQueryParameters: boolean;
    queryParamsMode: "fields" | "json";
    queryParameters: Array<{ name: string; value: FieldValue }>;
    queryParametersJson: string;
  };
  headers: {
    sendHeaders: boolean;
    headersMode: "fields" | "json";
    headerParameters: Array<{ name: string; value: FieldValue }>;
    headerParametersJson: string;
  };
  body: {
    sendBody: boolean;
    bodyContentType:
      | "formUrlencoded"
      | "formData"
      | "json"
      | "n8nBinaryFile"
      | "raw";
    bodyParameters: Array<{
      name: string;
      value: FieldValue;
      isBinary?: boolean;
      inputDataFieldName?: string;
    }>;
    jsonBody: string;
    rawBody: string;
    rawContentType: string;
    inputDataFieldName: string;
  };
  options: {
    arrayFormatInQuery: "repeat" | "brackets" | "comma";
    batching: {
      enabled: boolean;
      itemsPerBatch: number;
      batchIntervalMs: number;
    };
    ignoreSslIssues: boolean;
    lowercaseHeaders: boolean;
    redirects: {
      enabled: boolean;
      maxRedirects: number;
    };
    responseOptions: {
      includeHeaders: boolean;
      includeStatusCode: boolean;
      neverError: boolean;
      responseFormat: "autodetect" | "file" | "json" | "text";
      putOutputInField: string;
    };
    pagination: {
      mode: "off" | "link" | "offset" | "cursor";
      configJson: string;
    };
    proxy: string;
    timeoutMs: number;
  };
  toolOnly: {
    optimizeResponse: boolean;
    optimizeResponseType: "json" | "html" | "text";
    jsonOptimize: {
      fieldContainingData: string;
      includeFieldsMode: "all" | "selected" | "exclude";
      fieldsList: string[];
    };
    htmlOptimize: {
      selectorCss: string;
      returnOnlyContent: boolean;
      elementsToOmit: string;
      truncateResponse: boolean;
      maxResponseCharacters: number;
    };
    textOptimize: {
      truncateResponse: boolean;
      maxResponseCharacters: number;
    };
  };
};

export type GoogleSheetsAuthType = "oauth" | "serviceAccount";
export type GoogleSheetsResource = "document" | "sheet";
export type GoogleSheetsDocumentOperation = "createDocument" | "deleteDocument";
export type GoogleSheetsSheetOperation =
  | "appendRow"
  | "upsertRow"
  | "updateRow"
  | "getRows"
  | "clear"
  | "createSheet"
  | "deleteSheet"
  | "deleteRowsOrColumns";

export type GoogleSheetsToolConfig = {
  meta: {
    toolName: string;
    toolDescription?: string;
    enabled: boolean;
  };
  auth: {
    authType: GoogleSheetsAuthType;
    credentialRef?: {
      credentialId: string;
    };
    inlineAuth?: {
      oauth?: {
        clientId?: string;
        clientSecret?: string;
        accessToken?: string;
        refreshToken?: string;
      };
      serviceAccount?: {
        email: string;
        privateKey: string;
        impersonateUserEmail?: string;
      };
    };
  };
  resource: GoogleSheetsResource;
  operation: GoogleSheetsDocumentOperation | GoogleSheetsSheetOperation;
  selectors: {
    documentSelectMode: "fromList" | "byUrl" | "byId";
    documentUrl?: FieldValue;
    spreadsheetId?: FieldValue;
    sheetSelectMode?: "fromList" | "byUrl" | "byId" | "byName";
    sheetUrl?: FieldValue;
    sheetId?: FieldValue;
    sheetName?: FieldValue;
  };
  params: {
    document: {
      createDocument: {
        title: FieldValue;
        sheets: FieldValue[];
        options: {
          locale?: FieldValue;
          recalculationInterval?: "onChange" | "minute" | "hour";
        };
      };
      deleteDocument: Record<string, never>;
    };
    sheet: {
      appendRow: {
        mappingMode: "auto" | "manual";
        dataAuto: FieldValue;
        dataManual: Array<{ column: FieldValue; value: FieldValue }>;
        options: {
          cellFormat?: "googleDefault" | "systemFormat";
          dataLocation: {
            headerRow?: FieldValue;
            firstDataRow?: FieldValue;
          };
          extraFieldsHandling?: "insertNewColumns" | "ignore" | "error";
          useAppendEndpoint?: boolean;
        };
      };
      upsertRow: {
        mappingMode: "auto" | "manual";
        dataAuto: FieldValue;
        dataManual: Array<{ column: FieldValue; value: FieldValue }>;
        options: {
          cellFormat?: "googleDefault" | "systemFormat";
          dataLocation: {
            headerRow?: FieldValue;
            firstDataRow?: FieldValue;
          };
          extraFieldsHandling?: "insertNewColumns" | "ignore" | "error";
          useAppendEndpoint?: boolean;
        };
        match: {
          matchColumn: FieldValue;
          matchValue: FieldValue;
        };
        whenMultipleMatches: "first" | "all" | "error";
      };
      updateRow: {
        rowNumber: FieldValue;
        mappingMode: "auto" | "manual";
        dataAuto: FieldValue;
        dataManual: Array<{ column: FieldValue; value: FieldValue }>;
        options: {
          cellFormat?: "googleDefault" | "systemFormat";
          dataLocation: {
            headerRow?: FieldValue;
            firstDataRow?: FieldValue;
          };
          extraFieldsHandling?: "insertNewColumns" | "ignore" | "error";
          useAppendEndpoint?: boolean;
        };
      };
      getRows: {
        filter: {
          column?: FieldValue;
          value?: FieldValue;
        };
        options: {
          dataLocation: {
            headerRow?: FieldValue;
            firstDataRow?: FieldValue;
          };
          outputFormatting: {
            general?: "unformatted" | "formatted" | "formulas";
            date?: "text" | "serialNumber";
          };
          multipleMatches?: "first" | "all";
        };
      };
      clear: {
        clearMode:
          | "wholeSheet"
          | "specificRows"
          | "specificColumns"
          | "specificRange";
        wholeSheet: {
          keepFirstRow?: boolean;
        };
        specificRows: {
          startRow: FieldValue;
          count: FieldValue;
        };
        specificColumns: {
          startColumn: FieldValue;
          count: FieldValue;
        };
        specificRange: {
          a1Range: FieldValue;
        };
      };
      createSheet: {
        title: FieldValue;
        options: {
          hidden?: boolean;
          rightToLeft?: boolean;
          sheetId?: FieldValue;
          sheetIndex?: FieldValue;
          tabColorHex?: FieldValue;
        };
      };
      deleteSheet: Record<string, never>;
      deleteRowsOrColumns: {
        deleteType: "rows" | "columns";
        startRow?: FieldValue;
        startColumn?: FieldValue;
        count: FieldValue;
      };
    };
  };
};

export type ToolNodeConfig = {
  toolId: string;
  toolName: string;
  httpRequest?: HttpRequestToolConfig;
  googleSheets?: GoogleSheetsToolConfig;
};

export type NodeConfig =
  | TextNodeConfig
  | TgBotNodeConfig
  | RelDbNodeConfig
  | LlmNodeConfig
  | AgentNodeConfig
  | ToolNodeConfig;

export type DefinitionNodeBase = {
  id: string;
  name: string;
  enabled: boolean;
  meta?: NodeMeta;
};

export type TextDefinitionNode = DefinitionNodeBase & {
  kind: "text";
  config: TextNodeConfig;
};

export type TgBotDefinitionNode = DefinitionNodeBase & {
  kind: "tgBot";
  config: TgBotNodeConfig;
};

export type RelDbDefinitionNode = DefinitionNodeBase & {
  kind: "relDb";
  config: RelDbNodeConfig;
};

export type LlmDefinitionNode = DefinitionNodeBase & {
  kind: "llm";
  config: LlmNodeConfig;
};

export type AgentDefinitionNode = DefinitionNodeBase & {
  kind: "agent";
  config: AgentNodeConfig;
};

export type ToolDefinitionNode = DefinitionNodeBase & {
  kind: "tool";
  config: ToolNodeConfig;
};

export type DefinitionNode =
  | TextDefinitionNode
  | TgBotDefinitionNode
  | RelDbDefinitionNode
  | LlmDefinitionNode
  | AgentDefinitionNode
  | ToolDefinitionNode;

export type DefinitionEdge = {
  id: string;
  source: {
    nodeId: string;
    portId?: string;
  };
  target: {
    nodeId: string;
    portId?: string;
  };
  enabled?: boolean;
  meta?: Record<string, unknown>;
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  version: string;
  nodes: DefinitionNode[];
  edges: DefinitionEdge[];
};

export type EditorLayout = {
  nodeLayouts: Record<
    string,
    {
      x: number;
      y: number;
      w?: number;
      h?: number;
    }
  >;
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
  ui?: {
    inspectorWidth?: number;
    inspectorOpen?: boolean;
  };
};

export function isNodeKind(value: string): value is NodeKind {
  return (
    value === "text" ||
    value === "tgBot" ||
    value === "relDb" ||
    value === "llm" ||
    value === "agent" ||
    value === "tool"
  );
}
