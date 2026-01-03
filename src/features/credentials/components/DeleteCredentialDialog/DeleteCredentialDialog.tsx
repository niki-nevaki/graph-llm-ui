import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

type DeleteCredentialDialogProps = {
  open: boolean;
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export function DeleteCredentialDialog({
  open,
  name,
  onCancel,
  onConfirm,
  loading,
}: DeleteCredentialDialogProps) {
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    if (open) {
      setConfirmation("");
    }
  }, [open]);

  const canDelete = confirmation.trim() === name;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Удалить учетные данные?</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Это действие нельзя отменить. Для подтверждения введите название учетных данных.
          </Typography>
          <TextField
            label="Название учетных данных"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={!canDelete || loading}
        >
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
