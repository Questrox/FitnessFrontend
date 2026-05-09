import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
  useTheme,
  Pagination
} from "@mui/material";

import {
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
} from "@mui/icons-material";

import { useEffect, useMemo, useRef, useState } from "react";
import { TrainingTypeDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";
import { TrainingTypeDetailsDialog } from "./TrainingTypeDetailsDialog";

export function TrainingsPage() {
  const theme = useTheme();

  const [trainingTypes, setTrainingTypes] = useState<TrainingTypeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTraining, setSelectedTraining] =
    useState<TrainingTypeDTO | null>(null);

  const pageSize = 6;
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchTrainingTypes();
  }, []);

  const paginatedTrainingTypes = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return trainingTypes.slice(start, end);
  }, [trainingTypes, page]);

  const handlePageChange = (
    _: React.ChangeEvent<unknown>,
    value: number
    ) => {
    setPage(value);

    requestAnimationFrame(() => {
        listRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        });
    });
  };

  const fetchTrainingTypes = async () => {
    try {
      setIsLoading(true);

      const data = await apiClient.getTrainingTypes();

      setTrainingTypes(data);
    } catch (error) {
      console.error(
        "Ошибка при получении типов тренировок:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetails = (
    training: TrainingTypeDTO
  ) => {
    setSelectedTraining(training);
  };

  const handleCloseDetails = () => {
    setSelectedTraining(null);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 8,

        background: `linear-gradient(
          180deg,
          ${alpha(theme.palette.primary.main, 0.05)} 0%,
          ${theme.palette.background.default} 30%,
          ${theme.palette.background.default} 100%
        )`,
      }}
      ref={listRef}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box textAlign="center" mb={10}>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{
              mb: 3,

              background: `linear-gradient(
                90deg,
                ${theme.palette.primary.main},
                ${theme.palette.secondary.main}
              )`,

              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",

              fontSize: {
                xs: "2.5rem",
                md: "4rem",
              },
            }}
          >
            Тренировки клуба
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
            Подберите тренировку под свои цели —
            от групповых занятий до персонального
            формата с тренером.
          </Typography>
        </Box>

        {/* Loading */}
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={12}
          >
            <CircularProgress size={52} />
          </Box>
        ) : (
          <Stack
            direction="row"
            spacing={4}
            justifyContent="center"
            alignItems="stretch"
            flexWrap="wrap"
            useFlexGap
          >
            {paginatedTrainingTypes.map((trainingType) => (
              <Card
                key={trainingType.id}
                sx={{
                    width: {
                    xs: "100%",
                    sm: 420,
                    md: 440,
                    },
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    transition: "0.25s",
                    flexShrink: 0,
                    "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                    },
                }}
                >
                {/* Image */}
                <Box
                    sx={{
                    position: "relative",
                    height: 220,
                    overflow: "hidden",
                    }}
                >
                    <Box
                    component="img"
                    src={trainingType.photoPath}
                    alt={trainingType.name}
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                    />

                    <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(
                        to top,
                        rgba(0,0,0,0.5),
                        rgba(0,0,0,0.08)
                        )`,
                    }}
                    />

                    {trainingType.maxClients === 1 && (
                    <Chip
                        label="Персональная"
                        color="secondary"
                        size="small"
                        sx={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        fontWeight: 700,
                        }}
                    />
                    )}
                </Box>

                <CardContent
                    sx={{
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                    }}
                    >
                    {/* Name - ограничение по строкам */}
                    <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{
                        mb: 1.5,
                        minHeight: 64, // 2 строки * 32px
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        }}
                    >
                        {trainingType.name}
                    </Typography>

                    {/* Description - ограничение по строкам */}
                    <Typography
                        color="text.secondary"
                        sx={{
                        lineHeight: 1.5,
                        mb: 3,
                        minHeight: 72, // 3 строки * 24px
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        }}
                    >
                        {trainingType.description}
                    </Typography>

                    {/* Chips - фиксированная высота */}
                    <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mb: 3, minHeight: 32 }}
                    >
                        <Chip
                        icon={<GroupIcon />}
                        label={
                            trainingType.maxClients === 1
                            ? "Индивидуальная"
                            : `До ${trainingType.maxClients} чел.`
                        }
                        variant="outlined"
                        size="small"
                        />
                        <Chip
                        icon={<AccessTimeIcon />}
                        label={`${trainingType.duration} мин`}
                        variant="outlined"
                        size="small"
                        />
                    </Stack>

                    {/* Push to bottom */}
                    <Box sx={{ flexGrow: 1 }} />

                    {/* Price */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h5" fontWeight={900}   >
                        {trainingType.price} ₽
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        за тренировку
                        </Typography>
                    </Box>

                    {/* Button */}
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleOpenDetails(trainingType)}
                        sx={{
                        py: 1.3,
                        borderRadius: 2,
                        fontWeight: 700,
                        }}
                    >
                        Подробнее
                    </Button>
                    </CardContent>
                </Card>
            ))}
          </Stack>
        )}
        <Box display="flex" justifyContent="center" mt={6}>
        <Pagination
            page={page}
            count={Math.ceil(trainingTypes.length / pageSize)}
            onChange={handlePageChange}
            color="primary"
            size="large"
            />
        </Box>

        {/* Details dialog */}
        <TrainingTypeDetailsDialog
            open={selectedTraining !== null}
            training={selectedTraining}
            onClose={handleCloseDetails}
        />
      </Container>
    </Box>
  );
}

export default TrainingsPage;