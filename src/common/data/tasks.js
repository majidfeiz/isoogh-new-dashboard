//Import Images
import avatar1 from "../../assets/images/users/avatar-1.jpg"
import avatar2 from "../../assets/images/users/avatar-2.jpg"
import avatar3 from "../../assets/images/users/avatar-3.jpg"
import avatar4 from "../../assets/images/users/avatar-4.jpg"
import avatar5 from "../../assets/images/users/avatar-5.jpg"
import avatar6 from "../../assets/images/users/avatar-6.jpg"
import avatar7 from "../../assets/images/users/avatar-7.jpg"
import avatar8 from "../../assets/images/users/avatar-8.jpg"

import img1 from "../../assets/images/companies/img-1.png";
import img2 from "../../assets/images/companies/img-2.png";
import img3 from "../../assets/images/companies/img-3.png";

import img4 from "../../assets/images/small/img-4.jpg";
import img5 from "../../assets/images/small/img-5.jpg";
import img6 from "../../assets/images/small/img-6.jpg";

const tasks = [
  {
    id: "1",
    name: "آینده",
    cards: [
      {
        id: "1",
        title: "طراحی چیدمان Topnav",
        date: "14 دی, 1402",
        badgeText: "در انتظار",
        badgeColor: "secondary",
        budget: "145",
        kanbanImgtextColor: "bg-info",
        kanbanImgtext: [{ id: 1, imageText: "3+" }],
        userImages: [
          { id: 4, img: avatar4 },
          { id: 5, img: avatar5 },
          { id: 2, img: avatar2 },
        ],
        taskdesc: "تخته بنبون ایجاد کنید",
      },
      {
        id: "2",
        title: "یک رابط کاربری جدید ایجاد کنید",
        date: "15 دی, 2021",
        badgeText: "تایید شده",
        badgeColor: "primary",
        taskdesc: "وجود مجزا یک افسانه است",
        taskdesc1: "برای موسیقی، ورزش و غیره",
        budget: "112",
        imageTextColor: "bg-success",
        userImages: [
          { id: 1, img: avatar1 },
          { id: 2, img: avatar2 },
          { id: 0, imageText: "A" },
          { id: 5, img: avatar5 },
        ],
        taskdesc: "یادگیری ری اکت",
      },
      {
        id: "3",
        title: "ساختن Skote لوگوی",
        date: "15 دی, 1402",
        badgeText: "در انتظار",
        badgeColor: "secondary",
        budget: "86",
        imageTextColor: "bg-warning",
        kanbanImgtextColor: "bg-danger",
        kanbanImgtext: [{ id: 1, imageText: "9+" }],
        userImages: [
          { id: 4, img: avatar4 },
          { id: 0, imageText: "R" },
          { id: 5, img: avatar5 },
        ],
        taskdesc: "solved issue",
      },
    ],
  },
  {
    id: "4",
    name: "در حال  انجام",
    cards: [
      {
        id: "5",
        title: "طراحی لوگوی محصول",
        date: "12 دی, 1402",
        badgeText: "کامل",
        badgeColor: "success",
        budget: "132",
        userImages: [
          { id: 7, img: avatar7 },
          { id: 8, img: avatar8 },
        ],
        brandLogo: [
          { id: 1, img: img1 },
          { id: 2, img: img2 },
          { id: 3, img: img3 },
        ],
        taskdesc: "طراحی لوگو",
      },
      {
        id: "6",
        title: "یک رابط کاربری قالب وبلاگ ایجاد کنید",
        date: "13 دی, 1402",
        badgeText: "در انتظار",
        badgeColor: "warning",
        budget: "103",
        imageTextColor: "bg-success",
        kanbanImgtextColor: "bg-info",
        kanbanImgtext: [{ id: 1, imageText: "3+" }],
        userImages: [
          { id: 0, imageText: "A" },
          { id: 6, img: avatar6 },
          { id: 4, img: avatar4 },
          { id: 7, img: avatar7 },
        ],
        taskdesc: "Create a Blog ",
      },
      {
        id: "7",
        title: "یک رابط کاربری قالب وبلاگ ایجاد کنید",
        date: "13 دی, 1402",
        badgeText: "در انتظار",
        badgeColor: "warning",
        budget: "103",
        imageTextColor: "bg-success",
        kanbanImgtextColor: "bg-primary",
        kanbanImgtext: [{ id: 1, imageText: "7+" }],
        userImages: [
          { id: 0, imageText: "A" },
          { id: 4, img: avatar4 },
          { id: 5, img: avatar5 },
        ],
        taskdesc: "یک وبلاگ ایجاد کنید ",
      },
    ],
  },
  {
    id: "8",
    name: "کامل شده",
    cards: [
      {
        id: "9",
        title: "طراحی مجدد - لندینگ",
        date: "10 دی, 1402",
        badgeText: "کامل",
        badgeColor: "success",
        imageTextColor: "",
        budget: "145",
        imageTextColor: "bg-danger",
        userImages: [
          { id: 1, img: avatar1 },
          { id: 2, img: avatar2 },
          { id: 0, imageText: "K" },
          { id: 3, img: avatar3 },
        ],
        taskdesc: "طراحی مجدد - لندینگ",
      },
      {
        id: "10",
        title: "لندینگ چند منظوره",
        date: "09 دی, 1402",
        badgeText: "کامل",
        badgeColor: "success",
        budget: "92",
        kanbanImgtextColor: "bg-pink",
        kanbanImgtext: [{ id: 1, imageText: "5+" }],
        userImages: [
          { id: 4, img: avatar4 },
          { id: 5, img: avatar5 },
          { id: 6, img: avatar6 },
        ],
        brandLogo: [
          { id: 1, imges: img4 },
          { id: 2, imges: img5 },
          { id: 3, imges: img6 },
        ],
        taskdesc: "یک لندینگ چند منظوره ایجاد کنید",
      },
      {
        id: "11",
        title: "Skote لندینگ",
        date: "15 دی, 1402",
        badgeText: "در انتظار",
        badgeColor: "secondary",
        budget: "86",
        imageTextColor: "bg-danger",
        kanbanImgtextColor: "bg-info",
        kanbanImgtext: [{ id: 1, imageText: "2+" }],
        userImages: [
          { id: 7, img: avatar7 },
          { id: 8, img: avatar8 },
          { id: 0, imageText: "D" },
        ],
        taskdesc: "آزمایش  Skote لندینگ",
      },
    ],
  },
];

const series = [
  {
    name: "تسک های کامل شده",
    type: "column",
    data: [23, 11, 22, 27, 13, 22, 52, 21, 44, 22, 30],
  },
  {
    name: "همه ی تسک ها",
    type: "line",
    data: [23, 11, 34, 27, 17, 22, 62, 32, 44, 22, 39],
  },
];

const options = {
  chart: { height: 280, type: "line", stacked: !1, toolbar: { show: !1 } },
  stroke: { width: [0, 2, 5], curve: "smooth" },
  plotOptions: { bar: { columnWidth: "20%", endingShape: "rounded" } },
  colors: ["#556ee6", "#34c38f"],
  fill: {
    gradient: {
      inverseColors: !1,
      shade: "light",
      type: "vertical",
      opacityFrom: 0.85,
      opacityTo: 0.55,
      stops: [0, 100, 100, 100],
    },
  },
  labels: [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
  ],
  markers: { size: 0 },
  yaxis: { min: 0 },
};

const statusClasses = {
  waiting: "badge-soft-secondary",
  approved: "badge-soft-primary",
  complete: "badge-soft-success",
  pending: "badge-soft-warning",
};

const recentTasksData = [
  {
    id: 1,
    taskName: "طراحی لوگوی محصول",
    avatars: [
      { id: 1, src: avatar4 },
      { id: 2, src: avatar5 },
    ],
  },
  {
    id: 2,
    taskName: "ایجاد کردن رابط کاربری قالب وبلاگ",
    avatars: [
      { id: 1, src: avatar1 },
      { id: 2, src: avatar2 },
      { id: 3, src: avatar3 },
      { id: 4, avatarTitle: "D", bgColor: "bg-info", text: "D" },
    ],
  },
  {
    id: 1,
    taskName: "طراحی مجدد - صفحه لندینگ",
    avatars: [
      { id: 1, src: avatar8 },
      { id: 2, src: avatar7 },
      { id: 3, avatarTitle: "P", bgColor: "bg-danger", text: "P" },
    ],
  },
];
const AddTeamMember = [
  { id: 1, img: avatar1, name: 'نازنین نوری' },
  { id: 2, img: avatar2, name: 'حامد عباسی' },
  { id: 3, img: avatar3, name: 'هلیا قمی' },
  { id: 4, img: avatar4, name: 'اناهید اریانا' },
  { id: 5, img: avatar5, name: 'علی زمانی' },
  { id: 6, img: avatar6, name: 'امیر حاتمی' },
  { id: 7, img: avatar7, name: 'کیانا همتی' },
  { id: 8, img: avatar8, name: 'محمد کیانی' }
]

export { tasks, series, options, statusClasses, recentTasksData ,AddTeamMember };
