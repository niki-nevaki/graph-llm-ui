import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

import type { Issue } from "../model/runtime";

type Props = {
  open: boolean;
  issues: Issue[];
  onClose: () => void;
  onSelectIssue: (issue: Issue) => void;
};

export function IssuesPanel({ open, issues, onClose, onSelectIssue }: Props) {
  const [tab, setTab] = useState(0);

  const { errors, warnings } = useMemo(() => {
    return {
      errors: issues.filter((issue) => issue.severity === "error"),
      warnings: issues.filter((issue) => issue.severity === "warning"),
    };
  }, [issues]);

  const list = tab === 0 ? errors : warnings;
  const emptyLabel = tab === 0 ? "Ошибок нет" : "Предупреждений нет";

  if (!open) return null;

  return (
    <Box
      sx={{
        height: 260,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle2">Проблемы</Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, next) => setTab(next)}
        variant="fullWidth"
      >
        <Tab label={`Ошибки (${errors.length})`} />
        <Tab label={`Предупреждения (${warnings.length})`} />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {list.length === 0 ? (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {emptyLabel}
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {list.map((issue) => (
              <ListItemButton
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
              >
                <ListItemText
                  primary={issue.message}
                  secondary={
                    issue.nodeId
                      ? `Нода: ${issue.nodeId}`
                      : issue.edgeId
                      ? `Связь: ${issue.edgeId}`
                      : undefined
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
