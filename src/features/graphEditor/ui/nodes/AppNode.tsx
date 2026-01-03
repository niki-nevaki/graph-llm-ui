import AddIcon from "@mui/icons-material/Add";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo, useCallback, useMemo } from "react";
import { validateNode, type DefinitionNode } from "../../../../domain/workflow";
import { useGraphRuntime } from "../../model/runtimeContext";
import { NODE_SPECS } from "./nodeSpecs";

type HandleShape = "circle" | "diamond";

const handleStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.25)",
  background: "#fff",
  zIndex: 10,
};

const buildHandleStyle = (offsetPercent: number, shape: HandleShape = "circle") => ({
  ...handleStyle,
  top: `${offsetPercent}%`,
  borderRadius: shape === "diamond" ? 2 : 999,
  transform: shape === "diamond" ? "rotate(45deg)" : undefined,
});

const buildBottomHandleStyle = (
  offsetPercent: number,
  shape: HandleShape = "circle"
) => ({
  ...handleStyle,
  left: `${offsetPercent}%`,
  borderRadius: shape === "diamond" ? 2 : 999,
  transform:
    shape === "diamond" ? "translateX(-50%) rotate(45deg)" : "translateX(-50%)",
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

type AppNodeProps = NodeProps<DefinitionNode> & {
  onRequestToolDraft?: (agentId: string) => void;
};

export const AppNode = memo(function AppNode(props: AppNodeProps) {
  const data = props.data;
  const spec = NODE_SPECS[data.kind];
  const Icon = spec.Icon;
  const isToolNode = data.kind === "tool";
  const isTextNode = data.kind === "text";
  const isAgentNode = data.kind === "agent";
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
      props.onRequestToolDraft?.(props.id);
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
        <Icon sx={{ fontSize: TOOL_ICON_SIZE }} />

        <Handle
          type="target"
          position={Position.Left}
          id="in"
          style={buildHandleStyle(50)}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          style={buildHandleStyle(50)}
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
          p: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isTextNode ? "center" : "space-between",
            gap: isTextNode ? 0 : 1.5,
            minWidth: 0,
            width: "100%",
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

          {!isTextNode ? (
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: MAIN_TEXT_SIZE,
                lineHeight: 1.2,
                fontWeight: 400,
                textAlign: "right",
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
        </>
      ) : null}

      {/* Handles: 1 вход + 1 выход (пока без ограничений) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={buildHandleStyle(50)}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={buildHandleStyle(50)}
      />
      {isAgentNode ? (
        <>
          <Handle
            type="target"
            position={Position.Bottom}
            id="tool"
            style={buildBottomHandleStyle(AGENT_TOOL_OFFSET, "diamond")}
          />
          <Handle
            type="target"
            position={Position.Bottom}
            id="memory"
            style={buildBottomHandleStyle(AGENT_MEMORY_OFFSET, "diamond")}
          />
        </>
      ) : spec.toolHandle ? (
        <Handle
          type="target"
          position={spec.toolHandle.position}
          id="tool"
          style={buildBottomHandleStyle(spec.toolHandle.offsetPercent)}
        />
      ) : null}
    </Paper>
  );
});
