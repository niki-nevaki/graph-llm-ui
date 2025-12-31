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

import { NODE_SPECS } from "../flow/nodeSpecs";
import { validateNode } from "../types/types";

import type {
  AgentNodeData,
  AppNodeData,
  LlmNodeData,
  RelDbNodeData,
  TextNodeData,
  TgBotNodeData,
} from "../types/types";

// отдельные формы
import { AgentNodeSettingsForm } from "./nodeSettings/AgentNodeSettingsForm";
import { LlmNodeSettingsForm } from "./nodeSettings/LlmNodeSettingsForm";
import { RelDbNodeSettingsForm } from "./nodeSettings/RelDbNodeSettingsForm";
import { TextNodeSettingsForm } from "./nodeSettings/TextNodeSettingsForm";
import { TgBotNodeSettingsForm } from "./nodeSettings/TgBotNodeSettingsForm";

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
  minWidth = 420,
  maxWidth = 1200,
  selectedNode,
  allNodes,
  onClose,
  onUpdate,
  onWidthChange,
}: Props) {
  const [tab, setTab] = useState(0);

  // reset tab when selection changes
  useEffect(() => {
    setTab(0);
  }, [selectedNode?.id]);

  // llm options for Agent form
  const llmOptions = useMemo(
    () =>
      allNodes
        .filter((n) => n.data.kind === "llm")
        .map((n) => ({ id: n.id, name: n.data.name })),
    [allNodes]
  );

  // ---- resize logic ----
  const startXRef = useRef(0);
  const startWRef = useRef(0);
  const draggingRef = useRef(false);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingRef.current) return;
      // drag left edge: move mouse left -> wider
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

  // IMPORTANT: хуки уже вызваны, теперь можно выйти
  if (!open) return null;

  // если открыто, но ничего не выбрано (на будущее) — покажем пустое состояние
  if (!selectedNode) {
    return (
      <Box
        sx={{
          height: "100%",
          width,
          borderLeft: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.04), -12px 0 24px rgba(0,0,0,0.08)",
          display: "flex",
        }}
      >
        <Box
          onMouseDown={startDrag}
          sx={{
            width: 12,
            cursor: "col-resize",
            flex: "0 0 auto",
            position: "relative",
            "&:hover": { bgcolor: "action.hover" },
            "&:after": {
              content: '""',
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              width: "2px",
              transform: "translateX(-50%)",
              bgcolor: "divider",
            },
          }}
          title="Drag to resize"
        />
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            p: 2,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Select a node to edit
          </Typography>
        </Box>
      </Box>
    );
  }

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
    <Box
      sx={{
        height: "100%",
        width,
        display: "flex",
        bgcolor: "background.paper",
        borderLeft: 1,
        borderColor: "divider",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.04), -12px 0 24px rgba(0,0,0,0.08)",
      }}
    >
      {/* resizer / divider */}
      <Box
        onMouseDown={startDrag}
        sx={{
          width: 12,
          cursor: "col-resize",
          flex: "0 0 auto",
          position: "relative",
          "&:hover": { bgcolor: "action.hover" },
          "&:after": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            width: "2px",
            transform: "translateX(-50%)",
            bgcolor: "divider",
          },
        }}
        title="Drag to resize"
      />

      {/* content */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5 }}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "action.hover",
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
            size="small"
            onClick={onClose}
            aria-label="Close inspector"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        <Tabs value={tab} onChange={(_, v2) => setTab(v2)} variant="fullWidth">
          <Tab label="General" />
          <Tab label="Settings" />
          <Tab label="JSON" />
        </Tabs>

        <Divider />

        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 2 }}>
          <TabPanel value={tab} index={0}>
            <Stack spacing={1.25}>
              <TextField
                label="Name"
                size="small"
                value={data.name}
                onChange={(e) => update({ name: e.target.value })}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={data.enabled}
                    onChange={(e) => update({ enabled: e.target.checked })}
                  />
                }
                label="Enabled"
              />

              <TextField
                label="Description"
                size="small"
                value={data.description ?? ""}
                onChange={(e) => update({ description: e.target.value })}
                fullWidth
                multiline
                minRows={3}
              />
            </Stack>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <SettingsForm
              data={data}
              llmOptions={llmOptions}
              updateConfig={updateConfig}
            />
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <TextField
              label="Node data (read-only)"
              size="small"
              fullWidth
              multiline
              minRows={22}
              value={JSON.stringify(data, null, 2)}
              inputProps={{
                readOnly: true,
                style: {
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                },
              }}
            />
          </TabPanel>
        </Box>
      </Box>
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
