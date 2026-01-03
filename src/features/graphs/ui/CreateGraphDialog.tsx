import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (name?: string) => void;
};

export function CreateGraphDialog({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState("");

  const handleCreate = () => {
    onCreate(name.trim());
    setName("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Создать граф</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          label="Название"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Новый граф"
          autoFocus
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        <Button variant="contained" onClick={handleCreate}>
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}
