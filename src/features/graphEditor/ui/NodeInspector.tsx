import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
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

import { AgentNodeSettingsForm } from "./forms/AgentNodeSettingsForm";
import { LlmNodeSettingsForm } from "./forms/LlmNodeSettingsForm";
import { RelDbNodeSettingsForm } from "./forms/RelDbNodeSettingsForm";
import { TextNodeSettingsForm } from "./forms/TextNodeSettingsForm";
import { TgBotNodeSettingsForm } from "./forms/TgBotNodeSettingsForm";
import { ToolNodeSettingsForm } from "./forms/ToolNodeSettingsForm";

type Props = {
  open: boolean;
  width: number;
  minWidth?: number;
  maxWidth?: number;

  selectedNode: { id: string; data: DefinitionNode } | null;
  draftActions?: {
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
  };

  onClose: () => void;
  onUpdate: (nodeId: string, nextData: DefinitionNode) => void;
  onWidthChange: (w: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function TabPanel(props: {
  value: number;
  index: number;
  children: React.ReactNode;
}) {
  if (props.value !== props.index) return null;
  return <Box sx={{ pt: 1.5 }}>{props.children}</Box>;
}

export function NodeInspector({
  open,
  width,
  minWidth = 520,
  maxWidth = 1400,

  selectedNode,
  draftActions,

  onClose,
  onUpdate,
  onWidthChange,
}: Props) {
  // Tabs: 0=General(+Settings), 1=JSON
  const [tab, setTab] = useState(0);

  // Reset tab when selection changes
  useEffect(() => {
    setTab(0);
  }, [selectedNode?.id]);

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

  // hooks already called — safe to return
  if (!open) return null;

  // One clean border (no duplicate). Resizer is overlay (no layout gap).
  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        width,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderLeft: 1,
        borderColor: "divider",
        boxShadow: "-12px 0 24px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Resizer overlay: NO second line, just hit-area */}
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

      {/* If nothing selected */}
      {!selectedNode ? (
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
                onChange={(_, v2) => setTab(v2)}
                variant="fullWidth"
                sx={{ px: 1, borderBottom: 1, borderColor: "divider" }}
              >
                <Tab label="Общее" />
                <Tab label="JSON" />
              </Tabs>

              {/* Body scroll ONLY inside panel */}
              <Box
                sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 2.5, py: 2 }}
              >
                <TabPanel value={tab} index={0}>
                  <Stack spacing={1.25}>
                    {/* General */}
                    <TextField
                      label="Название"
                      size="medium"
                      value={data.name}
                      onChange={(e) => update({ name: e.target.value })}
                      fullWidth
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
                      />
                      {draftActions ? (
                        <Stack direction="row" spacing={1} sx={{ pt: 2 }}>
                          <Button
                            variant="contained"
                            onClick={draftActions.onConfirm}
                          >
                            {draftActions.confirmLabel}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={draftActions.onCancel}
                          >
                            Отмена
                          </Button>
                        </Stack>
                      ) : null}
                    </Box>
                  </Stack>
                </TabPanel>

                <TabPanel value={tab} index={1}>
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
}) {
  const { data, updateConfig } = props;

  switch (data.kind) {
    case "text":
      return (
        <TextNodeSettingsForm
          data={data as TextDefinitionNode}
          onChange={updateConfig}
        />
      );
    case "tgBot":
      return (
        <TgBotNodeSettingsForm
          data={data as TgBotDefinitionNode}
          onChange={updateConfig}
        />
      );
    case "relDb":
      return (
        <RelDbNodeSettingsForm
          data={data as RelDbDefinitionNode}
          onChange={updateConfig}
        />
      );
    case "llm":
      return (
        <LlmNodeSettingsForm
          data={data as LlmDefinitionNode}
          onChange={updateConfig}
        />
      );
    case "agent":
      return (
        <AgentNodeSettingsForm
          data={data as AgentDefinitionNode}
          onChange={updateConfig}
        />
      );
    case "tool":
      return (
        <ToolNodeSettingsForm
          data={data as ToolDefinitionNode}
          onChange={updateConfig}
        />
      );
  }
}
