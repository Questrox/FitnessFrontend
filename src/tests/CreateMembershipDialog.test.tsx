import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import { apiClient } from "../api/apiClient";
import { CreateMembershipDialog } from "../components/ProfileTabs/CreateMembershipDialog";

jest.mock("../api/apiClient");

jest.mock("@mui/x-date-pickers/DatePicker", () => {
  const mockDayjs = require("dayjs");
  return {
    DatePicker: ({ value, onChange }: any) => (
      <input
        data-testid="date-picker"
        value={value?.format?.("YYYY-MM-DD") ?? ""}
        onChange={() => onChange(mockDayjs().add(1, "day"))}
      />
    ),
  };
});

jest.mock("../components/ProfileTabs/PaymentForm", () => ({
  PaymentForm: ({
    onConfirm,
    onBack,
    extraInfo,
  }: any) => (
    <div>
      <div>Payment Form</div>
      {extraInfo}
      <button onClick={onConfirm}>Подтвердить оплату</button>
      <button onClick={onBack}>Назад</button>
    </div>
  ),
}));

const membershipTypes = [
  {
    id: 1,
    name: "Стандарт",
    price: 5000,
    cashbackPercentage: 10,
    duration: 1,
  },
];

const selectedClient = {
  id: 1,
  bonuses: 250,
  user: {
    fullName: "Иван Иванов",
  },
};

const renderComponent = (props = {}) => {
  return render(
    <CreateMembershipDialog
      open={true}
      onClose={jest.fn()}
      membershipTypes={membershipTypes as any}
      selectedClient={selectedClient as any}
      error=""
      setError={jest.fn()}
      onSuccess={jest.fn()}
      {...props}
    />
  );
};

describe("CreateMembershipDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    (apiClient.checkMembershipOverlap as jest.Mock)
      .mockResolvedValue([]);

    (apiClient.addMembership as jest.Mock)
      .mockResolvedValue({});
  });

  test("не рендерится без выбранного клиента", () => {
    const { container } = render(
      <CreateMembershipDialog
        open={true}
        onClose={jest.fn()}
        membershipTypes={membershipTypes as any}
        selectedClient={undefined}
        error=""
        setError={jest.fn()}
        onSuccess={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test("отображает форму создания", () => {
    renderComponent();

    expect(
      screen.getByText(/Оформление абонемента/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText("Далее")
    ).toBeInTheDocument();
  });

  test("показывает ошибку если тип не выбран", async () => {
    const setError = jest.fn();

    renderComponent({ setError });

    fireEvent.click(
      screen.getByRole("button", { name: "Далее" })
    );

    expect(setError).toHaveBeenCalledWith(
      "Необходимо выбрать тип абонемента"
    );
  });

  test("отображает предупреждение о пересекающихся абонементах", async () => {

    (apiClient.checkMembershipOverlap as jest.Mock)
      .mockResolvedValue([
        {
          id: 2,
          startDate: new Date(),
          endDate: dayjs().add(1, "month").toDate(),
          membershipType: {
            name: "VIP",
          },
        },
      ]);

    renderComponent();

    const combo = screen.getByRole("combobox");

    await userEvent.click(combo);

    await userEvent.click(
      await screen.findByText(/Стандарт/)
    );

    fireEvent.change(
      screen.getByTestId("date-picker")
    );

    expect(
      await screen.findByText(
        /У клиента уже есть абонементы/
      )
    ).toBeInTheDocument();
  });

  test("переходит на шаг подтверждения", async () => {
    renderComponent();

    const combo = screen.getByRole("combobox");

    await userEvent.click(combo);

    await userEvent.click(
        await screen.findByText(/Стандарт/)
    );

    const datePicker = screen.getByTestId("date-picker");
    fireEvent.change(datePicker, { target: { value: dayjs().add(1, "day").format("YYYY-MM-DD") } });

    await waitFor(() => {
        expect(
            screen.getByRole("button", { name: "Далее" })
        ).not.toBeDisabled();
    });

    fireEvent.click(
        screen.getByRole("button", { name: "Далее" })
    );
    
    expect(
        await screen.findByText("Payment Form")
    ).toBeInTheDocument();

    expect(
        screen.getByText("Детали абонемента")
    ).toBeInTheDocument();
  });

  test("создает абонемент после подтверждения", async () => {
    const onSuccess = jest.fn();

    renderComponent({ onSuccess });

    const combo = screen.getByRole("combobox");

    await userEvent.click(combo);

    await userEvent.click(
        await screen.findByText(/Стандарт/)
    );

    const datePicker = screen.getByTestId("date-picker");
    fireEvent.change(datePicker, { target: { value: dayjs().add(1, "day").format("YYYY-MM-DD") } });

    await waitFor(() => {
        expect(
            screen.getByRole("button", { name: "Далее" })
        ).not.toBeDisabled();
    });

    fireEvent.click(
        screen.getByRole("button", { name: "Далее" })
    );

    expect(
        await screen.findByText("Payment Form")
    ).toBeInTheDocument();

    fireEvent.click(
        await screen.findByText("Подтвердить оплату")
    );

    await waitFor(() => {
        expect(apiClient.addMembership).toHaveBeenCalled();
  });

    expect(onSuccess).toHaveBeenCalled();
    });

  test("возвращается назад из шага оплаты", async () => {
    renderComponent();

    const combo = screen.getByRole("combobox");

    await userEvent.click(combo);

    await userEvent.click(
        await screen.findByText(/Стандарт/)
    );

    const datePicker = screen.getByTestId("date-picker");
    fireEvent.change(datePicker, { target: { value: dayjs().add(1, "day").format("YYYY-MM-DD") } });

    await waitFor(() => {
        expect(
            screen.getByRole("button", { name: "Далее" })
        ).not.toBeDisabled();
    });

    fireEvent.click(
        screen.getByRole("button", { name: "Далее" })
    );

    expect(
        await screen.findByText("Payment Form")
    ).toBeInTheDocument();

    fireEvent.click(
        await screen.findByText("Назад")
    );

    expect(
        await screen.findByText("Далее")
    ).toBeInTheDocument();
  });

  test("вызывает onClose при отмене", () => {

    const onClose = jest.fn();

    renderComponent({ onClose });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Отмена",
      })
    );

    expect(onClose).toHaveBeenCalled();
  });
});