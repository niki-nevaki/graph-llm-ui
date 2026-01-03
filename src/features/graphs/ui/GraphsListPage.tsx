import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LaunchIcon from "@mui/icons-material/Launch";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageTransition } from "../../../shared/ui/PageTransition";
import { useGraphsStore } from "../model/graphsStore";
import { CreateGraphDialog } from "./CreateGraphDialog";

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));

export function GraphsListPage() {
  const navigate = useNavigate();
  const { graphs, createGraph, deleteGraph } = useGraphsStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const rows = useMemo(() => graphs, [graphs]);

  const handleCreate = (name?: string) => {
    const graph = createGraph(name);
    setDialogOpen(false);
    navigate(`/graphs/${graph.id}`);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Удалить этот граф?")) return;
    deleteGraph(id);
  };

  return (
    <PageTransition>
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5">Мои графы</Typography>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" onClick={() => setDialogOpen(true)}>
            Создать граф
          </Button>
        </Box>

        {rows.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Графов пока нет
            </Typography>
            <Button variant="contained" onClick={() => setDialogOpen(true)}>
              Создать граф
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Обновлено</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((graph) => (
                  <TableRow
                    key={graph.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/graphs/${graph.id}`)}
                  >
                    <TableCell>{graph.name}</TableCell>
                    <TableCell>{formatDate(graph.updatedAt)}</TableCell>
                    <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/graphs/${graph.id}`)}
                      >
                        <LaunchIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(graph.id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <CreateGraphDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
    </PageTransition>
  );
}
