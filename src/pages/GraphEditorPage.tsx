import { Box } from "@mui/material";
import { GraphEditor } from "../features/graphEditor/ui/GraphEditor";

export function GraphEditorPage() {
  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <GraphEditor />
    </Box>
  );
}
