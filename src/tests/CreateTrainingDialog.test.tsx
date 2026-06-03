import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import dayjs from "dayjs";

import { CreateTrainingDialog } from "../components/TrainingModals/CreateTrainingDialog";
import { apiClient } from "../api/apiClient";

jest.mock("../api/apiClient");

jest.mock("../components/TrainingModals/CreateTrainingBase", () => ({
  CreateTrainingBase: ({ setTrainingType, setStartDateTime }: any) => (
    <div>
      <button onClick={() => setTrainingType({ id: 1, name: "Йога", duration: 60 })}>
        Выбрать тип
      </button>

      <button onClick={() => setStartDateTime(require("dayjs")().add(1, "day"))}>
        Выбрать дату
      </button>

      <button onClick={() => setStartDateTime(require("dayjs")().subtract(1, "day"))}>
        Выбрать прошедшую дату
      </button>
    </div>
  ),
}));

const mockTrainingTypes = [
  {
    id: 1,
    name: "Йога",
    duration: 60,
  },
];

const mockCoaches = [
  {
    id: 1,
    user: {
      fullName: "Иван Иванов",
    },
  },
];

const renderComponent = () => {

  return render(
    <ThemeProvider theme={createTheme()}>
      <CreateTrainingDialog
        isOpen={true}
        onClose={jest.fn()}
        trainingTypes={mockTrainingTypes as any}
        onSuccess={jest.fn()}
        selectedDay={dayjs()}
      />
    </ThemeProvider>
  );
};

describe("CreateTrainingDialog", () => {

  beforeEach(() => {

    (apiClient.getAvailableCoaches as jest.Mock)
      .mockResolvedValue(mockCoaches);

    (apiClient.addTraining as jest.Mock)
      .mockResolvedValue({});

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("рендерит диалог создания тренировки", () => {

    renderComponent();

    expect(
      screen.getByText("Создание тренировки")
    ).toBeInTheDocument();

  });

  test("кнопка создания изначально заблокирована", () => {

    renderComponent();

    expect(
      screen.getByRole("button", {
        name: "Создать",
      })
    ).toBeDisabled();

  });

  test("загружает свободных тренеров после выбора даты и типа", async () => {

    renderComponent();

    fireEvent.click(
      screen.getByText("Выбрать тип")
    );

    fireEvent.click(
      screen.getByText("Выбрать дату")
    );

    await waitFor(() => {

      expect(
        apiClient.getAvailableCoaches
      ).toHaveBeenCalled();

    });

  });

  test("показывает сообщение об отсутствии тренеров", async () => {

    (apiClient.getAvailableCoaches as jest.Mock)
      .mockResolvedValue([]);

    renderComponent();

    fireEvent.click(
      screen.getByText("Выбрать тип")
    );

    fireEvent.click(
      screen.getByText("Выбрать дату")
    );

    expect(
      await screen.findByLabelText(
        "Нет свободных тренеров"
      )
    ).toBeInTheDocument();

  });

  test("вызывает onClose при нажатии отмены", () => {

    const onClose = jest.fn();

    render(
      <ThemeProvider theme={createTheme()}>
        <CreateTrainingDialog
          isOpen={true}
          onClose={onClose}
          trainingTypes={mockTrainingTypes as any}
          onSuccess={jest.fn()}
          selectedDay={dayjs()}
        />
      </ThemeProvider>
    );

    fireEvent.click(
      screen.getByText("Отмена")
    );

    expect(onClose).toHaveBeenCalled();

  });

  test("показывает ошибку при выборе прошедшей даты", async () => {

    renderComponent();

    fireEvent.click(
      screen.getByText("Выбрать тип")
    );

    fireEvent.click(
      screen.getByText("Выбрать прошедшую дату")
    );

    await waitFor(() => {
      expect(
        apiClient.getAvailableCoaches
      ).toHaveBeenCalled();
    });

    await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    fireEvent.mouseDown(
      screen.getByRole("combobox")
    );

    fireEvent.click(
      await screen.findByText(
        "Иван Иванов"
      )
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Создать",
      })
    );

    expect(
      await screen.findByText(
        "Нельзя создать тренировку ранее текущей даты и времени"
      )
    ).toBeInTheDocument();

  });

  test("показывает ошибку с бэкенда при создании", async () => {

    (apiClient.addTraining as jest.Mock)
      .mockRejectedValue(
        new Error("Ошибка создания")
      );

    renderComponent();

    fireEvent.click(
      screen.getByText("Выбрать тип")
    );

    fireEvent.click(
      screen.getByText("Выбрать дату")
    );

    await waitFor(() => {
      expect(
        apiClient.getAvailableCoaches
      ).toHaveBeenCalled();
    });

    await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    fireEvent.mouseDown(
      await screen.findByRole("combobox")
    );

    fireEvent.click(
      await screen.findByText(
        "Иван Иванов"
      )
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Создать",
      })
    );

    expect(
      await screen.findByText(
        "Ошибка создания"
      )
    ).toBeInTheDocument();

  });

  test("успешно создает тренировку", async () => {

    const onSuccess = jest.fn();
    const onClose = jest.fn();

    render(
      <ThemeProvider theme={createTheme()}>
        <CreateTrainingDialog
          isOpen={true}
          onClose={onClose}
          trainingTypes={mockTrainingTypes as any}
          onSuccess={onSuccess}
          selectedDay={dayjs()}
        />
      </ThemeProvider>
    );

    fireEvent.click(
      screen.getByText("Выбрать тип")
    );

    fireEvent.click(
      screen.getByText("Выбрать дату")
    );

    await waitFor(() => {
      expect(
        apiClient.getAvailableCoaches
      ).toHaveBeenCalled();
    });

    await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    fireEvent.mouseDown(
      await screen.findByRole("combobox")
    );

    fireEvent.click(
      await screen.findByText(
        "Иван Иванов"
      )
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Создать",
      })
    );

    await waitFor(() => {

      expect(
        apiClient.addTraining
      ).toHaveBeenCalled();

      expect(
        onSuccess
      ).toHaveBeenCalled();

      expect(
        onClose
      ).toHaveBeenCalled();

    });

  });

  test("показывает состояние загрузки тренеров", async () => {

    (apiClient.getAvailableCoaches as jest.Mock)
      .mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () => resolve(mockCoaches),
              100
            )
          )
      );

    renderComponent();

    fireEvent.click(
      screen.getByText("Выбрать тип")
    );

    fireEvent.click(
      screen.getByText("Выбрать дату")
    );

    expect(
      await screen.findByLabelText(
        "Загрузка..."
      )
    ).toBeInTheDocument();

  });

});