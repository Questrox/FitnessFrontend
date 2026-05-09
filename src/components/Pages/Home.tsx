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
      title: "Профессиональные тренеры",
      description: "Опытные специалисты помогут достичь ваших целей быстрее",
    },
    {
      icon: <GroupIcon fontSize="large" />,
      title: "Групповые и персональные тренировки",
      description: "Энергичные занятия и мотивация в команде",
    },
    {
      icon: <CalendarMonthIcon fontSize="large" />,
      title: "Удобное для вас расписание",
      description: "Тренировки в удобное для вас время",
    },
    {
      icon: <FitnessCenterIcon fontSize="large" />,
      title: "Современное оборудование",
      description: "Новейшие тренажеры и инвентарь для эффективных тренировок",
    }
  ];

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          position: "relative",
          minHeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "white",
          overflow: "hidden",

          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)),
            url('/images/HomePagePhoto.jfif')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            fontWeight={800}
            gutterBottom
            sx={{
              textShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            Стань лучшей версией себя
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mb: 5,
              opacity: 0.95,
              textShadow: "0 2px 10px rgba(0,0,0,0.4)",
            }}
          >
            Современный фитнес-клуб, персональные тренировки,
            профессиональные тренеры и атмосфера, которая мотивирует
            двигаться вперед
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              component={RouterLink}
              to="/memberships"
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
              }}
            >
              Абонементы
            </Button>

            <Button
              component={RouterLink}
              to="/schedule"
              variant="outlined"
              color="inherit"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                borderWidth: 2,
                fontWeight: 700,
              }}
            >
              Расписание
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Box 
        sx={{ 
          py: 8,
          maxWidth: "1500px",
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Typography variant="h4" textAlign="center" fontWeight={700} gutterBottom>
          Почему выбирают нас
        </Typography>

        <Typography textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Всё необходимое для комфортных и эффективных тренировок
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: 4,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
          }}
        >
          {features.map((f) => (
            <Card
              key={f.title}
              sx={{
                height: "100%",
                textAlign: "center",
                p: 2,
                borderRadius: 4,
                transition: "0.25s",
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box sx={{ mb: 2, color: "primary.main" }}>{f.icon}</Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {f.title}
                </Typography>
                <Typography color="text.secondary">{f.description}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* CTA */}
      <Box>
        <Box
          sx={{
            position: "relative",
            minHeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "white",
            overflow: "hidden",

            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)),
              url('/images/HomePagePhoto2.jpg')
            `,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="h3"
              fontWeight={800}
              gutterBottom
              sx={{
                textShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              Готовы начать?
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.95,
                textShadow: "0 2px 10px rgba(0,0,0,0.4)",
              }}
            >
              Выберите подходящий абонемент и начните путь
              к сильному, здоровому и энергичному телу уже сегодня
            </Typography>

            <Button
              component={RouterLink}
              to="/memberships"
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
              }}
            >
              Выбрать абонемент
            </Button>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Home