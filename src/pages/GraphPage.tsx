import { Box } from "@mui/material";
import { ReactFlowProvider } from "@xyflow/react";
import { FlowCanvas } from "../features/graph-editor/ui/FlowCanvas";
import { NodePalette } from "../features/graph-editor/ui/NodePalette";

export function GraphEditorPage() {
  return (
    <ReactFlowProvider>
      <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
        <NodePalette />
        <Box sx={{ flex: 1, minWidth: 0, height: "100%" }}>
          <FlowCanvas />
        </Box>
      </Box>
    </ReactFlowProvider>
  );
}
