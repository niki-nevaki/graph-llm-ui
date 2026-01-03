import AndroidIcon from "@mui/icons-material/Android";
import BuildIcon from "@mui/icons-material/Build";
import ForumIcon from "@mui/icons-material/Forum";
import PsychologyIcon from "@mui/icons-material/Psychology";
import StorageIcon from "@mui/icons-material/Storage";
import TelegramIcon from "@mui/icons-material/Telegram";
import type { ComponentType } from "react";
import { Position } from "@xyflow/react";

import type { NodeKind } from "../../../../domain/workflow";

export type NodeSpec = {
  kind: NodeKind;
  title: string;
  group: "Входы" | "Интеграции" | "Данные" | "ИИ" | "Инструменты";
  Icon: ComponentType<{ fontSize?: "small" | "medium" | "large" }>;
  inLabel: string;
  outLabel: string;
  toolHandle?: {
    label: string;
    position: Position;
    offsetPercent: number;
  };
};

export const NODE_SPECS: Record<NodeKind, NodeSpec> = {
  text: {
    kind: "text",
    title: "Текст",
    group: "Входы",
    Icon: ForumIcon,
    inLabel: "вход",
    outLabel: "текст",
  },
  tgBot: {
    kind: "tgBot",
    title: "Телеграм-бот",
    group: "Интеграции",
    Icon: TelegramIcon,
    inLabel: "сообщение",
    outLabel: "статус",
  },
  relDb: {
    kind: "relDb",
    title: "Реляционная БД",
    group: "Данные",
    Icon: StorageIcon,
    inLabel: "запрос",
    outLabel: "строки",
  },
  llm: {
    kind: "llm",
    title: "Языковая модель",
    group: "ИИ",
    Icon: PsychologyIcon,
    inLabel: "промпт",
    outLabel: "текст",
  },
  agent: {
    kind: "agent",
    title: "Агент",
    group: "ИИ",
    Icon: AndroidIcon,
    inLabel: "вход",
    outLabel: "выход",
    toolHandle: {
      label: "инстр.",
      position: Position.Bottom,
      offsetPercent: 50,
    },
  },
  tool: {
    kind: "tool",
    title: "Инструмент",
    group: "Инструменты",
    Icon: BuildIcon,
    inLabel: "вход",
    outLabel: "инстр.",
  },
};
