import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import StopIcon from "@mui/icons-material/Stop";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Edge, Node } from "@xyflow/react";
import { useMemo, useState, useEffect } from "react";

import type { DefinitionNode } from "../../../domain/workflow";
import type { GraphRunState, Issue } from "../model/runtime";
import { useMotion } from "../../../app/providers/MotionProvider";

const STATUS_LABELS: Record<GraphRunState, string> = {
  idle: "Ожидание",
  validating: "Проверка",
  ready: "Готово",
  running: "Выполнение",
  succeeded: "Успешно",
  failed_compile: "Ошибка проверки",
  failed_runtime: "Ошибка выполнения",
  cancelled: "Отменено",
};

const FIELD_LABELS: Record<string, string> = {
  name: "Название",
  "meta.description": "Описание",
  "config.text": "Текст",
  "config.fileName": "Имя файла",
  "config.token": "Токен бота",
  "config.chatId": "ID чата",
  "config.host": "Хост",
  "config.database": "База данных",
  "config.table": "Таблица",
  "config.apiKey": "API-ключ",
  "config.model": "Модель",
  "config.system_prompt": "Системный промпт",
  "config.toolName": "Инструмент",
  "config.httpRequest.base.method": "Метод",
  "config.httpRequest.base.url": "URL",
  "config.googleSheets.resource": "Ресурс",
  "config.googleSheets.operation": "Операция",
  "config.googleSheets.selectors.documentUrl": "URL документа",
  "config.googleSheets.selectors.spreadsheetId": "ID документа",
  "config.googleSheets.selectors.sheetUrl": "URL листа",
  "config.googleSheets.selectors.sheetId": "ID листа",
  "config.googleSheets.selectors.sheetName": "Имя листа",
};

const SECRET_FIELD_PARTS = [
  "password",
  "token",
  "apikey",
  "secret",
  "privatekey",
];

const isSecretFieldPath = (fieldPath: string) =>
  SECRET_FIELD_PARTS.some((part) =>
    fieldPath.toLowerCase().includes(part)
  );

const getValueByPath = (obj: unknown, path: string): unknown => {
  return path.split(".").reduce((acc: any, key) => acc?.[key], obj as any);
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return "пусто";
  if (typeof value === "string") return value.trim() ? value : "пусто";
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? "пусто" : `список (${value.length})`;
  }
  if (typeof value === "object") {
    const mode = (value as any).mode;
    if (mode === "expression") {
      return (value as any).expression?.trim()
        ? `выражение: ${(value as any).expression}`
        : "пусто";
    }
    if (mode === "fromAI") {
      const hint =
        (value as any).fromAI?.key ||
        (value as any).fromAI?.description ||
        (value as any).fromAI?.hint;
      return hint ? `AI: ${hint}` : "пусто";
    }
    if (mode === "fixed") {
      const raw = (value as any).value ?? "";
      return String(raw).trim() ? String(raw) : "пусто";
    }
  }
  return "пусто";
};

type Props = {
  open: boolean;
  status: GraphRunState;
  issues: Issue[];
  errorsCount: number;
  warningsCount: number;
  missingRequired: number;
  selectedNodeId: string | null;
  nodes: Array<Node<DefinitionNode>>;
  edges: Edge[];
  onToggleOpen: () => void;
  onStop: () => void;
  onSelectIssue: (issue: Issue) => void;
};

export function IssuesPanel({
  open,
  status,
  issues,
  errorsCount,
  warningsCount,
  missingRequired,
  selectedNodeId,
  nodes,
  edges,
  onToggleOpen,
  onStop,
  onSelectIssue,
}: Props) {
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState("");
  const [onlySelected, setOnlySelected] = useState(false);
  const { reducedMotion } = useMotion();
  const [pulseErrors, setPulseErrors] = useState(false);

  useEffect(() => {
    if (errorsCount > 0 && !reducedMotion) {
      setPulseErrors(true);
      const timeout = window.setTimeout(() => setPulseErrors(false), 1200);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [errorsCount, reducedMotion]);

  useEffect(() => {
    if (!selectedNodeId && onlySelected) {
      setOnlySelected(false);
    }
  }, [onlySelected, selectedNodeId]);

  const nodeMap = useMemo(() => {
    return new Map(nodes.map((node) => [node.id, node]));
  }, [nodes]);

  const edgeMap = useMemo(() => {
    return new Map(edges.map((edge) => [edge.id, edge]));
  }, [edges]);

  const filteredIssues = useMemo(() => {
    const base = issues.filter((issue) => {
      if (tab === 0 && issue.severity !== "error") return false;
      if (tab === 1 && issue.severity !== "warning") return false;
      if (tab === 2) return false;
      if (onlySelected && selectedNodeId) {
        return issue.nodeId === selectedNodeId;
      }
      if (!query.trim()) return true;
      const nodeName = issue.nodeId
        ? nodeMap.get(issue.nodeId)?.data.name ?? ""
        : "";
      return (
        issue.message.toLowerCase().includes(query.toLowerCase()) ||
        nodeName.toLowerCase().includes(query.toLowerCase())
      );
    });

    return base.sort((a, b) => {
      const nodeA = a.nodeId ? nodeMap.get(a.nodeId)?.data.name ?? "" : "";
      const nodeB = b.nodeId ? nodeMap.get(b.nodeId)?.data.name ?? "" : "";
      return nodeA.localeCompare(nodeB);
    });
  }, [issues, tab, onlySelected, selectedNodeId, query, nodeMap]);

  const groupedIssues = useMemo(() => {
    const items: Array<
      | { type: "header"; label: string }
      | { type: "issue"; issue: Issue }
    > = [];
    let lastGroup = "";
    filteredIssues.forEach((issue) => {
      const nodeLabel = issue.nodeId
        ? nodeMap.get(issue.nodeId)?.data.name ?? issue.nodeId
        : "Граф";
      if (nodeLabel !== lastGroup) {
        items.push({ type: "header", label: nodeLabel });
        lastGroup = nodeLabel;
      }
      items.push({ type: "issue", issue });
    });
    return items;
  }, [filteredIssues, nodeMap]);

  const isRunning = status === "running" || status === "validating";
  const collapsedHeight = 44;
  const expandedHeight = 320;

  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        height: open ? expandedHeight : collapsedHeight,
        transition:
          "height var(--motion-duration-base) var(--motion-ease-standard)",
        position: "relative",
        boxShadow: "0 -8px 20px rgba(0,0,0,0.06)",
        ...(errorsCount > 0
          ? {
              borderTopColor: "error.main",
              boxShadow: "0 -2px 0 rgba(211,47,47,0.7)",
            }
          : {}),
      }}
    >
      <Box
        onClick={onToggleOpen}
        sx={{
          px: 2,
          height: collapsedHeight,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          cursor: "pointer",
          borderBottom: open ? 1 : 0,
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle2">{STATUS_LABELS[status]}</Typography>
        {isRunning ? (
          <CircularProgress size={14} sx={{ color: "text.secondary" }} />
        ) : null}

        <Box
          className={pulseErrors ? "error-badge-pulse" : undefined}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: 99,
            bgcolor: errorsCount > 0 ? "error.main" : "action.hover",
            color: errorsCount > 0 ? "#fff" : "text.secondary",
            border: errorsCount > 0 ? "1px solid rgba(0,0,0,0.2)" : "none",
            fontSize: 12,
            fontWeight: 600,
            minWidth: 42,
            justifyContent: "center",
          }}
        >
          <ErrorOutlineIcon fontSize="inherit" />
          {errorsCount}
        </Box>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 0.75,
            py: 0.2,
            borderRadius: 99,
            bgcolor: warningsCount > 0 ? "warning.main" : "action.hover",
            color: warningsCount > 0 ? "#fff" : "text.secondary",
            fontSize: 11,
            fontWeight: 500,
            minWidth: 34,
            justifyContent: "center",
          }}
        >
          <WarningAmberIcon fontSize="inherit" />
          {warningsCount}
        </Box>

        {missingRequired > 0 ? (
          <Typography variant="caption" color="text.secondary">
            Пустые обязательные: {missingRequired}
          </Typography>
        ) : null}

        <Box sx={{ flex: 1 }} />

        {isRunning ? (
          <Tooltip title="Остановить">
            <IconButton
              size="small"
              color="error"
              onClick={(event) => {
                event.stopPropagation();
                onStop();
              }}
            >
              <StopIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}

        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            onToggleOpen();
          }}
        >
          {open ? (
            <ExpandMoreIcon fontSize="small" />
          ) : (
            <ExpandLessIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      {open ? (
        <>
          <Box sx={{ px: 2, pt: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TextField
                size="small"
                placeholder="Поиск по проблемам"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="caption">Только выбранная</Typography>
                <Switch
                  size="small"
                  checked={onlySelected}
                  onChange={(e) => setOnlySelected(e.target.checked)}
                  disabled={!selectedNodeId}
                />
              </Stack>
              <IconButton size="small" onClick={onToggleOpen}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          <Tabs
            value={tab}
            onChange={(_, next) => setTab(next)}
            variant="fullWidth"
            sx={{ px: 1 }}
          >
            <Tab label={`Ошибки (${errorsCount})`} />
            <Tab label={`Предупреждения (${warningsCount})`} />
            <Tab label="Логи" />
          </Tabs>

          <Divider />

          <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            {tab === 2 ? (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Логи выполнения появятся после запуска.
                </Typography>
              </Box>
            ) : groupedIssues.length === 0 ? (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Здесь появятся проблемы по мере проверки графа.
                </Typography>
              </Box>
            ) : (
              <List dense disablePadding>
                {groupedIssues.map((item, index) => {
                  if (item.type === "header") {
                    return (
                      <ListItem
                        key={`group-${index}`}
                        sx={{ bgcolor: "action.hover" }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                      </ListItem>
                    );
                  }

                  const issue = item.issue;
                  const node = issue.nodeId ? nodeMap.get(issue.nodeId) : undefined;
                  const edge = issue.edgeId ? edgeMap.get(issue.edgeId) : undefined;
                  const fieldLabel = issue.fieldPath
                    ? FIELD_LABELS[issue.fieldPath] ?? issue.fieldPath
                    : undefined;
                  const fieldValue = issue.fieldPath && node
                    ? getValueByPath(node.data, issue.fieldPath)
                    : undefined;
                  const isSecret = issue.fieldPath
                    ? isSecretFieldPath(issue.fieldPath)
                    : false;
                  const valueLabel = issue.fieldPath
                    ? isSecret
                      ? fieldValue
                        ? "(скрыто)"
                        : "(не задано)"
                      : formatValue(fieldValue)
                    : undefined;
                  const edgeContext =
                    edge && nodeMap.get(edge.source) && nodeMap.get(edge.target)
                      ? `${nodeMap.get(edge.source)?.data.name ?? edge.source} -> ${
                          nodeMap.get(edge.target)?.data.name ?? edge.target
                        }`
                      : undefined;
                  const edgePorts =
                    edge && (edge.sourceHandle || edge.targetHandle)
                      ? `${edge.sourceHandle ?? "out"} -> ${
                          edge.targetHandle ?? "in"
                        }`
                      : undefined;

                  return (
                    <ListItem key={issue.id} divider>
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            {issue.severity === "error" ? (
                              <ErrorOutlineIcon color="error" fontSize="small" />
                            ) : (
                              <WarningAmberIcon color="warning" fontSize="small" />
                            )}
                            {issue.details || issue.fixHint ? (
                              <Tooltip
                                title={issue.details ?? issue.fixHint ?? ""}
                                arrow
                              >
                                <Typography variant="body2">
                                  {issue.message}
                                </Typography>
                              </Tooltip>
                            ) : (
                              <Typography variant="body2">
                                {issue.message}
                              </Typography>
                            )}
                          </Stack>
                        }
                        secondary={
                          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                            {fieldLabel ? (
                              <Typography variant="caption" color="text.secondary">
                                Поле: {fieldLabel} - {valueLabel}
                              </Typography>
                            ) : null}
                            {edgeContext ? (
                              <Typography variant="caption" color="text.secondary">
                                Связь: {edgeContext}
                                {edgePorts ? ` (${edgePorts})` : ""}
                              </Typography>
                            ) : null}
                            {issue.fixHint ? (
                              <Typography variant="caption" color="text.secondary">
                                {issue.fixHint}
                              </Typography>
                            ) : null}
                          </Stack>
                        }
                      />
                      <Box sx={{ ml: 2, flexShrink: 0 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onSelectIssue(issue)}
                        >
                          Перейти
                        </Button>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </>
      ) : null}
    </Box>
  );
}
