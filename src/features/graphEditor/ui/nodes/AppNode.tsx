import AddIcon from "@mui/icons-material/Add";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo, useCallback, useMemo } from "react";
import { validateNode, type DefinitionNode } from "../../../../domain/workflow";
import { useGraphRuntime } from "../../model/runtimeContext";
import { NODE_SPECS } from "./nodeSpecs";

type HandleShape = "circle" | "diamond";

const handleStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  border: "none",
  background: "transparent",
  zIndex: 10,
};

const buildLeftHandleStyle = (
  offsetPercent: number,
  shape: HandleShape = "circle"
) => ({
  ...handleStyle,
  top: `${offsetPercent}%`,
  transform:
    shape === "diamond"
      ? "translate(-50%, -50%) rotate(45deg)"
      : "translate(-50%, -50%)",
});

const buildRightHandleStyle = (
  offsetPercent: number,
  shape: HandleShape = "circle"
) => ({
  ...handleStyle,
  top: `${offsetPercent}%`,
  transform:
    shape === "diamond"
      ? "translate(50%, -50%) rotate(45deg)"
      : "translate(50%, -50%)",
});

const buildBottomHandleStyle = (
  offsetPercent: number,
  shape: HandleShape = "circle"
) => ({
  ...handleStyle,
  left: `${offsetPercent}%`,
  transform:
    shape === "diamond"
      ? "translate(-50%, 50%) rotate(45deg)"
      : "translate(-50%, 50%)",
});

const TOOL_LABEL_OFFSET = 6;
const TOOL_LINE_OFFSET = 18;
const TOOL_LINE_LENGTH = 30;
const TOOL_PLUS_OFFSET = TOOL_LINE_OFFSET + TOOL_LINE_LENGTH + 12;
const TOOL_NODE_SIZE = 72;
const TOOL_ICON_SIZE = 20;
const MAIN_NODE_WIDTH = 230;
const MAIN_NODE_HEIGHT = 72;
const MAIN_ICON_BOX = 44;
const MAIN_ICON_SIZE = 40;
const MAIN_TEXT_SIZE = 16;
const TEXT_NODE_WIDTH = 140;
const TEXT_NODE_HEIGHT = 56;
const TEXT_ICON_BOX = 34;
const TEXT_ICON_SIZE = 28;
const AGENT_TOOL_OFFSET = 35;
const AGENT_MEMORY_OFFSET = 65;
const NODE_LABEL_OFFSET = 8;
const NODE_LABEL_FONT_SIZE = 14;
const NODE_LABEL_COLOR = "#fff";
const AI_LEFT_PADDING = 34;
const AI_RIGHT_PADDING = 16;

type AppNodeProps = NodeProps<DefinitionNode> & {
  onRequestToolDraft?: (agentId: string, targetHandle?: "tool" | "memory") => void;
};

export const AppNode = memo(function AppNode(props: AppNodeProps) {
  const data = props.data;
  const spec = NODE_SPECS[data.kind];
  const Icon = spec.Icon;
  const isToolNode = data.kind === "tool";
  const isTextNode = data.kind === "text";
  const isAgentNode = data.kind === "agent";
  const isAiNode = data.kind === "agent" || data.kind === "llm";
  const { nodeStatuses, nodeIssues } = useGraphRuntime();
  const runtimeStatus = nodeStatuses[props.id];
  const issues = nodeIssues[props.id] ?? [];

  const v = validateNode(data);
  const issueSeverity = useMemo<"error" | "warning" | null>(() => {
    if (issues.some((issue) => issue.severity === "error")) return "error";
    if (issues.some((issue) => issue.severity === "warning")) return "warning";
    return null;
  }, [issues]);

  const statusColor = (() => {
    if (runtimeStatus === "failed") return "error.main";
    if (runtimeStatus === "running") return "info.main";
    if (runtimeStatus === "succeeded") return "success.main";
    if (runtimeStatus === "cancelled") return "warning.main";
    if (issueSeverity === "error") return "error.main";
    if (issueSeverity === "warning") return "warning.main";
    return v.ok ? "success.main" : "error.main";
  })();

  const borderColor = issueSeverity
    ? issueSeverity === "error"
      ? "error.main"
      : "warning.main"
    : v.ok
    ? "success.main"
    : "error.main";
  const borderWidth = props.selected ? 2 : 1;

  const badgeColor = issueSeverity
    ? issueSeverity === "error"
      ? "error.main"
      : "warning.main"
    : undefined;

  const onAddTool = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      props.onRequestToolDraft?.(props.id, "tool");
    },
    [props.id, props.onRequestToolDraft]
  );

  const onAddMemory = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      props.onRequestToolDraft?.(props.id, "memory");
    },
    [props.id, props.onRequestToolDraft]
  );

  if (isToolNode) {
    return (
      <Paper
        elevation={3}
        sx={{
          position: "relative",
          width: TOOL_NODE_SIZE,
          height: TOOL_NODE_SIZE,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          border: "1px solid",
          borderColor,
          borderWidth,
          bgcolor: "background.paper",
          opacity: data.enabled ? 1 : 0.55,
          animation:
            runtimeStatus === "running" ? "node-pulse 1.4s ease-out infinite" : "none",
        }}
      >
        {badgeColor ? (
          <Box
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 16,
              height: 16,
              borderRadius: "50%",
              bgcolor: badgeColor,
              color: "#fff",
              fontSize: 10,
              display: "grid",
              placeItems: "center",
              boxShadow: 1,
            }}
          >
            !
          </Box>
        ) : null}
        {!isAiNode ? (
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              left: "50%",
              top: "100%",
              transform: `translate(-50%, ${NODE_LABEL_OFFSET}px)`,
              fontSize: NODE_LABEL_FONT_SIZE,
              letterSpacing: 0.2,
              color: NODE_LABEL_COLOR,
              userSelect: "none",
              textAlign: "center",
              minWidth: 120,
              maxWidth: 160,
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            {data.name}
          </Typography>
        ) : null}
        <Icon sx={{ fontSize: TOOL_ICON_SIZE }} />

        <Handle
          type="target"
          position={Position.Left}
          id="in"
          className="node-handle"
          style={buildLeftHandleStyle(50)}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          className="node-handle"
          style={buildRightHandleStyle(50)}
        />
      </Paper>
    );
  }

  const nodeWidth = isTextNode ? TEXT_NODE_WIDTH : MAIN_NODE_WIDTH;
  const nodeHeight = isTextNode ? TEXT_NODE_HEIGHT : MAIN_NODE_HEIGHT;
  const iconBoxSize = isTextNode ? TEXT_ICON_BOX : MAIN_ICON_BOX;
  const iconSize = isTextNode ? TEXT_ICON_SIZE : MAIN_ICON_SIZE;

  return (
    <Paper
      elevation={3}
      sx={{
        position: "relative",
        width: nodeWidth,
        minHeight: nodeHeight,
        borderRadius: 2,
        overflow: "visible",
        border: "1px solid",
        borderColor,
        borderWidth,
        opacity: data.enabled ? 1 : 0.55,
        animation:
          runtimeStatus === "running" ? "node-pulse 1.4s ease-out infinite" : "none",
      }}
    >
      {badgeColor ? (
        <Box
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 16,
            height: 16,
            borderRadius: "50%",
            bgcolor: badgeColor,
            color: "#fff",
            fontSize: 10,
            display: "grid",
            placeItems: "center",
            boxShadow: 1,
            zIndex: 2,
          }}
        >
          !
        </Box>
      ) : null}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          p: isAiNode ? 0 : 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isAiNode ? 1.5 : 0,
            minWidth: 0,
            width: "100%",
            pl: isAiNode ? `${AI_LEFT_PADDING}px` : 0,
            pr: isAiNode ? `${AI_RIGHT_PADDING}px` : 0,
          }}
        >
          <Box
            sx={{
              width: iconBoxSize,
              height: iconBoxSize,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "action.hover",
              flex: "0 0 auto",
            }}
          >
            <Icon sx={{ fontSize: iconSize }} />
          </Box>

          {isAiNode ? (
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: MAIN_TEXT_SIZE,
                lineHeight: 1.2,
                fontWeight: 400,
                textAlign: "center",
                whiteSpace: "normal",
                wordBreak: "break-word",
                flex: 1,
              }}
            >
              {data.name}
            </Typography>
          ) : null}
        </Box>
      </Box>

      {!badgeColor ? (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: statusColor,
            border: "1px solid",
            borderColor: "divider",
          }}
        />
      ) : null}
      {!isAiNode ? (
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            left: "50%",
            top: "100%",
            transform: `translate(-50%, ${NODE_LABEL_OFFSET}px)`,
            fontSize: NODE_LABEL_FONT_SIZE,
            letterSpacing: 0.2,
            color: NODE_LABEL_COLOR,
            userSelect: "none",
            textAlign: "center",
            minWidth: 120,
            maxWidth: 180,
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {data.name}
        </Typography>
      ) : null}

      {isAgentNode && spec.toolHandle ? (
        <>
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              left: `${AGENT_TOOL_OFFSET}%`,
              top: "100%",
              transform: `translate(-50%, ${TOOL_LABEL_OFFSET}px)`,
              fontSize: 10,
              letterSpacing: 0.2,
              color: "text.secondary",
              userSelect: "none",
            }}
          >
            инструмент
          </Typography>
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              left: `${AGENT_MEMORY_OFFSET}%`,
              top: "100%",
              transform: `translate(-50%, ${TOOL_LABEL_OFFSET}px)`,
              fontSize: 10,
              letterSpacing: 0.2,
              color: "text.secondary",
              userSelect: "none",
            }}
          >
            память
          </Typography>
          <Box
            sx={{
              position: "absolute",
              left: `${AGENT_TOOL_OFFSET}%`,
              top: "100%",
              transform: `translate(-50%, ${TOOL_LINE_OFFSET}px)`,
              width: 2,
              height: TOOL_LINE_LENGTH,
              bgcolor: "divider",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: `${AGENT_MEMORY_OFFSET}%`,
              top: "100%",
              transform: `translate(-50%, ${TOOL_LINE_OFFSET}px)`,
              width: 2,
              height: TOOL_LINE_LENGTH,
              bgcolor: "divider",
            }}
          />
          <IconButton
            aria-label="Добавить инструмент"
            onClick={onAddTool}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            className="nodrag nopan"
            size="small"
            sx={{
              position: "absolute",
              left: `${AGENT_TOOL_OFFSET}%`,
              top: "100%",
              transform: `translate(-50%, ${TOOL_PLUS_OFFSET}px) scale(1)`,
              transformOrigin: "center",
              width: 22,
              height: 22,
              border: "1px solid",
              borderColor: "error.main",
              bgcolor: "background.paper",
              color: "error.main",
              boxShadow: 1,
              borderRadius: 0,
              pointerEvents: "all",
              zIndex: 5,
              "&:hover": {
                bgcolor: "action.hover",
                transform: `translate(-50%, ${TOOL_PLUS_OFFSET}px) scale(var(--motion-scale-hover))`,
              },
              "&:active": {
                transform: `translate(-50%, ${TOOL_PLUS_OFFSET}px) scale(var(--motion-scale-press))`,
              },
            }}
          >
            <AddIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            aria-label="Добавить память"
            onClick={onAddMemory}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            className="nodrag nopan"
            size="small"
            sx={{
              position: "absolute",
              left: `${AGENT_MEMORY_OFFSET}%`,
              top: "100%",
              transform: `translate(-50%, ${TOOL_PLUS_OFFSET}px) scale(1)`,
              transformOrigin: "center",
              width: 22,
              height: 22,
              border: "1px solid",
              borderColor: "error.main",
              bgcolor: "background.paper",
              color: "error.main",
              boxShadow: 1,
              borderRadius: 0,
              pointerEvents: "all",
              zIndex: 5,
              "&:hover": {
                bgcolor: "action.hover",
                transform: `translate(-50%, ${TOOL_PLUS_OFFSET}px) scale(var(--motion-scale-hover))`,
              },
              "&:active": {
                transform: `translate(-50%, ${TOOL_PLUS_OFFSET}px) scale(var(--motion-scale-press))`,
              },
            }}
          >
            <AddIcon fontSize="inherit" />
          </IconButton>
        </>
      ) : null}

      {/* Handles: 1 вход + 1 выход (пока без ограничений) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="node-handle"
        style={buildLeftHandleStyle(50)}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="node-handle"
        style={buildRightHandleStyle(50)}
      />
      {isAgentNode ? (
        <>
          <Handle
            type="target"
            position={Position.Bottom}
            id="tool"
            className="node-handle node-handle--diamond"
            style={buildBottomHandleStyle(AGENT_TOOL_OFFSET, "diamond")}
          />
          <Handle
            type="target"
            position={Position.Bottom}
            id="memory"
            className="node-handle node-handle--diamond"
            style={buildBottomHandleStyle(AGENT_MEMORY_OFFSET, "diamond")}
          />
        </>
      ) : spec.toolHandle ? (
        <Handle
          type="target"
          position={spec.toolHandle.position}
          id="tool"
          className="node-handle"
          style={buildBottomHandleStyle(spec.toolHandle.offsetPercent)}
        />
      ) : null}
    </Paper>
  );
});
