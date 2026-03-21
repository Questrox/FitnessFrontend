import { Box, Typography, Button, Container, GridLegacy, Card, CardContent } from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import GroupIcon from "@mui/icons-material/Group";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Link as RouterLink } from "react-router-dom";

const Home = () => {
  const features = [
    {
      icon: <FitnessCenterIcon fontSize="large" />,
      title: "Expert Trainers",
      description: "Train with experienced professionals",
    },
    {
      icon: <GroupIcon fontSize="large" />,
      title: "Group Classes",
      description: "Motivating group workouts",
    },
    {
      icon: <CalendarMonthIcon fontSize="large" />,
      title: "Flexible Schedule",
      description: "Classes every day of the week",
    },
    {
      icon: <TrendingUpIcon fontSize="large" />,
      title: "Track Progress",
      description: "Monitor your fitness journey",
    },
  ];

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          height: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "white",
          backgroundColor: "primary.main",
        }}
      >
        <Container>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Transform Your Body
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Join our fitness club and reach your goals faster
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={RouterLink}
              to="/memberships"
              variant="contained"
              color="secondary"
              size="large"
            >
              Memberships
            </Button>
            <Button
              component={RouterLink}
              to="/schedule"
              variant="outlined"
              color="inherit"
              size="large"
            >
              Schedule
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight={600} gutterBottom>
          Why Choose Us
        </Typography>
        <GridLegacy container spacing={4} sx={{ mt: 2 }}>
          {features.map((f) => (
            <GridLegacy item xs={12} sm={6} md={3} key={f.title}>
              <Card sx={{ textAlign: "center", p: 2 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>{f.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {f.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {f.description}
                  </Typography>
                </CardContent>
              </Card>
            </GridLegacy>
          ))}
        </GridLegacy>
      </Container>

      {/* CTA */}
      <Box
        sx={{
          py: 8,
          textAlign: "center",
          backgroundColor: "secondary.main",
          color: "secondary.contrastText",
        }}
      >
        <Container>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Ready to start?
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Choose your membership and begin today
          </Typography>
          <Button
            component={RouterLink}
            to="/memberships"
            variant="contained"
            color="primary"
            size="large"
          >
            Get Started
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

export default Home