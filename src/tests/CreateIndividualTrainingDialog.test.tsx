import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import dayjs from "dayjs";

import { CreateIndividualTrainingDialog } from "../components/TrainingModals/CreateIndividualTrainingDialog";
import { apiClient } from "../api/apiClient";

jest.mock("../api/apiClient");

jest.mock("../components/TrainingModals/CreateTrainingBase", () => ({
  CreateTrainingBase: ({ setTrainingType, setStartDateTime }: any) => (
    <div>
      <button data-testid="select-type" onClick={() => setTrainingType({ id: 1, name: "Йога", duration: 60 })}>
        Выбрать тип
      </button>

      <button data-testid="select-date" onClick={() => setStartDateTime(require("dayjs")().add(1, "day"))}>
        Выбрать дату
      </button>

      <button data-testid="select-past-date" onClick={() => setStartDateTime(require("dayjs")().subtract(1, "day"))}>
        Выбрать прошедшую дату
      </button>
    </div>
  ),
}));

jest.mock("../components/TrainingModals/ClientSelectDialog", () => ({
  ClientSelectDialog: ({ open, onSelect }: any) =>
    open ? (
      <div>
        <button
          data-testid="select-client"
          onClick={() =>
            onSelect({
              id: 1,
              user: {
                fullName: "Иван Иванов",
              },
            })
          }
        >
          Выбрать клиента
        </button>
      </div>
    ) : null,
}));

const mockTrainingTypes = [
  {
    id: 1,
    name: "Йога",
    duration: 60,
  },
];

const renderComponent = () => {
  return render(
    <ThemeProvider theme={createTheme()}>
      <CreateIndividualTrainingDialog
        isOpen={true}
        onClose={jest.fn()}
        trainingTypes={mockTrainingTypes as any}
        onSuccess={jest.fn()}
        selectedDay={dayjs()}
      />
    </ThemeProvider>
  );
};

describe("CreateIndividualTrainingDialog", () => {
  beforeEach(() => {
    (apiClient.checkIndividualTrainingCreationPossibility as jest.Mock).mockResolvedValue("");
    (apiClient.addIndividualTraining as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("рендерит диалог создания индивидуальной тренировки", () => {
    renderComponent();
    expect(screen.getByText("Индивидуальная тренировка")).toBeInTheDocument();
  });

  test("кнопка создания изначально заблокирована", () => {
    renderComponent();
    expect(screen.getByRole("button", { name: "Создать" })).toBeDisabled();
  });

  test("после выбора клиента отображается его имя", async () => {
    renderComponent();
    
    fireEvent.click(screen.getByTestId("select-type"));
    fireEvent.click(screen.getByTestId("select-date"));
    
    fireEvent.click(screen.getByText("Выбрать клиента"));
    fireEvent.click(screen.getByTestId("select-client"));
    
    await waitFor(() => {
      expect(screen.getByText("Клиент: Иван Иванов")).toBeInTheDocument();
    });
  });

  test("проверяет возможность создания после заполнения формы", async () => {
    renderComponent();
    
    fireEvent.click(screen.getByTestId("select-type"));
    fireEvent.click(screen.getByTestId("select-date"));
    
    fireEvent.click(screen.getByText("Выбрать клиента"));
    fireEvent.click(screen.getByTestId("select-client"));
    
    await waitFor(() => {
      expect(apiClient.checkIndividualTrainingCreationPossibility).toHaveBeenCalled();
    });
  });

  test("показывает сообщение ошибки проверки", async () => {
    (apiClient.checkIndividualTrainingCreationPossibility as jest.Mock).mockResolvedValue("Клиент уже занят");
    
    renderComponent();
    
    fireEvent.click(screen.getByTestId("select-type"));
    fireEvent.click(screen.getByTestId("select-date"));
    
    fireEvent.click(screen.getByText("Выбрать клиента"));
    fireEvent.click(screen.getByTestId("select-client"));
    
    await waitFor(() => {
      expect(screen.getByText("Клиент уже занят")).toBeInTheDocument();
    });
  });

  test("показывает ошибку создания при выборе даты в прошлом", async () => {
    renderComponent();
    
    fireEvent.click(screen.getByTestId("select-type"));
    fireEvent.click(screen.getByTestId("select-past-date"));
    
    fireEvent.click(screen.getByText("Выбрать клиента"));
    fireEvent.click(screen.getByTestId("select-client"));
    
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));
    
    await waitFor(() => {
      expect(screen.getByText("Нельзя создать тренировку в прошлом")).toBeInTheDocument();
    });
  });

  test("показывает backend ошибку создания", async () => {
    (apiClient.checkIndividualTrainingCreationPossibility as jest.Mock).mockResolvedValue("");
    (apiClient.addIndividualTraining as jest.Mock).mockRejectedValue(new Error("Ошибка создания"));
    
    renderComponent();
    
    fireEvent.click(screen.getByTestId("select-type"));
    fireEvent.click(screen.getByTestId("select-date"));
    
    fireEvent.click(screen.getByText("Выбрать клиента"));
    fireEvent.click(screen.getByTestId("select-client"));
    
    await waitFor(() => {
        expect(apiClient.checkIndividualTrainingCreationPossibility).toHaveBeenCalled();
    });
    
    await waitFor(() => {
        expect(screen.getByRole("button", { name: "Создать" })).not.toBeDisabled();
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));
    
    await waitFor(() => {
        expect(screen.getByText("Ошибка создания")).toBeInTheDocument();
    });
  });

  test("успешно создает индивидуальную тренировку", async () => {
    const onSuccess = jest.fn();
    const onClose = jest.fn();

    render(
        <ThemeProvider theme={createTheme()}>
        <CreateIndividualTrainingDialog
            isOpen={true}
            onClose={onClose}
            trainingTypes={mockTrainingTypes as any}
            onSuccess={onSuccess}
            selectedDay={dayjs()}
        />
        </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId("select-type"));
    fireEvent.click(screen.getByTestId("select-date"));
    
    fireEvent.click(screen.getByText("Выбрать клиента"));
    fireEvent.click(screen.getByTestId("select-client"));
    
    await waitFor(() => {
        expect(apiClient.checkIndividualTrainingCreationPossibility).toHaveBeenCalled();
    });
    
    await waitFor(() => {
        expect(screen.getByRole("button", { name: "Создать" })).not.toBeDisabled();
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));

    await waitFor(() => {
        expect(apiClient.addIndividualTraining).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });
  });

  test("кнопка создания блокируется при наличии сообщения проверки", async () => {
    (apiClient.checkIndividualTrainingCreationPossibility as jest.Mock).mockResolvedValue("Невозможно создать");

    renderComponent();
    
    fireEvent.click(screen.getByTestId("select-type"));
    fireEvent.click(screen.getByTestId("select-date"));
    
    fireEvent.click(screen.getByText("Выбрать клиента"));
    fireEvent.click(screen.getByTestId("select-client"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Создать" })).toBeDisabled();
    });
  });

  test("вызывает onClose при нажатии отмены", () => {
    const onClose = jest.fn();

    render(
      <ThemeProvider theme={createTheme()}>
        <CreateIndividualTrainingDialog
          isOpen={true}
          onClose={onClose}
          trainingTypes={mockTrainingTypes as any}
          onSuccess={jest.fn()}
          selectedDay={dayjs()}
        />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("Отмена"));
    expect(onClose).toHaveBeenCalled();
  });
});