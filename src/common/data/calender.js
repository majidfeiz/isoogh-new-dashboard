const events = [
  {
    id: 1,
    title: "[جشن تولد]",
    start: new Date().setDate(new Date().getDate() + 1),
    className: "bg-success text-white",
  },
  {
    id: 2,
    title: "ملاقات",
    start: new Date(),
    end: new Date(),
    className: "bg-success text-white",
  },
  {
    id: 3,
    title: "جستجو در گوگل",
    start: new Date().setDate(new Date().getDate() + 18),
    className: "bg-dark text-white",
  },
  {
    id: 4,
    title: "رویداد های تمام روز",
    start: new Date().setDate(new Date().getDate() - 9),
    className: "bg-primary text-white",
  },
  {
    id: 5,
    title: "رویداد تکراری",
    start: new Date().setDate(new Date().getDate() - 3),
    className: "bg-info text-white",
  },
  {
    id: 6,
    title: "ناهار",
    start: new Date().setDate(new Date().getDate()),
    className: "bg-danger text-white",
  },
  {
    id: 7,
    title: "رویداد تکراری",
    start: new Date().setDate(new Date().getDate() + 4),
    className: "bg-primary text-white",
  },
  {
    id: 8,
    title: "رویداد طولانی",
    start: new Date().setDate(new Date().getDate() - 5),
    end: new Date().setDate(new Date().getDate() - 3),
    className: "bg-warning text-white",
  },
];

const calenderDefaultCategories = [
  {
    id: 1,
    title: "برنامه ریزی رویداد جدید",
    type: "bg-success",
  },
  {
    id: 2,
    title: "ملاقات",
    type: "bg-info",
  },
  {
    id: 3,
    title: "تولید گزارش ها",
    type: "bg-warning",
  },
  {
    id: 4,
    title: "ایجاد تم جدید",
    type: "bg-danger",
  },
];

export { calenderDefaultCategories, events }
