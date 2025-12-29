const TopSellingData = [
  {
    id: "jan",
    jan: [
      {
        name: "محصول A",
        desc: "محصول پرفروش این ماه",
        value: 37,
      },
      {
        name: "محصول B",
        desc: "محصول چند منظوره",
        value: 72,
      },
      {
        name: "محصول C",
        desc: "محصول چند منظوره",
        value: 54,
      },
    ],
  },
  {
    id: "dec",
    dec: [
      {
        name: "محصول D",
        desc: "بهترین محصول این ماه",
        value: 18,
      },
      {
        name: "محصول E",
        desc: "پرفروش ترین محصول این ماه",
        value: 51,
      },
      {
        name: "محصول F",
        desc: "با پشتیبانی یک ماهه",
        value: 48,
      },
    ],
  },
  {
    id: "nov",
    nov: [
      {
        name: "محصول G",
        desc: "جدید ترین محصول",
        value: 27,
      },
      {
        name: "محصول H",
        desc: "با کیفیت ترین  محصول",
        value: 75,
      },
      {
        name: "محصول I",
        desc: "با پشتیبانی یک ماهه",
        value: 39,
      },
    ],
  },
  {
    id: "oct",
    oct: [
      {
        name: "محصول J",
        desc: "بهترین محصول",
        value: 56,
      },
      {
        name: "محصول K",
        desc: "با کیفیت ترین محصول",
        value: 41,
      },
      {
        name: "محصول L",
        desc: "پرفروش ترین",
        value: 20,
      },
    ],
  },
];


const dashboardEarning = [
    {
        id: "jan",
        jan: [31, 40, 36, 51, 49, 72, 69, 56, 68, 82, 68, 76]
    },
    {
        id: "dec",
        dec: [42, 19, 32, 51, 49, 44, 14, 56, 68, 82, 68, 60]
    },
    {
        id: "nov",
        nov: [31, 40, 30, 51, 49, 72, 69, 15, 35, 42, 18, 70]
    },
    {
        id: "oct",
        oct: [31, 40, 49, 44, 14, 56, 69, 31, 40, 36, 51, 40]
    },
]

const chatData = [
  {
    id: 1,
    name: "سارا توسلی",
    msg: "سلام!",
    time: "10.00",
    lastChat: false,
    isSender: false,
  },
  {
    id: 2,
    name: "ادمین",
    msg: "سلام. چطوری؟ چه خبر از جلسه ی بعد ؟",
    time: "10.02",
    lastChat: false,
    isSender: true,
  },
  {
    id: 3,
    name: "سارا توسلی",
    msg: " همه چی خوبه",
    time: "10.06",
    lastChat: false,
    isSender: false,
  },
  {
    id: 4,
    name: "سارا توسلی",
    msg: "و جلسه بعدی فردا ساعت 10 صبح",
    time: "10.06",
    lastChat: true,
    isSender: false,
  },
  {
    id: 5,
    name: "ادمین",
    msg: "وای خیلی عالیه",
    time: "10.07",
    lastChat: false,
    isSender: true,
  },
];

const tasksData = [
  {
    id: 1,
    task: "داشبورد Skote Saas",
    assignedTo: "علی",
  },
  {
    id: 2,
    task: "رابط کاربری جدید ",
    assignedTo: "تیم A",
  },
  {
    id: 3,
    task: "طراحی لوگوی برند",
    assignedTo: "هلیا",
  },
  {
    id: 4,
    task: "رابط کاربری قالب وبلاگ",
    assignedTo: "دیانا",
  },
  {
    id: 5,
    task: "لندینگ پیج چند مظوره",
    assignedTo: "تیم B",
  },
  {
    id: 6,
    task: "طراحی مجدد -  صفحه ی لندینگ",
    assignedTo: "حامد",
  },
  {
    id: 7,
    task: "داشبورد Skote Saas",
    assignedTo: "علی",
  },
];

export {
    TopSellingData,
    dashboardEarning,
    chatData,
    tasksData,
};