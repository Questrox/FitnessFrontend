import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { ConfirmProvider } from "material-ui-confirm";
import { useAuth } from "../context/AuthContext";
import { useSnackbar } from "../context/SnackbarContext";
import { apiClient } from "../api/apiClient";
import { TrainingDetails } from "../components/TrainingModals/TrainingDetails";

jest.mock("../context/AuthContext");
jest.mock("../context/SnackbarContext");
jest.mock("../api/apiClient");

jest.mock("../components/TrainingModals/ClientSelectDialog", () => ({
  ClientSelectDialog: () => <div>Client Select Dialog</div>,
}));

jest.mock("../components/TrainingModals/CoachSelectDialog", () => ({
  CoachSelectDialog: () => <div>Coach Select Dialog</div>,
}));

jest.mock("../components/TrainingModals/TrainingAttendanceList", () => ({
  TrainingAttendanceList: () => <div>Attendance List</div>,
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseSnackbar = useSnackbar as jest.Mock;

const mockTraining = {
  id: 1,
  startDate: new Date("2026-06-03T10:00:00"),
  endDate: new Date("2026-06-03T11:00:00"),
  reservationsCount: 2,
  trainingStatusId: 1,

  trainingType: {
    id: 1,
    name: "Йога",
    maxClients: 10,
    price: 1500,
    cashbackPercentage: 10,
  },

  coach: {
    id: 1,
    userId: "5",
    user: {
      fullName: "Иван Иванов",
    },
  },
};

const renderComponent = () => {
  return render(
    <ThemeProvider theme={createTheme()}>
      <ConfirmProvider>
        <TrainingDetails
          isOpen={true}
          onClose={jest.fn()}
          training={mockTraining as any}
          setTraining={jest.fn()}
          refreshTrainingList={jest.fn()}
          onCancelOrCompleteTraining={jest.fn()}
        />
      </ConfirmProvider>
    </ThemeProvider>
  );
};

describe("TrainingDetails", () => {

  beforeEach(() => {

    mockedUseSnackbar.mockReturnValue({
      showSnackbar: jest.fn(),
    });

    mockedUseAuth.mockReturnValue({
      userRole: "User",
      user: { userId: 99 },
    });

    (apiClient.checkReservationPossibility as jest.Mock)
      .mockResolvedValue("");

    (apiClient.getReservationsByTrainingId as jest.Mock)
      .mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("рендерит информацию о тренировке", async () => {

    renderComponent();

    expect(
      await screen.findByText("Йога")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Иван Иванов")
    ).toBeInTheDocument();

    expect(
      screen.getByText("1500 ₽")
    ).toBeInTheDocument();
  });

  test("shows booking button for User", async () => {

    renderComponent();

    expect(
      await screen.findByRole("button", { name: "Записаться" })
    ).toBeInTheDocument();
  });

  test("показывает кнопки администратора администратору", async () => {

    mockedUseAuth.mockReturnValue({
      userRole: "Admin",
      user: { userId: 1 },
    });

    renderComponent();

    expect(
      await screen.findByText("Выбрать клиента")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Сменить тренера")
    ).toBeInTheDocument();
  });

  test("показывает вкладки тренера", async () => {

    mockedUseAuth.mockReturnValue({
      userRole: "Coach",
      user: { userId: 5 },
    });

    renderComponent();

    expect(
      await screen.findByRole("tab", { name: "Информация" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("tab", { name: "Клиенты" })
    ).toBeInTheDocument();
  });

  test("переключается на вкладку клиентов", async () => {

    mockedUseAuth.mockReturnValue({
      userRole: "Coach",
      user: { userId: 5 },
    });

    renderComponent();

    fireEvent.click(
      await screen.findByRole("tab", {
        name: "Клиенты",
      })
    );

    expect(
      screen.getByText("Attendance List")
    ).toBeInTheDocument();
  });

  test("показывает кнопку отмены индивидуальной тренировки для тренера-создателя", async () => {

    mockedUseAuth.mockReturnValue({
      userRole: "Coach",
      user: { userId: "5" },
    });

    const individualTraining = {
      ...mockTraining,
      trainingType: {
        ...mockTraining.trainingType,
        maxClients: 1
      }
    };

    render(
      <ThemeProvider theme={createTheme()}>
        <ConfirmProvider>
          <TrainingDetails
            isOpen={true}
            onClose={jest.fn()}
            training={individualTraining as any}
            setTraining={jest.fn()}
            refreshTrainingList={jest.fn()}
            onCancelOrCompleteTraining={jest.fn()}
          />
        </ConfirmProvider>
      </ThemeProvider>
    );

    expect(
      await screen.findByText("Отменить тренировку")
    ).toBeInTheDocument();
  });

  test("тренеру не показывается кнопка отмены для групповой тренировки", async () => {

    mockedUseAuth.mockReturnValue({
        userRole: "Coach",
        user: { userId: "5" },
    });

    renderComponent();

    await waitFor(() => {

        expect(
        screen.queryByText("Отменить тренировку")
        ).not.toBeInTheDocument();

    });
    });

  test("не показывает кнопку отмены для обычного пользователя", async () => {

    renderComponent();

    await waitFor(() => {

      expect(
        screen.queryByText("Отменить тренировку")
      ).not.toBeInTheDocument();

    });
  });

  test("показывает 'Нет свободных мест'", async () => {

    const fullTraining = {
      ...mockTraining,
      reservationsCount: 10,
    };

    render(
      <ThemeProvider theme={createTheme()}>
        <ConfirmProvider>
          <TrainingDetails
            isOpen={true}
            onClose={jest.fn()}
            training={fullTraining as any}
            setTraining={jest.fn()}
            refreshTrainingList={jest.fn()}
            onCancelOrCompleteTraining={jest.fn()}
          />
        </ConfirmProvider>
      </ThemeProvider>
    );

    expect(
      await screen.findByText("Нет свободных мест")
    ).toBeInTheDocument();
  });

  test("показывает отмененный статус", async () => {

    const cancelledTraining = {
      ...mockTraining,
      trainingStatusId: 3,
    };

    render(
      <ThemeProvider theme={createTheme()}>
        <ConfirmProvider>
          <TrainingDetails
            isOpen={true}
            onClose={jest.fn()}
            training={cancelledTraining as any}
            setTraining={jest.fn()}
            refreshTrainingList={jest.fn()}
            onCancelOrCompleteTraining={jest.fn()}
          />
        </ConfirmProvider>
      </ThemeProvider>
    );

    expect(
      await screen.findByText("Тренировка отменена")
    ).toBeInTheDocument();
  });

  test("клиенту не показываются кнопки администратора", async () => {
    mockedUseAuth.mockReturnValue({
        userRole: "User",
        user: { userId: 99 },
    });

    renderComponent();

    await waitFor(() => {

        expect(
        screen.queryByText("Выбрать клиента")
        ).not.toBeInTheDocument();

        expect(
        screen.queryByText("Сменить тренера")
        ).not.toBeInTheDocument();

    });
    });

    test("тренеру не показываются кнопки администратора", async () => {

    mockedUseAuth.mockReturnValue({
        userRole: "Coach",
        user: { userId: "5" },
    });

    renderComponent();

    await waitFor(() => {

        expect(
        screen.queryByText("Выбрать клиента")
        ).not.toBeInTheDocument();

        expect(
        screen.queryByText("Сменить тренера")
        ).not.toBeInTheDocument();

    });
    });

    test("гостю не показывается кнопка записи на тренировку", async () => {

    mockedUseAuth.mockReturnValue({
        userRole: "",
        user: null,
    });

    renderComponent();

    await waitFor(() => {

        expect(
        screen.queryByRole("button", { name: "Записаться" })
        ).not.toBeInTheDocument();

        expect(
        screen.queryByRole("button", { name: "Записать клиента" })
        ).not.toBeInTheDocument();

    });
    });

    test("клиенту не показываются вкладки", async () => {

    mockedUseAuth.mockReturnValue({
        userRole: "User",
        user: { userId: 99 },
    });

    renderComponent();

    await waitFor(() => {

        expect(
        screen.queryByRole("tab", { name: "Информация" })
        ).not.toBeInTheDocument();

        expect(
        screen.queryByRole("tab", { name: "Клиенты" })
        ).not.toBeInTheDocument();

    });
    });

    test("гостю не показываются вкладки", async () => {

    mockedUseAuth.mockReturnValue({
        userRole: "",
        user: null,
    });

    renderComponent();

    await waitFor(() => {

        expect(
        screen.queryByRole("tab", { name: "Информация" })
        ).not.toBeInTheDocument();

        expect(
        screen.queryByRole("tab", { name: "Клиенты" })
        ).not.toBeInTheDocument();

    });
    });

    test("администратору показываются вкладки", async () => {

    mockedUseAuth.mockReturnValue({
        userRole: "Admin",
        user: { userId: 1 },
    });

    renderComponent();

    expect(
        await screen.findByRole("tab", {
        name: "Информация",
        })
    ).toBeInTheDocument();

    expect(
        screen.getByRole("tab", {
        name: "Клиенты",
        })
    ).toBeInTheDocument();
    });

    test("тренеру не показывается кнопка записи", async () => {

    mockedUseAuth.mockReturnValue({
        userRole: "Coach",
        user: { userId: "5" },
    });

    renderComponent();

    await waitFor(() => {

        expect(
        screen.queryByRole("button", {
            name: "Записаться",
        })
        ).not.toBeInTheDocument();

        expect(
        screen.queryByRole("button", {
            name: "Записать клиента",
        })
        ).not.toBeInTheDocument();

    });
    });

    test("администратору без выбранного клиента не показывается кнопка записи клиента", async () => {

    mockedUseAuth.mockReturnValue({
        userRole: "Admin",
        user: { userId: 1 },
    });

    renderComponent();

    await waitFor(() => {

        expect(
        screen.queryByRole("button", {
            name: "Записать клиента",
        })
        ).not.toBeInTheDocument();

    });
    });

});