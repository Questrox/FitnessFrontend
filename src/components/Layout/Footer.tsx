import { Box, Container, Typography, GridLegacy } from "@mui/material";

const Root = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box component="footer" sx={{ bgcolor: "grey.900", color: "grey.100", py: 6, mt: 6 }}>
        <Container>
          <GridLegacy container spacing={4}>
            <GridLegacy item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                FitClub
              </Typography>
              <Typography variant="body2" color="grey.400">
                Современный фитнес-клуб с профессиональным оборудованием и тренерским составом.
              </Typography>
            </GridLegacy>

            <GridLegacy item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Навигация
              </Typography>
              <Typography variant="body2" color="grey.400">
                Абонементы
              </Typography>
              <Typography variant="body2" color="grey.400">
                Расписание занятий
              </Typography>
            </GridLegacy>

            <GridLegacy item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Связь
              </Typography>
              <Typography variant="body2" color="grey.400">
                info@fitclub.com
              </Typography>
              <Typography variant="body2" color="grey.400">
                +7(961)276-78-36
              </Typography>
            </GridLegacy>
          </GridLegacy>

          <Box sx={{ mt: 4, pt: 2, borderTop: "1px solid", borderColor: "grey.800", textAlign: "center" }}>
            <Typography variant="body2" color="grey.500">
              © 2026 FitClub
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Root;
