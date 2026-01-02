import { Box } from "@mui/material";
import { GraphEditor } from "../features/graphEditor/ui/GraphEditor";

export function GraphEditorPage() {
  return (
    <Box sx={{ flex: 1, minHeight: 0, width: "100%", display: "flex" }}>
      <GraphEditor />
    </Box>
  );
}
