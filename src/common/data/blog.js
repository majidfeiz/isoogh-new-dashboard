// import images
import img1 from "../../assets/images/small/img-7.jpg";
import img2 from "../../assets/images/small/img-4.jpg";
import img3 from "../../assets/images/small/img-6.jpg";

const categoriesData = [
  {
    id: 1,
    text: "طرح",
    icon: "mdi mdi-chevron-left",
  },
  {
    id: 2,
    text: "توسعه",
    icon: "mdi mdi-chevron-left",
    badge: {
      text: "04",
      color: "badge-soft-success",
    },
  },
  {
    id: 3,
    text: "کسب و کار",
    icon: "mdi mdi-chevron-left",
  },
  {
    id: 4,
    text: "پروژه",
    icon: "mdi mdi-chevron-left",
  },
  {
    id: 5,
    text: "سفر",
    icon: "mdi mdi-chevron-left",
    badge: {
      text: "12",
      color: "badge-soft-success",
    },
  },
];

const archiveData = [
    {
        id: 1,
        year: "1402",
        badgeCount: "03"
    },
    {
        id: 2,
        year: "1400",
        badgeCount: "06"
    },
    {
        id: 3,
        year: "1399",
        badgeCount: "05"
    }
]
const popularPosts = [
  {
    id: 1,
    imageSrc: img1,
    title: "روز زیبا با دوستان",
    date: "10 مهر, 1402",
  },
  {
    id: 2,
    imageSrc: img2,
    title: "کشیدن طرح",
    date: "24 مهر, 1402",
  },
  {
    id: 3,
    imageSrc: img3,
    title: "بحث گروهی درباره پروژه",
    date: "11 مهر, 1402",
  },
];

const tagsData = [
    { id: 1, name: "طرح" },
    { id: 2, name: "توسعه" },
    { id: 3, name: "کسب و کار" },
    { id: 4, name: "پروژه" },
    { id: 5, name: "سفر" },
    { id: 6, name: "سبک زندگی" },
    { id: 7, name: "عکاسی" },
]


export { categoriesData, archiveData, popularPosts , tagsData}
