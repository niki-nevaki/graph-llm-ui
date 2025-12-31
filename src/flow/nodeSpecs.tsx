import PsychologyIcon from "@mui/icons-material/Psychology";
import StorageIcon from "@mui/icons-material/Storage";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import TelegramIcon from "@mui/icons-material/Telegram";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import type { ComponentType } from "react";

import type { NodeKind } from "../types/types";

export type NodeSpec = {
  kind: NodeKind;
  title: string;
  group: "Inputs" | "Integrations" | "Data" | "AI";
  Icon: ComponentType<{ fontSize?: "small" | "medium" | "large" }>;
  inLabel: string;
  outLabel: string;
};

export const NODE_SPECS: Record<NodeKind, NodeSpec> = {
  text: {
    kind: "text",
    title: "Text",
    group: "Inputs",
    Icon: TextFieldsIcon,
    inLabel: "in",
    outLabel: "text",
  },
  tgBot: {
    kind: "tgBot",
    title: "Telegram Bot",
    group: "Integrations",
    Icon: TelegramIcon,
    inLabel: "msg",
    outLabel: "status",
  },
  relDb: {
    kind: "relDb",
    title: "Relational DB",
    group: "Data",
    Icon: StorageIcon,
    inLabel: "query",
    outLabel: "rows",
  },
  llm: {
    kind: "llm",
    title: "LLM",
    group: "AI",
    Icon: PsychologyIcon,
    inLabel: "prompt",
    outLabel: "text",
  },
  agent: {
    kind: "agent",
    title: "Agent",
    group: "AI",
    Icon: SupportAgentIcon,
    inLabel: "input",
    outLabel: "output",
  },
};
