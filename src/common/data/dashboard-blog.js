// img
import img6 from "../../assets/images/small/img-6.jpg"
import img2 from "../../assets/images/small/img-2.jpg"
import img1 from "../../assets/images/small/img-1.jpg"

const blogStatsData = [
    { title: 'کل پست', value: '120', icon: 'bx bxs-book-bookmark' },
    { title: 'صفحات', value: '86', icon: 'bx bxs-note' },
    { title: 'نظرات', value: '4,235', icon: 'bx bxs-message-square-dots' },
];

const visitor = [
    {
        id: 1,
        data: {
            categories: ["28' مهر", "13' 05' خرداد", "13' تیر", "13' مرداد", "13' مهر", "13' شهریور", "13' آبان", "13' فروردین", "13' خرداد", "13' دی", "13' مرداد", "13' بهمن"],
            CurrentData: [18, 21, 45, 36, 65, 47, 51, 32, 40, 28, 31, 26],
            PreviousData: [30, 11, 22, 18, 32, 23, 58, 45, 30, 36, 15, 34],
        },
        today: 1024,
        thisMonth: 12356,
        thisYear: 102354
    },
    {
        id: 2,
        data: {
            categories: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            CurrentData: [51, 32, 40, 28, 31, 26],
            PreviousData: [58, 45, 30, 36, 15, 34],
        },
        today: 2022,
        thisMonth: 39485,
        thisYear: 102938
    },
    {
        id: 3,
        data: {
            categories: ["خرداد '21", "تیر '21", "مهر '21", "آبان '21", "شهریور '21", "فروردین '21", "مهر '21", "مرداد '21", "اردیبهشت '21", "خرداد '21", "مهر '21", "2022"],
            CurrentData: [19, 27, 47, 56, 68, 41, 57, 22, 29, 58, 20, 18],
            PreviousData: [51, 46, 28, 17, 67, 13, 49, 47, 57, 84, 72, 16],
        },
        today: 1029,
        thisMonth: 56473,
        thisYear: 938271
    },
    {
        id: 4,
        data: {
            categories: ["خرداد", "مهر", "آبان", "شهریور", "مرداد", "مهر", "فروردین", "آذر", "دی", "تیر", "اردیبهشت", "بهمن"],
            CurrentData: [18, 21, 45, 36, 65, 47, 50, 32, 45, 28, 30, 26],
            PreviousData: [20, 11, 22, 20, 32, 23, 58, 25, 30, 36, 25, 34],
        },
        today: 6095,
        thisMonth: 47893,
        thisYear: 348098
    }
]
const postRecentData = [
  {
    id: 1,
    img: img2,
    title: "یک روز زیبا با دوستان",
    date: "10 خرداد, 1400",
  },
  {
    id: 2,
    img: img6,
    title: "کشیدن طرح",
    date: "02 تیر, 1401",
  },
  {
    id: 3,
    img: img2,
    title: "بحث پروژه با تیم",
    date: "24 خرداد, 1399",
  },
  {
    id: 4,
    img: img1,
    title: "دوچرخه سواری در جاده",
    date: "20 آبان, 1401",
  },
];

const postPopularData = [
  {
    id: 1,
    img: img6,
    title: "کشیدن طرح",
    date: "02 تیر, 1400",
    dropdownItems: ["اقدامات", "اقدامات دیگر", "موارد دیگر"],
  },
  {
    id: 2,
    img: img2,
    title: "یک روز زیبا با دوستان",
    date: "10 خرداد, 1401",
    dropdownItems: ["اقدامات", "اقدامات دیگر", "موارد دیگر"],
  },
  {
    id: 3,
    img: img1,
    title: "دوچرخه سواری در جاده",
    date: "20 مرداد, 1401",
    dropdownItems: ["اقدامات", "اقدامات دیگر", "موارد دیگر"],
  },
  {
    id: 4,
    img: img2,
    title: "بحث پروژه با تیم",
    date: "24 تیر, 1400",
    dropdownItems: ["اقدامات", "اقدامات دیگر", "موارد دیگر"],
  },
];

const commentsData = [
  {
    id: 1,
    name: "علی نوری",
    time: "1 ساعت پیش",
    content: "اگر چند زبان با هم ادغام شوند، دستور زبان نتیجه فرد است",
  },
  {
    id: 2,
    name: "ساحل ابراهیمی",
    time: "2 ساعت پیش",
    content: "مراحل انجام پروژه کنترل می شود",
    replies: [
      {
        id: 3,
        name: "سارا همتی",
        time: "2 ساعت پیش",
        content: "برای مثال بی اهمیت، کدام یک از ما تا به حال متعهد می شویم",
      },
    ],
  },
  {
    id: 4,
    name: "کیانا صادقی",
    time: "12 خرداد",
    content: "ارسال پروژه به هفته ی بعد موکول شد",
  },
];
const progressData = [
    { id: 1, color: "primary", label: "تهران", percentage: 78 },
    { id: 2, color: "warning", label: "مشهد", percentage: 69 },
    { id: 3, color: "success", label: "اصفهان", percentage: 61 }
];

const activityBlogData = [
  {
    date: "10 تیر",
    title: "پست شد",
    boldText: "یک روز زیبا با دوستان",
    text: "وبلاگ ...",
    link: "#",
    linkText: "مشاهده",
    active: true,
  },
  {
    date: "08 مهر",
    title: "اگر چند زبان با هم ادغام شوند، دستور زبان حاصل",
    link: "#",
    linkText: "خواندن",
  },
  {
    date: "02 بهمن",
    title: "ايجاد كردن",
    boldText: "طراحی وبلاگ ",
  },
  {
    date: "24 فروردین",
    title: "اماده کردن پلنر ها برای ارائه در سمینار",
  },
  {
    date: "21 خرداد",
    title: "ویدیو های این فصل از اموزش ها روی سایت بارگذاری شود",
  },
];

const blogPost = [
  {
    id: 1,
    img: img2,
    title: "یک روز زیبا با دوستان",
    date: "10 تیر, 1401",
    like: "125",
    comment: "68",
  },
  {
    id: 2,
    img: img6,
    title: "کشیدن طرح",
    date: "02 خرداد, 1400",
    like: "102",
    comment: "48",
  },
  {
    id: 3,
    img: img1,
    title: "دوچرخه سواری در جاده",
    date: "24 فروردین, 1402",
    like: "98",
    comment: "35",
  },
  {
    id: 4,
    img: img2,
    title: "بحث پروژه با تیم",
    date: "15 خرداد, 1401",
    like: "92",
    comment: "22",
  },
];

export { visitor, blogStatsData, postRecentData, postPopularData, commentsData, progressData, activityBlogData, blogPost };