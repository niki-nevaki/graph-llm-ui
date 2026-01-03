import {
  Avatar,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import type { CredentialTypeDefinition } from "../../model/types";

type CredentialTypePickerDialogProps = {
  open: boolean;
  types: CredentialTypeDefinition[];
  loading?: boolean;
  onClose: () => void;
  onSelect: (type: CredentialTypeDefinition) => void;
};

export function CredentialTypePickerDialog({
  open,
  types,
  loading,
  onClose,
  onSelect,
}: CredentialTypePickerDialogProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return types;
    }
    return types.filter((type) =>
      `${type.displayName} ${type.type} ${type.description ?? ""}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [query, types]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Choose credential type</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            placeholder="Search credential types"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            fullWidth
          />
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Loading types...
            </Typography>
          ) : (
            <List sx={{ maxHeight: 360, overflow: "auto" }}>
              {filtered.map((type) => (
                <ListItemButton
                  key={type.type}
                  onClick={() => onSelect(type)}
                >
                  <ListItemAvatar>
                    <Avatar>{type.displayName.slice(0, 1)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={type.displayName}
                    secondary={type.description}
                  />
                </ListItemButton>
              ))}
              {filtered.length === 0 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No matching types
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
