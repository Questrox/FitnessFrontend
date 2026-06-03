import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentForm } from "../components/ProfileTabs/PaymentForm";

const renderComponent = (props = {}) => {
  return render(
    <PaymentForm
      price={5000}
      cashbackPercentage={10}
      clientBonuses={1000}
      bonuses={0}
      setBonuses={jest.fn()}
      onConfirm={jest.fn()}
      {...props}
    />
  );
};

describe("PaymentForm", () => {

  test("отображает основную информацию об оплате", () => {

    renderComponent();

    expect(
      screen.getAllByText("Оплата")[0]
    ).toBeInTheDocument();

    expect(
      screen.getByText("Цена")
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("5000")[0]
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("500")[0]
    ).toBeInTheDocument();
  });

  test("отображает пользовательский заголовок", () => {

    renderComponent({
      title: "Оплата абонемента"
    });

    expect(
      screen.getByText("Оплата абонемента")
    ).toBeInTheDocument();
  });

  test("показывает extraInfo", () => {

    renderComponent({
      extraInfo: <div>Дополнительная информация</div>
    });

    expect(
      screen.getByText("Дополнительная информация")
    ).toBeInTheDocument();
  });

  test("показывает ошибку", () => {

    renderComponent({
      error: "Ошибка оплаты"
    });

    expect(
      screen.getByText("Ошибка оплаты")
    ).toBeInTheDocument();
  });

  test("вызывает onConfirm при подтверждении оплаты", async () => {

    const onConfirm = jest.fn();

    renderComponent({ onConfirm });

    await act(async () => {
    await userEvent.click(
      screen.getByRole("button", {
        name: "Подтвердить оплату",
      })
    );
  });

    expect(onConfirm).toHaveBeenCalled();
  });

  test("отображает кнопку назад и вызывает onBack", async () => {

    const onBack = jest.fn();

    renderComponent({ onBack });

    const buttons = screen.getAllByText("Назад");

    expect(buttons.length).toBeGreaterThan(0);

    await act(async () => {
        await userEvent.click(buttons[0]);
    });

    expect(onBack).toHaveBeenCalled();
  });

  test("не отображает кнопку назад без onBack", () => {

    renderComponent();

    expect(
      screen.queryByText("Назад")
    ).not.toBeInTheDocument();
  });

  test("вызывает setBonuses при ручном вводе бонусов", async () => {

    const setBonuses = jest.fn();

    renderComponent({
      setBonuses,
    });

    const input = screen.getByRole("spinbutton");

    await userEvent.clear(input);
    await userEvent.type(input, "700");

    expect(setBonuses)
      .toHaveBeenCalledWith(700);
  });

  test("не позволяет ввести бонусов больше цены", async () => {

    const setBonuses = jest.fn();

    renderComponent({
      setBonuses,
      clientBonuses: 10000,
      price: 5000,
    });

    const input = screen.getByRole("spinbutton");

    await userEvent.clear(input);
    await userEvent.type(input, "8000");

    expect(setBonuses)
      .toHaveBeenCalledWith(5000);
  });

  test("не позволяет ввести бонусов больше доступного количества", async () => {

    const setBonuses = jest.fn();

    renderComponent({
      setBonuses,
      clientBonuses: 300,
    });

    const input = screen.getByRole("spinbutton");

    await userEvent.clear(input);
    await userEvent.type(input, "900");

    expect(setBonuses)
      .toHaveBeenCalledWith(300);
  });

  test("не позволяет ввести отрицательное количество бонусов", async () => {

    const setBonuses = jest.fn();

    renderComponent({
      setBonuses,
    });

    const input = screen.getByRole("spinbutton");

    await userEvent.clear(input);
    await userEvent.type(input, "-100");

    expect(setBonuses)
      .toHaveBeenCalledWith(0);
  });

  test("кнопка 'Использовать все бонусы' устанавливает максимум", async () => {

    const setBonuses = jest.fn();

    renderComponent({
      setBonuses,
      clientBonuses: 800,
      price: 5000,
    });

    await act(async () => {
      await userEvent.click(
        screen.getByText("Использовать все бонусы")
      );
    });

    expect(setBonuses)
      .toHaveBeenCalledWith(800);
  });

  test("кнопка 'Использовать все бонусы' ограничивается ценой", async () => {

    const setBonuses = jest.fn();

    renderComponent({
      setBonuses,
      clientBonuses: 10000,
      price: 5000,
    });

    await act(async () => {
      await userEvent.click(
        screen.getByText("Использовать все бонусы")
      );
    });

    expect(setBonuses)
      .toHaveBeenCalledWith(5000);
  });

  test("правильно отображает итоговую цену", () => {

    renderComponent({
      bonuses: 700,
    });

    expect(
      screen.getByText("4300")
    ).toBeInTheDocument();
  });
});