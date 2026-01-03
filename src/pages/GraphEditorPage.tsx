import { Box, Button, Paper, Typography } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { GraphEditor } from "../features/graphEditor/ui/GraphEditor";
import { useGraphsStore } from "../features/graphs/model/graphsStore";
import { PageTransition } from "../shared/ui/PageTransition";

export function GraphEditorPage() {
  const { graphId } = useParams();
  const navigate = useNavigate();
  const { getGraphById, updateGraphDefinition } = useGraphsStore();
  const graph = graphId ? getGraphById(graphId) : undefined;
  const handleDefinitionChange = useCallback(
    (definition: typeof graph.definition) => {
      if (!graphId) return;
      updateGraphDefinition(graphId, definition);
    },
    [graphId, updateGraphDefinition]
  );

  if (!graph || !graphId) {
    return (
      <PageTransition>
        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Граф не найден</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Похоже, этот граф был удалён или ещё не создан.
            </Typography>
            <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate("/graphs")}>
              Назад к списку
            </Button>
          </Paper>
        </Box>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Box sx={{ flex: 1, minHeight: 0, width: "100%", display: "flex" }}>
        <GraphEditor
          graphId={graphId}
          initialDefinition={graph.definition}
          onDefinitionChange={handleDefinitionChange}
        />
      </Box>
    </PageTransition>
  );
}
