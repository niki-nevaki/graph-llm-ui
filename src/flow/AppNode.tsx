import { Box, Chip, Paper, Typography } from "@mui/material";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";
import { validateNode, type AppNodeData } from "../types/types";
import { NODE_SPECS } from "./nodeSpecs";

const handleStyle: React.CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.25)",
  background: "#fff",
  zIndex: 10,
};

export const AppNode = memo(function AppNode(props: NodeProps) {
  const data = props.data as AppNodeData;
  const spec = NODE_SPECS[data.kind];
  const Icon = spec.Icon;

  const v = validateNode(data);

  return (
    <Paper
      elevation={3}
      sx={{
        position: "relative",
        width: 240,
        borderRadius: 2,
        overflow: "visible",
        border: "1px solid",
        borderColor: props.selected ? "primary.main" : "divider",
        opacity: data.enabled ? 1 : 0.55,
      }}
    >
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
          <Typography variant="caption" color="text.secondary" noWrap>
            {spec.title}
          </Typography>
        </Box>

        <Chip
          size="small"
          label={v.ok ? "ok" : `${v.issues.length}`}
          color={v.ok ? "success" : "warning"}
          variant="outlined"
        />
      </Box>

      <Box
        sx={{
          px: 1.25,
          py: 1,
          bgcolor: "background.default",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Drag • Connect • Click to edit
        </Typography>
      </Box>

      {/* Handles: 1 вход + 1 выход (пока без ограничений) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={handleStyle}
      />

      {/* подписи портов */}
      <Box
        sx={{
          position: "absolute",
          left: -44,
          top: "50%",
          transform: "translateY(-50%)",
          width: 40,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ userSelect: "none" }}
        >
          {spec.inLabel}
        </Typography>
      </Box>
      <Box
        sx={{
          position: "absolute",
          right: -44,
          top: "50%",
          transform: "translateY(-50%)",
          width: 40,
          textAlign: "right",
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ userSelect: "none" }}
        >
          {spec.outLabel}
        </Typography>
      </Box>
    </Paper>
  );
});
