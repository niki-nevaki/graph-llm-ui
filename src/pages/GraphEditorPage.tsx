import { Box } from "@mui/material";
import { GraphEditor } from "../features/graphEditor/ui/GraphEditor";
import { PageTransition } from "../shared/ui/PageTransition";

export function GraphEditorPage() {
  return (
    <PageTransition>
      <Box sx={{ flex: 1, minHeight: 0, width: "100%", display: "flex" }}>
        <GraphEditor />
      </Box>
    </PageTransition>
  );
}
