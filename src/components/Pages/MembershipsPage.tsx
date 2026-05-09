import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  GridLegacy,
  IconButton,
  Stack,
  Typography,
  useTheme,
  alpha,
  CircularProgress,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { MembershipTypeDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";

export function MembershipsPage() {
  const theme = useTheme();

  const [memberships, setMemberships] = useState<MembershipTypeDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const contactRef = useRef<HTMLDivElement | null>(null);

  const itemsPerPage = 3;

  const totalPages = Math.ceil(memberships.length / itemsPerPage);

  const visibleMemberships = useMemo(() => {
    return memberships.slice(
      currentIndex * itemsPerPage,
      (currentIndex + 1) * itemsPerPage
    );
  }, [memberships, currentIndex]);

  useEffect(() => {
    fetchMembershipTypes();
  }, []);

  const fetchMembershipTypes = async () => {
    try {
      const data = await apiClient.getMembershipTypes();
      setMemberships(data);
    } catch (error: any) {
      console.error("Произошла ошибка при получении типов абонементов: ", error);
    }
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleScrollToContact = () => {
    contactRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(
          180deg,
          ${alpha(theme.palette.primary.main, 0.06)} 0%,
          ${theme.palette.background.default} 25%,
          ${theme.palette.background.default} 100%
        )`,
        py: 8,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box textAlign="center" mb={10}>

          <Typography
            variant="h2"
            fontWeight={800}
            sx={{
              mb: 3,
              background: `linear-gradient(90deg,
                ${theme.palette.primary.main},
                ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: {
                xs: "2.5rem",
                md: "4rem",
              },
            }}
          >
            Наши абонементы
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 850,
              mx: "auto",
              lineHeight: 1.8,
            }}
          >
            Выберите формат, который подходит именно вам.
            Мы предлагаем гибкие условия, кэшбек бонусами и комфортную атмосферу
            для достижения ваших целей.
          </Typography>
        </Box>

        {/* Navigation */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: 5,
            width: "100%",
            maxWidth: 1160,
            mx: "auto",
          }}
        >
          <IconButton
            onClick={goToPrev}
            disabled={totalPages <= 1}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              transition: "0.2s",
              "&:hover": {
                bgcolor: "action.hover",
                transform: "scale(1.05)",
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <Stack direction="row" spacing={1}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: index === currentIndex ? 34 : 10,
                  height: 10,
                  borderRadius: 999,
                  cursor: "pointer",
                  transition: "0.25s",
                  bgcolor:
                    index === currentIndex
                      ? "primary.main"
                      : "divider",
                }}
              />
            ))}
          </Stack>

          <IconButton
            onClick={goToNext}
            disabled={totalPages <= 1}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              transition: "0.2s",
              "&:hover": {
                bgcolor: "action.hover",
                transform: "scale(1.05)",
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>

        {/* Membership cards */}
        {memberships.length === 0 ? (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={10}
        >
          <CircularProgress size={48} />
        </Box>
        ) : (
        <Stack
            direction="row"
            spacing={4}
            justifyContent="center"
            alignItems="stretch"
            flexWrap="wrap"
            sx={{ mb: 10 }}
        >
            {visibleMemberships.map((membership) => {
            const cashbackAmount = (
                membership.price! *
                (membership.cashbackPercentage! / 100)
            ).toFixed(0);

            return (
                <Card
                key={membership.id}
                sx={{
                    width: {
                    xs: "100%",
                    sm: 340,
                    md: 360,
                    },

                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: "divider",

                    transition: "0.3s",

                    display: "flex",
                    flexDirection: "column",

                    flexShrink: 0,

                    "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                    },
                }}
                >
                <CardContent
                    sx={{
                    p: 3,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    }}
                >
                    <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2.5}
                    >
                    <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{
                        maxWidth: "70%",
                        lineHeight: 1.2,
                        }}
                    >
                        {membership.name}
                    </Typography>

                    <Chip
                        label={`${membership.duration} мес.`}
                        color="secondary"
                        size="small"
                        sx={{
                        fontWeight: 700,
                        borderRadius: 3,
                        }}
                    />
                    </Stack>

                    <Box
                        sx={{
                            flexGrow: 1,
                            display: "flex",
                            mb: 3,
                        }}
                        >
                        <Typography
                            color="text.secondary"
                            sx={{
                            lineHeight: 1.7,
                            fontSize: "0.95rem",
                            }}
                        >
                            {membership.description}
                        </Typography>
                    </Box>

                    <Box mb={3}>
                    <Stack
                        direction="row"
                        alignItems="flex-end"
                        spacing={1}
                        mb={2.5}
                    >
                        <Typography
                        variant="h4"
                        fontWeight={900}
                        >
                        {membership.price} ₽
                        </Typography>

                        <Typography
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                        >
                        / {membership.duration} мес.
                        </Typography>
                    </Stack>

                    <Box
                        sx={{
                        p: 2,
                        borderRadius: 2,

                        background: `linear-gradient(
                            135deg,
                            ${alpha(theme.palette.success.main, 0.12)},
                            ${alpha(theme.palette.success.light, 0.06)}
                        )`,

                        border: "1px solid",

                        borderColor: alpha(
                            theme.palette.success.main,
                            0.3
                        ),
                        }}
                    >
                        <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={0.5}
                        >

                        <Typography
                            fontWeight={700}
                            color="success.main"
                            fontSize="0.95rem"
                        >
                            Кэшбек бонусами
                        </Typography>
                        </Stack>

                        <Typography
                        variant="h5"
                        fontWeight={800}
                        color="success.main"
                        >
                        {cashbackAmount} ₽
                        </Typography>

                        <Typography
                        variant="body2"
                        color="text.secondary"
                        >
                        {membership.cashbackPercentage}% вернется
                        бонусами на ваш счёт
                        </Typography>
                    </Box>
                    </Box>

                    <Box
                    sx={{
                        mt: "auto",
                        pt: 2.5,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        textAlign: "center",
                    }}
                    >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        fontSize="0.85rem"
                    >
                        Подробности и оформление — у администрации клуба
                    </Typography>
                    </Box>
                </CardContent>
                </Card>
            );
            })}
        </Stack>
        )}

        {/* CTA */}
        <Box
          ref={contactRef}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 6,
            p: {
              xs: 4,
              md: 8,
            },
            textAlign: "center",
            background: `linear-gradient(
              135deg,
              ${theme.palette.primary.main},
              ${theme.palette.secondary.main}
            )`,
            color: theme.palette.primary.contrastText,
            boxShadow: 10,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(
                circle at top right,
                rgba(255,255,255,0.18),
                transparent 35%
              )`,
            }}
          />

          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ mb: 3, position: "relative" }}
          >
            Нужна помощь с выбором?
          </Typography>

          <Typography
            sx={{
              mb: 5,
              maxWidth: 800,
              mx: "auto",
              opacity: 0.92,
              fontSize: {
                xs: "1rem",
                md: "1.15rem",
              },
              lineHeight: 1.8,
              position: "relative",
            }}
          >
            Наша команда поможет подобрать оптимальный абонемент
            под ваш график, цели и уровень подготовки.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleScrollToContact}
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 999,
              bgcolor: "background.paper",
              color: "primary.main",
              fontWeight: 700,
              fontSize: "1rem",
              transition: "0.25s",
              "&:hover": {
                  boxShadow: 6,
              },
            }}
          >
            Связаться с нашей командой
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default MembershipsPage;