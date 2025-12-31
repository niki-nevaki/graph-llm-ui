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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { validateNode } from "../../../types/types";
import { NODE_SPECS } from "./nodes/nodeSpecs";

import type {
  AgentNodeData,
  AppNodeData,
  LlmNodeData,
  RelDbNodeData,
  TextNodeData,
  TgBotNodeData,
} from "../../../types/types";

import { AgentNodeSettingsForm } from "./forms/AgentNodeSettingsForm";
import { LlmNodeSettingsForm } from "./forms/LlmNodeSettingsForm";
import { RelDbNodeSettingsForm } from "./forms/RelDbNodeSettingsForm";
import { TextNodeSettingsForm } from "./forms/TextNodeSettingsForm";
import { TgBotNodeSettingsForm } from "./forms/TgBotNodeSettingsForm";

type Props = {
  open: boolean;
  width: number;
  minWidth?: number;
  maxWidth?: number;

  selectedNode: { id: string; data: AppNodeData } | null;
  allNodes: Array<{ id: string; data: AppNodeData }>;

  onClose: () => void;
  onUpdate: (nodeId: string, nextData: AppNodeData) => void;
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
  allNodes,

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

  // Build LLM node list for Agent form
  const llmOptions = useMemo(
    () =>
      allNodes
        .filter((n) => n.data.kind === "llm")
        .map((n) => ({ id: n.id, name: n.data.name })),
    [allNodes]
  );

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
        title="Drag to resize"
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
            Select a node to edit
          </Typography>
        </Box>
      ) : (
        (() => {
          const { id, data } = selectedNode;
          const spec = NODE_SPECS[data.kind];
          const Icon = spec.Icon;
          const v = validateNode(data);

          const update = (patch: Partial<AppNodeData>) => {
            onUpdate(id, { ...data, ...patch } as AppNodeData);
          };

          const updateConfig = (patch: Partial<AppNodeData["config"]>) => {
            onUpdate(id, {
              ...data,
              config: { ...data.config, ...patch },
            } as AppNodeData);
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
                    {v.ok ? "Configured" : `Issues: ${v.issues.length}`}
                  </Typography>
                </Box>

                <IconButton
                  size="medium"
                  onClick={onClose}
                  aria-label="Close inspector"
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
                <Tab label="General" />
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
                      label="Name"
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
                      label="Enabled"
                    />

                    <TextField
                      label="Description"
                      size="medium"
                      value={data.description ?? ""}
                      onChange={(e) => update({ description: e.target.value })}
                      fullWidth
                      multiline
                      minRows={3}
                    />

                    {/* Settings section inside General */}
                    <Box sx={{ pt: 0.5 }}>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Settings
                      </Typography>

                      <SettingsForm
                        data={data}
                        llmOptions={llmOptions}
                        updateConfig={updateConfig}
                      />
                    </Box>
                  </Stack>
                </TabPanel>

                <TabPanel value={tab} index={1}>
                  <TextField
                    label="Node data (read-only)"
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
  data: AppNodeData;
  llmOptions: Array<{ id: string; name: string }>;
  updateConfig: (patch: any) => void;
}) {
  const { data, llmOptions, updateConfig } = props;

  switch (data.kind) {
    case "text":
      return (
        <TextNodeSettingsForm
          data={data as TextNodeData}
          onChange={updateConfig}
        />
      );
    case "tgBot":
      return (
        <TgBotNodeSettingsForm
          data={data as TgBotNodeData}
          onChange={updateConfig}
        />
      );
    case "relDb":
      return (
        <RelDbNodeSettingsForm
          data={data as RelDbNodeData}
          onChange={updateConfig}
        />
      );
    case "llm":
      return (
        <LlmNodeSettingsForm
          data={data as LlmNodeData}
          onChange={updateConfig}
        />
      );
    case "agent":
      return (
        <AgentNodeSettingsForm
          data={data as AgentNodeData}
          llmOptions={llmOptions}
          onChange={updateConfig}
        />
      );
  }
}
