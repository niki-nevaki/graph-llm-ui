import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { CredentialSummary } from "../../model/types";
import { useState, type MouseEvent } from "react";

type CredentialsTableProps = {
  items: CredentialSummary[];
  onEdit: (id: string) => void;
  onDelete: (item: CredentialSummary) => void;
  onDuplicate: (item: CredentialSummary) => void;
  getTypeLabel?: (type: string) => string;
};

export function CredentialsTable({
  items,
  onEdit,
  onDelete,
  onDuplicate,
  getTypeLabel,
}: CredentialsTableProps) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeItem, setActiveItem] = useState<CredentialSummary | null>(null);

  const handleOpenMenu = (
    event: MouseEvent<HTMLButtonElement>,
    item: CredentialSummary
  ) => {
    setAnchorEl(event.currentTarget);
    setActiveItem(item);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveItem(null);
  };

  const handleMenuAction = (action: "edit" | "duplicate" | "delete") => {
    if (!activeItem) {
      return;
    }
    if (action === "edit") {
      onEdit(activeItem.id);
    }
    if (action === "duplicate") {
      onDuplicate(activeItem);
    }
    if (action === "delete") {
      onDelete(activeItem);
    }
    handleCloseMenu();
  };

  if (isCompact) {
    return (
      <Stack spacing={2}>
        {items.map((item) => (
          <Paper
            key={item.id}
            variant="outlined"
            sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1" noWrap>
                {item.name}
              </Typography>
              <IconButton
                aria-label="Действия учетных данных"
                onClick={(event) => handleOpenMenu(event, item)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={getTypeLabel?.(item.type) ?? item.type}
                size="small"
              />
              {item.shared && <Chip label="Общий доступ" size="small" />}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Обновлено {new Date(item.updatedAt).toLocaleString()}
            </Typography>
          </Paper>
        ))}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={() => handleMenuAction("edit")}>Изменить</MenuItem>
          <MenuItem onClick={() => handleMenuAction("duplicate")}>Дублировать</MenuItem>
          <MenuItem onClick={() => handleMenuAction("delete")}>Удалить</MenuItem>
        </Menu>
      </Stack>
    );
  }

  return (
    <Paper variant="outlined" sx={{ width: "100%", overflow: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Название</TableCell>
            <TableCell>Тип</TableCell>
            <TableCell>Владелец</TableCell>
            <TableCell>Обновлено</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => onEdit(item.id)}
            >
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <Chip
                  label={getTypeLabel?.(item.type) ?? item.type}
                  size="small"
                />
              </TableCell>
              <TableCell>{item.owner?.name ?? "—"}</TableCell>
              <TableCell>
                {new Date(item.updatedAt).toLocaleString()}
              </TableCell>
              <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                <IconButton
                  aria-label="Действия учетных данных"
                  onClick={(event) => handleOpenMenu(event, item)}
                  size="small"
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleMenuAction("edit")}>Изменить</MenuItem>
        <MenuItem onClick={() => handleMenuAction("duplicate")}>Дублировать</MenuItem>
        <MenuItem onClick={() => handleMenuAction("delete")}>Удалить</MenuItem>
      </Menu>
    </Paper>
  );
}
