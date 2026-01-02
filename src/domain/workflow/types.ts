export type NodeKind = "text" | "tgBot" | "relDb" | "llm" | "agent";

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
  sql?: string;
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
  tools: string[];
  use_memory: boolean;
};

export type NodeConfig =
  | TextNodeConfig
  | TgBotNodeConfig
  | RelDbNodeConfig
  | LlmNodeConfig
  | AgentNodeConfig;

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

export type DefinitionNode =
  | TextDefinitionNode
  | TgBotDefinitionNode
  | RelDbDefinitionNode
  | LlmDefinitionNode
  | AgentDefinitionNode;

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
    value === "agent"
  );
}
