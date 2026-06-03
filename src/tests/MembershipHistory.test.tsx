import { render, screen, fireEvent } from "@testing-library/react";
import { MembershipHistory } from "../components/ProfileTabs/MembershipHistory";

const today = new Date();

const activeMembership = {
  id: 1,
  startDate: new Date(today.getTime() - 86400000),
  endDate: new Date(today.getTime() + 86400000),

  membershipType: {
    name: "Годовой",
  },

  payment: {
    date: new Date("2026-01-01"),
    price: 48000,
  },
};

const futureMembership = {
  id: 2,
  startDate: new Date(today.getTime() + 86400000),
  endDate: new Date(today.getTime() + 86400000 * 30),

  membershipType: {
    name: "Квартальный",
  },

  payment: {
    date: new Date("2026-02-01"),
    price: 13000,
  },
};

const expiredMembership = {
  id: 3,
  startDate: new Date(today.getTime() - 86400000 * 30),
  endDate: new Date(today.getTime() - 86400000),

  membershipType: {
    name: "Пробный",
  },

  payment: {
    date: new Date("2026-03-01"),
    price: 5000,
  },
};

describe("MembershipHistory", () => {

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    Element.prototype.scrollIntoView = jest.fn();

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  test("показывает сообщение при отсутствии абонементов", () => {

    render(
      <MembershipHistory memberships={[]} />
    );

    expect(
      screen.getByText(
        "Пока что абонементов нет"
      )
    ).toBeInTheDocument();
  });

  test("отображает данные абонемента", () => {

    render(
      <MembershipHistory
        memberships={[activeMembership as any]}
      />
    );

    expect(
      screen.getByText("Годовой")
    ).toBeInTheDocument();

    expect(
      screen.getByText("48000 ₽")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Оплачено")
    ).toBeInTheDocument();
  });

  test("показывает статус 'Активный'", () => {

    render(
      <MembershipHistory
        memberships={[activeMembership as any]}
      />
    );

    expect(
      screen.getByText("Активный")
    ).toBeInTheDocument();
  });

  test("показывает статус 'Предстоящий'", () => {

    render(
      <MembershipHistory
        memberships={[futureMembership as any]}
      />
    );

    expect(
      screen.getByText("Предстоящий")
    ).toBeInTheDocument();
  });

  test("показывает статус 'Истекший'", () => {

    render(
      <MembershipHistory
        memberships={[expiredMembership as any]}
      />
    );

    expect(
      screen.getByText("Истекший")
    ).toBeInTheDocument();
  });

  test("отображает даты покупки и периода действия", () => {

    render(
      <MembershipHistory
        memberships={[activeMembership as any]}
      />
    );

    expect(
      screen.getByText(
        activeMembership.payment.date.toLocaleDateString()
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText((content) =>
        content.includes(
          activeMembership.startDate.toLocaleDateString()
        )
      )
    ).toBeInTheDocument();
  });

  test("показывает только 5 элементов на странице", () => {

    const memberships = Array.from(
      { length: 7 },
      (_, i) => ({
        id: i + 1,

        startDate: activeMembership.startDate,
        endDate: activeMembership.endDate,

        membershipType: {
          name: `Абонемент ${i + 1}`,
        },

        payment: {
          date: today,
          price: 1000,
        },
      })
    );

    render(
      <MembershipHistory
        memberships={memberships as any}
      />
    );

    expect(
      screen.getByText("Абонемент 1")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Абонемент 5")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Абонемент 6")
    ).not.toBeInTheDocument();
  });

  test("переключает страницу пагинации", () => {

    const memberships = Array.from(
      { length: 7 },
      (_, i) => ({
        id: i + 1,

        startDate: activeMembership.startDate,
        endDate: activeMembership.endDate,

        membershipType: {
          name: `Абонемент ${i + 1}`,
        },

        payment: {
          date: today,
          price: 1000,
        },
      })
    );

    render(
      <MembershipHistory
        memberships={memberships as any}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Go to page 2"
      })
    );

    expect(
      screen.getByText("Абонемент 6")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Абонемент 7")
    ).toBeInTheDocument();
  });

  test("вызывает scrollIntoView при смене страницы", () => {

    const scrollMock = jest.fn();

    Element.prototype.scrollIntoView = scrollMock;

    const memberships = Array.from(
      { length: 7 },
      (_, i) => ({
        id: i + 1,

        startDate: activeMembership.startDate,
        endDate: activeMembership.endDate,

        membershipType: {
          name: `Абонемент ${i + 1}`,
        },

        payment: {
          date: today,
          price: 1000,
        },
      })
    );

    render(
      <MembershipHistory
        memberships={memberships as any}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Go to page 2"
      })
    );

    expect(
      scrollMock
    ).toHaveBeenCalled();
  });

});