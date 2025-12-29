//import Images
import avatar02 from "../../assets/images/users/avatar-2.jpg";
import avatar03 from "../../assets/images/users/avatar-3.jpg";
import avatar04 from "../../assets/images/users/avatar-4.jpg";
import avatar06 from "../../assets/images/users/avatar-6.jpg";

const chats = [
  {
    id: 1,
    roomId: 1,
    status: "حد واسط",
    image: avatar02,
    name: "سارا توسلی",
    description: "سلام! آنجا من در دسترس هستم",
    time: "05 دقیفه",
  },
  {
    id: 2,
    roomId: 2,
    status: "آنلاین",
    image: avatar03,
    name: "علی حاتمی",
    description: "من تمومش کردم! می بینمت",
    time: "12 دقیفه",
  },
  {
    id: 3,
    roomId: 3,
    status: "آنلاین",
    name: "کیمیا نوری",
    description: "این تم عالی است!",
    time: "24 دقیفه",
    isImg: true,
    profile: "K",
  },
  {
    id: 4,
    roomId: 4,
    status: "حد واسط",
    image: avatar04,
    name: "محمد میری",
    description: "از ملاقات شما خوشبختم",
    time: "1 ساعت",
  },
  {
    id: 5,
    roomId: 5,
    status: "آفلاین",
    name: "هلیا عبدی",
    description: "سلام! آنجا من در دسترس هستم",
    time: "3 ساعت",
    isImg: true,
    profile: "M",
  },
  {
    id: 6,
    roomId: 6,
    status: "آنلاین",
    image: avatar06,
    name: "نرگس ابراهیمی",
    description: "من تمومش کردم! می بینمت",
    time: "5 ساعت",
  },
  {
    id: 7,
    roomId: 7,
    status: "آنلاین",
    name: "امیر ناهیدی",
    description: "این تم عالی است!",
    time: "24 دقیقه",
    isImg: true,
    profile: "K",
  },
];


const groups = [
  { id: 1, roomId: 1, image: "G", name: "عمومی", status: "حد واسط" },
  { id: 2, roomId: 2, image: "R", name: "گزارش نویسی", status: "آنلاین" },
  { id: 3, roomId: 3, image: "M", name: "ملاقات", status: "حد واسط" },
  { id: 4, roomId: 4, image: "A", name: "پروژه A", status: "آنلاین" },
  { id: 5, roomId: 5, image: "B", name: "پروژه B", status: "حد واسط" },
];

const contacts = [
  {
    id: 1,
    category: "A",
    child: [
      { id: 1, roomId: 1, name: "علی ابراهیمی", status: "آنلاین" },
      { id: 2, roomId: 2, name: "سپیده فخری", status: "حد واسط" },
    ],
  },
  {
    id: 2,
    roomId: 2,
    category: "B",
    child: [{ id: 3, roomId: 3, name: "علی ابراهیمی", status: "آنلاین" }],
  },
  {
    id: 3,
    roomId: 3,
    category: "C",
    child: [
      { id: 4, roomId: 4, name: "کیمیا همتی", status: "حد واسط" },
      { id: 5, roomId: 5, name: "ایمان دارابی", status: "آنلاین" },
      { id: 6, roomId: 6, name: "نیما راد", status: "حد واسط" },
    ],
  },
  {
    id: 4,
    roomId: 4,
    category: "D",
    child: [{ id: 7, roomId: 7, name: "محمد فراهانی", status: "آنلاین" }],
  },
];


const messages = [
  {
    id: 1,
    roomId: 1,
    sender: "هلیا ابراهیمی",
    message: "سلام!",
    isToday: "امروز",
    userMessages: [
      { id: 1, to_id: 1, msg: "صبح بخیر 😊", time: "10:00", isImages: false },
      {
        id: 2,
        to_id: 2,
        msg: "سلام. چطوری؟ جلسه بعدی ما چطور؟",
        isImages: false,
        time: "10:02",
      },
      {
        id: 3,
        to_id: 1,
        msg: "آره همه چی خوبه",
        isImages: false,
        time: "10:06",
      },
      {
        id: 4,
        to_id: 2,
        msg: "و جلسه بعدی فردا ساعت 10 صبح",
        isImages: false,
        time: "10:06",
      },
      {
        id: 5,
        to_id: 1,
        msg: "وای عالیه",
        isImages: false,
        time: "10:07",
      },
    ],
  },
  {
    id: 2,
    roomId: 2,
    sender: "هلیا نوری",
    message: "سلام!",
    isToday: "دیروز",
    userMessages: [
      {
        id: 6,
        to_id: 1,
        msg: "سلام. چطوری؟ جلسه بعدی ما چطور؟",
        time: "10:02",
      },
      { id: 7, to_id: 2, msg: "آره همه چی خوبه", time: "10:06" },
      {
        id: 8,
        to_id: 1,
        msg: "و جلسه بعدی فردا ساعت 10 صبح",
        time: "10:06",
      },
    ],
  },
  {
    id: 3,
    roomId: 3,
    sender: "کیمیا همتی",
    message: "سلام!",
    time: "11:02",
    isToday: "5 فروردین",
    userMessages: [
      { id: 1, to_id: 1, msg: "آره همه چی خوبه", time: "10:06" },
      {
        id: 2,
        to_id: 2,
        msg: "و جلسه بعدی فردا ساعت 10 صبح",
        time: "10:06",
      },
      { id: 3, to_id: 1, msg: "وای عالیه", time: "10:07" },
    ],
  },

  {
    id: 4,
    roomId: 4,
    sender: "امیر نعمتی",
    message: "سلام!",
    time: "1 ساعت",
    isToday: "1 فروردین",
    userMessages: [
      { id: 1, to_id: 1, msg: "صبح بخیر 😊", time: "10:00" },
      { id: 2, to_id: 2, msg: "آره همه چی خوبه", time: "10:06" },
    ],
  },
  {
    id: 5,
    roomId: 5,
    sender: "نیما راد",
    message: "سلام!",
    time: "11:05",
    isToday: "1 اردیبهشت",
    userMessages: [
      { id: 1, to_id: 1, msg: "صبح بخیر 😊", time: "10:00" },
      {
        id: 2,
        to_id: 2,
        msg: "و جلسه بعدی فردا ساعت 10 صبح",
        time: "10:06",
      },
      { id: 3, to_id: 1, msg: "وای عالیه", time: "10:07" },
    ],
  },
  {
    id: 6,
    roomId: 6,
    sender: "سپیده فرخی",
    message: "سلام!",
    time: "1 ساعت",
    isToday: "30 مهر",
    userMessages: [
      { id: 1, to_id: 1, msg: "صبح بخیر 😊", time: "10:00" },
      {
        id: 2,
        to_id: 2,
        msg: "سلام. چطوری؟ جلسه بعدی ما چطور؟",
        time: "10:02",
      },
      { id: 3, to_id: 1, msg: "آره همه چی خوبه", time: "10:06" },
      {
        id: 4,
        to_id: 2,
        msg: "و جلسه بعدی فردا ساعت 10 صبح",
        time: "10:06",
      },
    ],
  },
  {
    id: 7,
    roomId: 7,
    sender: "محمد فراهانی",
    message: "سلام",
    time: "1 ساعت",
    isToday: "30 فروردین",
    userMessages: [
      { id: 1, to_id: 1, msg: "صبح بخیر 😊", time: "10:00" },
      {
        id: 2,
        to_id: 2,
        msg: "سلام. چطوری؟ جلسه بعدی ما چطور؟",
        time: "10:02",
      },
      { id: 3, to_id: 1, msg: "Yeah everything is fine", time: "10:06" },
      {
        id: 4,
        to_id: 2,
        msg: "و جلسه بعدی فردا ساعت 10 صبح",
        time: "10:06",
      },
      { id: 5, to_id: 1, msg: "وای عالیه", time: "10:07" },
    ],
  },
];
export { chats, messages, contacts, groups }
