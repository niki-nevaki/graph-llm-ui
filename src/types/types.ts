export type NodeKind = "text" | "tgBot" | "relDb" | "llm" | "agent";

export type BaseNodeData = {
  kind: NodeKind;
  name: string;
  enabled: boolean;
  description?: string;
};

export type TextConfig = {
  mode: "inline" | "file";
  text: string;
  fileName: string;
};

export type TgBotConfig = {
  token: string;
  chatId: string;
  direction: "in" | "out" | "inout";
  parseMode: "plain" | "markdown" | "html";
};

export type RelDbConfig = {
  driver: "postgres" | "mysql" | "mssql" | "sqlite";
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  operation: "query" | "select" | "insert" | "update" | "delete";
  sql: string;
  table: string;
};

export type LlmConfig = {
  provider: "openai" | "anthropic" | "azure";
  apiKey: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
};

export type AgentConfig = {
  mode: "chat" | "task" | "planner";
  instructions: string;
  llmNodeId: string; // ссылкой на LLM-ноду (пока просто id)
  maxSteps: number;
};

export type TextNodeData = BaseNodeData & { kind: "text"; config: TextConfig };
export type TgBotNodeData = BaseNodeData & {
  kind: "tgBot";
  config: TgBotConfig;
};
export type RelDbNodeData = BaseNodeData & {
  kind: "relDb";
  config: RelDbConfig;
};
export type LlmNodeData = BaseNodeData & { kind: "llm"; config: LlmConfig };
export type AgentNodeData = BaseNodeData & {
  kind: "agent";
  config: AgentConfig;
};

export type AppNodeData =
  | TextNodeData
  | TgBotNodeData
  | RelDbNodeData
  | LlmNodeData
  | AgentNodeData;

export function createNodeData(kind: NodeKind): AppNodeData {
  const base: Omit<BaseNodeData, "kind"> = {
    name: kind,
    enabled: true,
    description: "",
  };

  switch (kind) {
    case "text":
      return {
        kind,
        ...base,
        name: "Text",
        config: { mode: "inline", text: "", fileName: "" },
      };
    case "tgBot":
      return {
        kind,
        ...base,
        name: "Telegram Bot",
        config: {
          token: "",
          chatId: "",
          direction: "inout",
          parseMode: "plain",
        },
      };
    case "relDb":
      return {
        kind,
        ...base,
        name: "Relational DB",
        config: {
          driver: "postgres",
          host: "",
          port: 5432,
          database: "",
          user: "",
          password: "",
          operation: "query",
          sql: "SELECT 1;",
          table: "",
        },
      };
    case "llm":
      return {
        kind,
        ...base,
        name: "LLM",
        config: {
          provider: "openai",
          apiKey: "",
          model: "gpt-4o-mini",
          systemPrompt: "",
          temperature: 0.2,
          maxTokens: 512,
        },
      };
    case "agent":
      return {
        kind,
        ...base,
        name: "Agent",
        config: { mode: "task", instructions: "", llmNodeId: "", maxSteps: 6 },
      };
  }
}

export function validateNode(data: AppNodeData): {
  ok: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  if (!data.name.trim()) issues.push("Name is empty.");

  switch (data.kind) {
    case "text":
      if (data.config.mode === "inline" && !data.config.text.trim())
        issues.push("Text is empty.");
      if (data.config.mode === "file" && !data.config.fileName.trim())
        issues.push("File name is empty.");
      break;
    case "tgBot":
      if (!data.config.token.trim()) issues.push("Telegram token is empty.");
      break;
    case "relDb":
      if (!data.config.host.trim() && data.config.driver !== "sqlite")
        issues.push("DB host is empty.");
      if (!data.config.database.trim() && data.config.driver !== "sqlite")
        issues.push("DB name is empty.");
      if (data.config.operation === "query" && !data.config.sql.trim())
        issues.push("SQL is empty.");
      if (data.config.operation !== "query" && !data.config.table.trim())
        issues.push("Table is empty.");
      break;
    case "llm":
      if (!data.config.apiKey.trim()) issues.push("LLM API key is empty.");
      if (!data.config.model.trim()) issues.push("Model is empty.");
      break;
    case "agent":
      if (!data.config.instructions.trim())
        issues.push("Agent instructions are empty.");
      break;
  }

  return { ok: issues.length === 0, issues };
}

export function isNodeKind(x: string): x is NodeKind {
  return (
    x === "text" ||
    x === "tgBot" ||
    x === "relDb" ||
    x === "llm" ||
    x === "agent"
  );
}
