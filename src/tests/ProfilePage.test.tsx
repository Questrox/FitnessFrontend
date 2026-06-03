import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/apiClient";
import ProfilePage from "../components/Pages/ProfilePage";

jest.mock("../context/AuthContext");
jest.mock("../api/apiClient");

jest.mock("material-ui-confirm", () => ({
  useConfirm: () => jest.fn().mockResolvedValue({ confirmed: true }),
}));

jest.mock("../components/ProfileTabs/ProfileInfo", () => ({
  ProfileInfo: () => <div>ProfileInfo</div>,
}));

jest.mock("../components/ProfileTabs/MembershipHistory", () => ({
  MembershipHistory: () => <div>MembershipHistory</div>,
}));

jest.mock("../components/ProfileTabs/ReservationHistory", () => ({
  ReservationHistory: () => <div>ReservationHistory</div>,
}));

jest.mock("../components/ProfileTabs/CreateMembershipDialog", () => ({
  CreateMembershipDialog: () => (
    <div>CreateMembershipDialog</div>
  ),
}));

jest.mock("../components/AdminTabs/CredentialsPrint", () => ({
  CredentialsPrint: ({ username }: any) => (
    <div>Credentials: {username}</div>
  ),
}));

const mockedUseAuth = useAuth as jest.Mock;

const mockClient = {
  id: 1,
  userId: 10,
  bonuses: 100,
  user: {
    id: 10,
    fullName: "Иван Иванов",
    userName: "ivan",
  },
  memberships: [],
  trainingReservations: [],
};

const renderComponent = (
  route = "/profile",
  path = "/profile"
) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={<ProfilePage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("ProfilePage", () => {

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockedUseAuth.mockReturnValue({
      userRole: "User",
    });

    (apiClient.getCurrentClient as jest.Mock)
      .mockResolvedValue(mockClient);

    (apiClient.getMembershipTypes as jest.Mock)
      .mockResolvedValue([]);

    (apiClient.getCurrentUser as jest.Mock)
      .mockResolvedValue({
        id: 1,
        userName: "admin"
      });

    (apiClient.getClientById as jest.Mock)
      .mockResolvedValue(mockClient);

    (apiClient.generateNewCredentials as jest.Mock)
      .mockResolvedValue({
        userName: "newlogin",
        password: "123456",
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("показывает индикатор загрузки", async () => {

    renderComponent();

    expect(
      screen.getByRole("progressbar")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("ProfileInfo")
      ).toBeInTheDocument();
    });
  });

  test("показывает вкладки пользователю", async () => {

    renderComponent();

    expect(
      await screen.findByRole("tab", {
        name: "Профиль"
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("tab", {
        name: "Абонементы"
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("tab", {
        name: "Записи"
      })
    ).toBeInTheDocument();
  });

  test("не показывает кнопки администратора обычному пользователю", async () => {

    renderComponent();

    await waitFor(() => {

      expect(
        screen.queryByText("Сгенерировать данные для входа")
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText("Оформить абонемент")
      ).not.toBeInTheDocument();
    });
  });

  test("показывает кнопки администратора при просмотре профиля клиента", async () => {

    mockedUseAuth.mockReturnValue({
      userRole: "Admin",
    });

    renderComponent("/profiles/1", "/profiles/:id");

    expect(
      await screen.findByText(
        "Сгенерировать данные для входа"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("Оформить абонемент")
    ).toBeInTheDocument();
  });

  test("показывает вкладки администратору при просмотре клиента", async () => {

    mockedUseAuth.mockReturnValue({
      userRole: "Admin",
    });

    renderComponent("/profiles/1", "/profiles/:id");

    expect(
      await screen.findByRole("tab", {
        name: "Профиль"
      })
    ).toBeInTheDocument();
  });

  test("не показывает вкладки тренеру", async () => {

    mockedUseAuth.mockReturnValue({
      userRole: "Coach",
    });

    renderComponent();

    await waitFor(() => {

      expect(
        screen.queryByRole("tab", {
          name: "Профиль"
        })
      ).not.toBeInTheDocument();
    });
  });

  test("тренер загружает текущего пользователя", async () => {

    mockedUseAuth.mockReturnValue({
      userRole: "Coach",
    });

    renderComponent();

    await waitFor(() => {

      expect(
        apiClient.getCurrentUser
      ).toHaveBeenCalled();
    });
  });

  test("администратор загружает клиента по id", async () => {

    mockedUseAuth.mockReturnValue({
      userRole: "Admin",
    });

    renderComponent("/profiles/15", "/profiles/:id");

    await waitFor(() => {

      expect(
        apiClient.getClientById
      ).toHaveBeenCalledWith(15);
    });
  });

  test("открывает вкладку из query параметра", async () => {

    renderComponent("/profile?tab=memberships");

    expect(
      await screen.findByText(
        "MembershipHistory"
      )
    ).toBeInTheDocument();
  });

  test("переключается на вкладку записей", async () => {

    renderComponent();

    fireEvent.click(
      await screen.findByRole("tab", {
        name: "Записи"
      })
    );

    expect(
      screen.getByText("ReservationHistory")
    ).toBeInTheDocument();
  });

  test("генерирует новые данные для входа", async () => {

    mockedUseAuth.mockReturnValue({
      userRole: "Admin",
    });

    renderComponent("/profiles/1", "/profiles/:id");

    fireEvent.click(
      await screen.findByText(
        "Сгенерировать данные для входа"
      )
    );

    await waitFor(() => {

      expect(
        apiClient.generateNewCredentials
      ).toHaveBeenCalled();

      expect(
        screen.getByText(
          "Credentials: newlogin"
        )
      ).toBeInTheDocument();
    });
  });

  test("открывает диалог оформления абонемента", async () => {

    mockedUseAuth.mockReturnValue({
      userRole: "Admin",
    });

    renderComponent("/profiles/1", "/profiles/:id");

    expect(
      await screen.findByText(
        "CreateMembershipDialog"
      )
    ).toBeInTheDocument();
  });

});