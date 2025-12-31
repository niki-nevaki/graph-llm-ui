import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { NODE_SPECS } from "../flow/nodeSpecs";
import type { NodeKind } from "../types/types";

const ALL_KINDS = Object.keys(NODE_SPECS) as NodeKind[];

function onDragStart(event: React.DragEvent, kind: NodeKind) {
  event.dataTransfer.setData("application/reactflow-node-type", "appNode");
  event.dataTransfer.setData("application/reactflow-node-kind", kind);
  event.dataTransfer.effectAllowed = "move";
}

export function NodePalette() {
  return (
    <Paper
      elevation={0}
      sx={{
        width: 320,
        borderRight: 1,
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Nodes
        </Typography>

        <TextField
          size="small"
          fullWidth
          placeholder="Search nodes…"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {(["Inputs", "Integrations", "Data", "AI"] as const).map((group) => (
          <Accordion
            key={group}
            defaultExpanded
            disableGutters
            elevation={0}
            sx={{ "&:before": { display: "none" } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">{group}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <List dense disablePadding>
                {ALL_KINDS.filter((k) => NODE_SPECS[k].group === group).map(
                  (kind) => {
                    const spec = NODE_SPECS[kind];
                    const Icon = spec.Icon;

                    return (
                      <ListItemButton
                        key={kind}
                        draggable
                        onDragStart={(e) => onDragStart(e, kind)}
                        sx={{ borderRadius: 1, mb: 0.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Icon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={spec.title}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItemButton>
                    );
                  }
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Divider />
      <Box sx={{ p: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          Drag a node onto the canvas →
        </Typography>
      </Box>
    </Paper>
  );
}
