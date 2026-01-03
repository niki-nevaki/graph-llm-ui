import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import { validateNode } from "../../../domain/workflow";
import { NODE_SPECS } from "./nodes/nodeSpecs";

import type {
  AgentDefinitionNode,
  DefinitionNode,
  LlmDefinitionNode,
  RelDbDefinitionNode,
  TextDefinitionNode,
  TgBotDefinitionNode,
  ToolDefinitionNode,
} from "../../../domain/workflow";
import type { Issue } from "../model/runtime";
import type { Execution, NodeRun } from "../model/executionState";

import { AgentNodeSettingsForm } from "./forms/AgentNodeSettingsForm";
import { LlmNodeSettingsForm } from "./forms/LlmNodeSettingsForm";
import { RelDbNodeSettingsForm } from "./forms/RelDbNodeSettingsForm";
import { TextNodeSettingsForm } from "./forms/TextNodeSettingsForm";
import { TgBotNodeSettingsForm } from "./forms/TgBotNodeSettingsForm";
import { ToolNodeSettingsForm } from "./forms/ToolNodeSettingsForm";
import { ToolPickerForm } from "./forms/ToolPickerForm";
import type { ToolOption } from "../model/toolOptions";

type Props = {
  open: boolean;
  width: number;
  minWidth?: number;
  maxWidth?: number;

  selectedNode: { id: string; data: DefinitionNode } | null;
  activeTabId?: "general" | "json" | "output";
  execution?: Execution | null;
  nodeRun?: NodeRun | null;
  focusFieldPath?: string | null;
  fieldIssueMap?: Record<string, Issue>;
  showFieldIssues?: boolean;
  toolDraft?: {
    onSelect: (option: ToolOption) => void;
    onCancel: () => void;
  };

  onClose: () => void;
  onUpdate: (nodeId: string, nextData: DefinitionNode) => void;
  onTabChange?: (tabId: "general" | "json" | "output") => void;
  onWidthChange: (w: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function TabPanel(props: {
  value: number;
  index: number;
  children: React.ReactNode;
  animationKey?: string;
}) {
  if (props.value !== props.index) return null;
  return (
    <Box key={props.animationKey} className="panel-fade" sx={{ pt: 1.5 }}>
      {props.children}
    </Box>
  );
}

export function NodeInspector({
  open,
  width,
  minWidth = 520,
  maxWidth = 1400,

  selectedNode,
  activeTabId,
  execution,
  nodeRun,
  focusFieldPath,
  fieldIssueMap = {},
  showFieldIssues = false,
  toolDraft,

  onClose,
  onUpdate,
  onTabChange,
  onWidthChange,
}: Props) {
  // Tabs: 0=General(+Settings), 1=JSON
  const [tab, setTab] = useState(0);
  const lastActiveTabId = useRef<"general" | "json" | "output">("general");
  const tabIdFromIndex = (index: number) =>
    index === 2 ? "output" : index === 1 ? "json" : "general";
  const tabIndexFromId = (id: "general" | "json" | "output") =>
    id === "output" ? 2 : id === "json" ? 1 : 0;

  // Reset tab when selection changes
  useEffect(() => {
    setTab(0);
    lastActiveTabId.current = "general";
    onTabChange?.("general");
  }, [selectedNode?.id, onTabChange]);

  useEffect(() => {
    if (focusFieldPath) {
      setTab(0);
      lastActiveTabId.current = "general";
      onTabChange?.("general");
    }
  }, [focusFieldPath, onTabChange]);

  useEffect(() => {
    if (!activeTabId) return;
    if (activeTabId === lastActiveTabId.current) return;
    lastActiveTabId.current = activeTabId;
    setTab(tabIndexFromId(activeTabId));
  }, [activeTabId]);

  const getIssueForField = useCallback(
    (fieldPath: string) => {
      if (!selectedNode) return undefined;
      return fieldIssueMap[`${selectedNode.id}:${fieldPath}`];
    },
    [fieldIssueMap, selectedNode]
  );

  useEffect(() => {
    if (!focusFieldPath || !open || !selectedNode) return;
    const selector = `[data-field-path="${focusFieldPath}"]`;
    const target = document.querySelector(selector) as HTMLElement | null;
    if (!target) return;
    target.classList.add("field-focus");
    target.scrollIntoView({ block: "center", behavior: "smooth" });
    if ("focus" in target) {
      try {
        (target as HTMLInputElement).focus();
      } catch {
        // ignore focus errors
      }
    }
    const timeout = window.setTimeout(() => {
      target.classList.remove("field-focus");
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [focusFieldPath, open, selectedNode?.id, tab]);

  // ---------- Resize logic ----------
  const startXRef = useRef(0);
  const startWRef = useRef(0);
  const draggingRef = useRef(false);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingRef.current) return;
      // left edge drag: move mouse left -> wider
      const delta = startXRef.current - e.clientX;
      const next = clamp(startWRef.current + delta, minWidth, maxWidth);
      onWidthChange(next);
    },
    [maxWidth, minWidth, onWidthChange]
  );

  const stopDrag = useCallback(() => {
    draggingRef.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", stopDrag);
  }, [onMouseMove]);

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      draggingRef.current = true;
      startXRef.current = e.clientX;
      startWRef.current = width;

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", stopDrag);
      e.preventDefault();
    },
    [onMouseMove, stopDrag, width]
  );

  useEffect(() => {
    return () => stopDrag();
  }, [stopDrag]);

  const panelWidth = open ? width : 0;

  if (toolDraft && open) {
    return (
      <Box
        sx={{
          position: "relative",
          height: "100%",
          width: panelWidth,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          borderLeft: open ? 1 : 0,
          borderColor: "divider",
          boxShadow: "-12px 0 24px rgba(0,0,0,0.08)",
          overflow: "hidden",
          transition:
            "width var(--motion-duration-slow) var(--motion-ease-standard), " +
            "transform var(--motion-duration-slow) var(--motion-ease-standard), " +
            "opacity var(--motion-duration-base) var(--motion-ease-standard)",
          transform: open ? "translateX(0)" : "translateX(12px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle1">Инструменты</Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton size="medium" onClick={toolDraft.onCancel}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 2.5, py: 2 }}>
          <ToolPickerForm onSelect={toolDraft.onSelect} />
        </Box>
      </Box>
    );
  }

  // One clean border (no duplicate). Resizer is overlay (no layout gap).
  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        width: panelWidth,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderLeft: open ? 1 : 0,
        borderColor: "divider",
        boxShadow: "-12px 0 24px rgba(0,0,0,0.08)",
        overflow: "hidden",
        transition:
          "width var(--motion-duration-slow) var(--motion-ease-standard), " +
          "transform var(--motion-duration-slow) var(--motion-ease-standard), " +
          "opacity var(--motion-duration-base) var(--motion-ease-standard)",
        transform: open ? "translateX(0)" : "translateX(12px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      {open ? (
        <Box
          onMouseDown={startDrag}
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 10,
            cursor: "col-resize",
            zIndex: 20,
            "&:hover": { bgcolor: "action.hover" },
          }}
          title="Потяните для изменения размера"
        />
      ) : null}

      {/* If nothing selected */}
      {!open ? null : !selectedNode ? (
        <Box
          sx={{
            height: "100%",
            display: "grid",
            placeItems: "center",
            px: 2.5,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Выберите ноду для редактирования
          </Typography>
        </Box>
      ) : (
        (() => {
          const { id, data } = selectedNode;
          const spec = NODE_SPECS[data.kind];
          if (!spec) {
            return (
              <Box sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Неподдерживаемый тип ноды
                </Typography>
              </Box>
            );
          }
          const Icon = spec.Icon;
          const v = validateNode(data);

          const update = (patch: Partial<DefinitionNode>) => {
            onUpdate(id, { ...data, ...patch } as DefinitionNode);
          };

          const updateConfig = (patch: Partial<DefinitionNode["config"]>) => {
            onUpdate(id, {
              ...data,
              config: { ...data.config, ...patch },
            } as DefinitionNode);
          };

          const animationKey = selectedNode
            ? `${selectedNode.id}-${tab}`
            : `empty-${tab}`;

          return (
            <>
              {/* Header: borderBottom instead of extra dividers */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "action.hover",
                    flex: "0 0 auto",
                  }}
                >
                  <Icon fontSize="small" />
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle1" noWrap>
                    {data.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {spec.title} •{" "}
                    {v.ok ? "Настроено" : `Проблем: ${v.issues.length}`}
                  </Typography>
                </Box>

                <IconButton
                  size="medium"
                  onClick={onClose}
                  aria-label="Закрыть инспектор"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Tabs: only 2 now, borderBottom only */}
              <Tabs
                value={tab}
                onChange={(_, v2) => {
                  setTab(v2);
                  const nextId = tabIdFromIndex(v2);
                  lastActiveTabId.current = nextId;
                  onTabChange?.(nextId);
                }}
                variant="fullWidth"
                sx={{ px: 1, borderBottom: 1, borderColor: "divider" }}
              >
                <Tab label="Общее" />
                <Tab label="JSON" />
                <Tab label="Вывод" />
              </Tabs>

              {/* Body scroll ONLY inside panel */}
              <Box
                sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 2.5, py: 2 }}
              >
                <TabPanel value={tab} index={0} animationKey={animationKey}>
                  <Stack spacing={1.25}>
                    {/* General */}
                    <TextField
                      label="Название"
                      size="medium"
                      value={data.name}
                      onChange={(e) => update({ name: e.target.value })}
                      fullWidth
                      inputProps={{ "data-field-path": "name" }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={data.enabled}
                          onChange={(e) =>
                            update({ enabled: e.target.checked })
                          }
                        />
                      }
                      label="Включена"
                    />

                    <TextField
                      label="Описание"
                      size="medium"
                      value={data.meta?.description ?? ""}
                      onChange={(e) =>
                        update({
                          meta: {
                            ...data.meta,
                            description: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      multiline
                      minRows={3}
                      inputProps={{ "data-field-path": "meta.description" }}
                    />

                    {/* Settings section inside General */}
                    <Box sx={{ pt: 0.5 }}>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Настройки
                      </Typography>

                      <SettingsForm
                        data={data}
                        updateConfig={updateConfig}
                        getIssue={getIssueForField}
                        focusFieldPath={focusFieldPath ?? null}
                        showFieldIssues={showFieldIssues}
                      />
                    </Box>
                  </Stack>
                </TabPanel>

                <TabPanel value={tab} index={1} animationKey={animationKey}>
                  <TextField
                    label="Данные ноды (только чтение)"
                    size="medium"
                    fullWidth
                    multiline
                    minRows={24}
                    value={JSON.stringify(data, null, 2)}
                    inputProps={{
                      readOnly: true,
                      style: {
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                      },
                    }}
                  />
                </TabPanel>

                <TabPanel value={tab} index={2} animationKey={animationKey}>
                  <Stack spacing={1}>
                    {!execution ? (
                      <Typography variant="body2" color="text.secondary">
                        Запусков пока нет. Нажмите ▶ Run.
                      </Typography>
                    ) : !nodeRun ? (
                      <Typography variant="body2" color="text.secondary">
                        Нет результата для этой ноды в текущем запуске.
                      </Typography>
                    ) : nodeRun.status === "running" ? (
                      <Typography variant="body2" color="text.secondary">
                        Выполняется…
                      </Typography>
                    ) : nodeRun.error ? (
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" color="error.main">
                          Ошибка
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {nodeRun.error.message}
                        </Typography>
                        {nodeRun.error.details ? (
                          <Typography variant="body2" color="text.secondary">
                            {nodeRun.error.details}
                          </Typography>
                        ) : null}
                      </Stack>
                    ) : nodeRun.output !== undefined ? (
                      typeof nodeRun.output === "string" ? (
                        <Typography variant="body2">{nodeRun.output}</Typography>
                      ) : (
                        <Box
                          component="pre"
                          sx={{
                            bgcolor: "action.hover",
                            p: 1.5,
                            borderRadius: 1,
                            fontSize: 12,
                            overflow: "auto",
                          }}
                        >
                          {JSON.stringify(nodeRun.output, null, 2)}
                        </Box>
                      )
                    ) : nodeRun.outputSummary ? (
                      <Typography variant="body2">{nodeRun.outputSummary}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Нет результата для этой ноды в текущем запуске.
                      </Typography>
                    )}
                  </Stack>
                </TabPanel>
              </Box>
            </>
          );
        })()
      )}
    </Box>
  );
}

function SettingsForm(props: {
  data: DefinitionNode;
  updateConfig: (patch: Partial<DefinitionNode["config"]>) => void;
  getIssue: (fieldPath: string) => Issue | undefined;
  focusFieldPath: string | null;
  showFieldIssues: boolean;
}) {
  const { data, updateConfig, getIssue, focusFieldPath, showFieldIssues } = props;

  switch (data.kind) {
    case "text":
      return (
        <TextNodeSettingsForm
          data={data as TextDefinitionNode}
          onChange={updateConfig}
          getIssue={getIssue}
          focusFieldPath={focusFieldPath}
          showFieldIssues={showFieldIssues}
        />
      );
    case "tgBot":
      return (
        <TgBotNodeSettingsForm
          data={data as TgBotDefinitionNode}
          onChange={updateConfig}
          getIssue={getIssue}
          focusFieldPath={focusFieldPath}
          showFieldIssues={showFieldIssues}
        />
      );
    case "relDb":
      return (
        <RelDbNodeSettingsForm
          data={data as RelDbDefinitionNode}
          onChange={updateConfig}
          getIssue={getIssue}
          focusFieldPath={focusFieldPath}
          showFieldIssues={showFieldIssues}
        />
      );
    case "llm":
      return (
        <LlmNodeSettingsForm
          data={data as LlmDefinitionNode}
          onChange={updateConfig}
          getIssue={getIssue}
          focusFieldPath={focusFieldPath}
          showFieldIssues={showFieldIssues}
        />
      );
    case "agent":
      return (
        <AgentNodeSettingsForm
          data={data as AgentDefinitionNode}
          onChange={updateConfig}
          getIssue={getIssue}
          focusFieldPath={focusFieldPath}
          showFieldIssues={showFieldIssues}
        />
      );
    case "tool":
      return (
        <ToolNodeSettingsForm
          data={data as ToolDefinitionNode}
          onChange={updateConfig}
          getIssue={getIssue}
          focusFieldPath={focusFieldPath}
          showFieldIssues={showFieldIssues}
        />
      );
  }
}
