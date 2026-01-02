import AddIcon from "@mui/icons-material/Add";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo, useCallback, useMemo } from "react";
import { validateNode, type DefinitionNode } from "../../../../domain/workflow";
import { useGraphRuntime } from "../../model/runtimeContext";
import { NODE_SPECS } from "./nodeSpecs";

const handleStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.25)",
  background: "#fff",
  zIndex: 10,
};

const buildHandleStyle = (offsetPercent: number) => ({
  ...handleStyle,
  top: `${offsetPercent}%`,
});

const buildBottomHandleStyle = (offsetPercent: number) => ({
  ...handleStyle,
  left: `${offsetPercent}%`,
  transform: "translateX(-50%)",
});

const TOOL_LABEL_OFFSET = 6;
const TOOL_LINE_OFFSET = 18;
const TOOL_LINE_LENGTH = 30;
const TOOL_PLUS_OFFSET = TOOL_LINE_OFFSET + TOOL_LINE_LENGTH + 12;

type AppNodeProps = NodeProps<DefinitionNode> & {
  onRequestToolDraft?: (agentId: string) => void;
};

export const AppNode = memo(function AppNode(props: AppNodeProps) {
  const data = props.data;
  const spec = NODE_SPECS[data.kind];
  const Icon = spec.Icon;
  const isToolNode = data.kind === "tool";
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
    return v.ok ? "success.main" : "warning.main";
  })();

  const borderColor = issueSeverity
    ? issueSeverity === "error"
      ? "error.main"
      : "warning.main"
    : props.selected
    ? "primary.main"
    : "divider";

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
          width: 120,
          height: 120,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          border: "1px solid",
          borderColor,
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
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: "action.hover",
          }}
        >
          <Icon fontSize="medium" />
        </Box>

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

  return (
    <Paper
      elevation={3}
      sx={{
        position: "relative",
        width: 240,
        borderRadius: 2,
        overflow: "visible",
        border: "1px solid",
        borderColor,
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
        sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.25, py: 1 }}
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
          <Typography variant="subtitle2" noWrap>
            {data.name}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: statusColor,
            border: "1px solid",
            borderColor: "divider",
          }}
        />
      </Box>

      {data.kind === "agent" && spec.toolHandle ? (
        <>
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              left: "50%",
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
          <Box
            sx={{
              position: "absolute",
              left: "50%",
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
              left: "50%",
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
      {spec.toolHandle ? (
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
