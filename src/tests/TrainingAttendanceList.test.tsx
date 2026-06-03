import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { TrainingAttendanceList } from "../components/TrainingModals/TrainingAttendanceList";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext");

const mockedUseAuth = useAuth as jest.Mock;

const mockTraining = {
  id: 1,
  trainingStatusId: 1,
  coach: {
    userId: "5",
  },
};

const mockReservations = [
  {
    id: 1,
    reservationStatusId: 1,
    user: {
      fullName: "Иван Иванов",
      userName: "ivanov",
      phoneNumber: "79999999999",
    },
  },
  {
    id: 2,
    reservationStatusId: 2,
    user: {
      fullName: "Петр Петров",
      userName: "petrov",
      phoneNumber: "78888888888",
    },
  },
];

const renderComponent = (
  training = mockTraining,
  reservations : any[] | null = mockReservations
) => {

  return render(
    <ThemeProvider theme={createTheme()}>
      <TrainingAttendanceList
        training={training as any}
        reservations={reservations as any}
        onConfirmAttendance={jest.fn()}
        onMarkCompleted={jest.fn()}
      />
    </ThemeProvider>
  );
};

describe("TrainingAttendanceList", () => {

  beforeEach(() => {

    mockedUseAuth.mockReturnValue({
      userRole: "Coach",
      user: { userId: "5" },
    });

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("показывает индикатор загрузки при отсутствии данных", () => {

    renderComponent(mockTraining, null);

    expect(
      screen.getByRole("progressbar")
    ).toBeInTheDocument();

  });

  test("отображает список клиентов", () => {

    renderComponent();

    expect(
      screen.getByText("Иван Иванов")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Петр Петров")
    ).toBeInTheDocument();

  });

  test("отображает счетчик подтвержденных посещений", () => {

    renderComponent();

    expect(
      screen.getByText(/1 \/ 2/)
    ).toBeInTheDocument();

  });

  test("отображает сообщение об отсутствии клиентов", () => {

    renderComponent(mockTraining, []);

    expect(
      screen.getByText("Нет записанных клиентов")
    ).toBeInTheDocument();

  });

  test("тренеру показывается кнопка завершения тренировки", () => {

    renderComponent();

    expect(
      screen.getByRole("button", {
        name: "Завершить тренировку",
      })
    ).toBeInTheDocument();

  });

  test("кнопка завершения вызывает callback", () => {

    const onMarkCompleted = jest.fn();

    render(
      <ThemeProvider theme={createTheme()}>
        <TrainingAttendanceList
          training={mockTraining as any}
          reservations={mockReservations as any}
          onConfirmAttendance={jest.fn()}
          onMarkCompleted={onMarkCompleted}
        />
      </ThemeProvider>
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Завершить тренировку",
      })
    );

    expect(onMarkCompleted).toHaveBeenCalledTimes(1);

  });

  test("тренер может отметить посещение", () => {

    const onConfirmAttendance = jest.fn();

    render(
      <ThemeProvider theme={createTheme()}>
        <TrainingAttendanceList
          training={mockTraining as any}
          reservations={mockReservations as any}
          onConfirmAttendance={onConfirmAttendance}
          onMarkCompleted={jest.fn()}
        />
      </ThemeProvider>
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Отметить посещение",
      })
    );

    expect(onConfirmAttendance).toHaveBeenCalledWith(1);

  });

  test("подтвержденное посещение отображается корректно", () => {

    renderComponent();

    expect(
      screen.getByText("Посещение отмечено")
    ).toBeInTheDocument();

  });

  test("для статуса 'не пришел' отображается правильный текст", () => {

    const reservations = [
      {
        id: 1,
        reservationStatusId: 5,
        user: {
          fullName: "Иван Иванов",
          userName: "ivanov",
          phoneNumber: "79999999999",
        },
      },
    ];

    renderComponent(mockTraining, reservations);

    expect(
      screen.getByText("Клиент не пришел")
    ).toBeInTheDocument();

  });

  test("клиенту недоступно подтверждение посещения", () => {

    mockedUseAuth.mockReturnValue({
      userRole: "User",
      user: { userId: 10 },
    });

    renderComponent();

    expect(
      screen.getByRole("button", {
        name: "Отметить посещение",
      })
    ).toBeDisabled();

  });

  test("гостю недоступно подтверждение посещения", () => {

    mockedUseAuth.mockReturnValue({
      userRole: "",
      user: null,
    });

    renderComponent();

    expect(
      screen.getByRole("button", {
        name: "Отметить посещение",
      })
    ).toBeDisabled();

  });

  test("чужой тренер не может подтверждать посещение", () => {

    mockedUseAuth.mockReturnValue({
      userRole: "Coach",
      user: { userId: "999" },
    });

    renderComponent();

    expect(
      screen.getByRole("button", {
        name: "Отметить посещение",
      })
    ).toBeDisabled();

  });

  test("клиенту недоступно завершение тренировки", () => {

    mockedUseAuth.mockReturnValue({
      userRole: "User",
      user: { userId: 1 },
    });

    renderComponent();

    expect(
      screen.getByRole("button", {
        name: "Завершить тренировку",
      })
    ).toBeDisabled();

  });

  test("гостю недоступно завершение тренировки", () => {

    mockedUseAuth.mockReturnValue({
      userRole: "",
      user: null,
    });

    renderComponent();

    expect(
      screen.getByRole("button", {
        name: "Завершить тренировку",
      })
    ).toBeDisabled();

  });

  test("чужой тренер не может завершить тренировку", () => {

    mockedUseAuth.mockReturnValue({
      userRole: "Coach",
      user: { userId: "999" },
    });

    renderComponent();

    expect(
      screen.getByRole("button", {
        name: "Завершить тренировку",
      })
    ).toBeDisabled();

  });

  test("для проведенной тренировки отображается правильный статус кнопки", () => {

    renderComponent({
      ...mockTraining,
      trainingStatusId: 2,
    });

    expect(
      screen.getByRole("button", {
        name: "Тренировка проведена",
      })
    ).toBeInTheDocument();

  });

  test("для отмененной тренировки отображается правильный статус кнопки", () => {

    renderComponent({
      ...mockTraining,
      trainingStatusId: 3,
    });

    expect(
      screen.getByRole("button", {
        name: "Тренировка отменена",
      })
    ).toBeInTheDocument();

  });

  test("для отмененной тренировки не показывается сводка посещений", () => {

    renderComponent({
      ...mockTraining,
      trainingStatusId: 3,
    });

    expect(
      screen.queryByText(/Отмеченных клиентов/)
    ).not.toBeInTheDocument();

  });

});