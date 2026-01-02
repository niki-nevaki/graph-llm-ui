import { Box, Typography } from "@mui/material";
import { PageTransition } from "../shared/ui/PageTransition";

export const HomePage = () => (
  <PageTransition>
    <Box sx={{ p: 3 }}>
      <Typography variant="h6">Главная</Typography>
    </Box>
  </PageTransition>
);
