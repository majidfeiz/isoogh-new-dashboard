const myfiles = [
  {
    id: 1,
    name: "طرح",
    file: "12",
    Gb: 6,
  },
  {
    id: 2,
    name: "توسعه",
    file: "20",
    Gb: 8,
  },
  {
    id: 3,
    name: "پروژه A",
    file: "06 ",
    Gb: 2,
  },
  {
    id: 4,
    name: "ادمین",
    file: "08",
    Gb: 4,
  },
  {
    id: 5,
    name: "طراحی اسکج",
    file: "12",
    Gb: 6,
  },
  {
    id: 6,
    name: "برنامه های کاربردی",
    file: "20",
    Gb: 8,
  },
];

const recentfile = [
  {
    id: 1,
    icon: "mdi mdi-file-document font-size-16 align-middle text-primary me-2",
    file: "index.html",
    date: "12-10-1402, 09:45",
    size: "09",
  },
  {
    id: 2,
    icon: "mdi mdi-folder-zip font-size-16 align-middle text-warning me-2",
    file: "Project-A.zip",
    date: "11-10-1401, 17:05",
    size: "115",
  },
  {
    id: 3,
    icon: "mdi mdi-image font-size-16 align-middle text-muted me-2",
    file: "Img-1.jpeg",
    date: "11-10-1402, 13:26",
    size: "86",
  },
  {
    id: 4,
    icon: "mdi mdi-text-box font-size-16 align-middle text-muted me-2",
    file: "update list.txt",
    date: "10-10-1400, 11:32",
    size: "08",
  },
  {
    id: 5,
    icon: "mdi mdi-folder font-size-16 align-middle text-warning me-2",
    file: "Project B",
    date: "10-10-1402, 10:51",
    size: "72",
  },
  {
    id: 6,
    icon: "mdi mdi-text-box font-size-16 align-middle text-muted me-2",
    file: "Changes list.txt",
    date: "09-10-1401, 17:05",
    size: "07",
  },
  {
    id: 7,
    icon: "mdi mdi-image font-size-16 align-middle text-success me-2",
    file: "Img-2.png",
    date: "09-10-1400, 15:12",
    size: "31",
  },
  {
    id: 8,
    icon: "mdi mdi-folder font-size-16 align-middle text-warning me-2",
    file: "Project C",
    date: "09-10-1400, 10:11",
    size: "20",
  },
  {
    id: 9,
    icon: "bx bxs-file font-size-16 align-middle text-primary me-2",
    file: "starter-page.html",
    date: "08-10-1401, 03:22",
    size: "11",
  },
];

const filesData = [
  {
    id: 1,
    text: "طرح",
    icon: false
  },
  {
    id: 2,
    text: "توسعه",
    icon: true
  },
  {
    id: 3,
    text: "پروژه A",
    icon: false
  },
  {
    id: 4,
    text: "ادمین",
    icon: true
  }
];

const filemanagerData = [
  {
    id: 1,
    icon: "mdi mdi-google-drive font-size-16 text-muted me-2",
    text: "درایو گوگل",
  },
  {
    id: 2,
    icon: "mdi mdi-dropbox font-size-16 me-2 text-primary",
    text: "دراپ باکس",
  },
  {
    id: 3,
    icon: "mdi mdi-share-variant font-size-16 me-2",
    text: "به اشتراک گذاری شده",
    icons: true,
  },
  {
    id: 4,
    icon: "mdi mdi-star-outline text-muted font-size-16 me-2",
    text: "ستاره دار",
  },
  {
    id: 5,
    icon: "mdi mdi-trash-can text-danger font-size-16 me-2",
    text: "سطل زباله",
  },
  {
    id: 6,
    icon: "mdi mdi-cog text-muted font-size-16 me-2",
    text: "تنظیمات",
    badge: true,
  },
];

const storageData = [
  {
    id: 1,
    title: "تصاویر",
    color: "success",
    icon: "mdi mdi-image",
    files: "176 فایل",
    size: "6 GB",
  },
  {
    id: 2,
    title: "ویدیو ",
    color: "danger",
    icon: "mdi mdi-play-circle-outline",
    files: "45 فایل",
    size: "4.1 GB",
  },
  {
    id: 3,
    title: "اهنگ",
    color: "info",
    icon: "mdi mdi-music",
    files: "21 فایل",
    size: "3.2 GB",
  },
  {
    id: 4,
    title: "سند",
    color: "primary",
    icon: "mdi mdi-file-document",
    files: "21 فایل",
    size: "2 GB",
  },
  {
    id: 5,
    title: "موارد دیگر",
    color: "warning",
    icon: "mdi mdi-folder",
    files: "20 فایل",
    size: "1.4 GB",
  },
];


export { myfiles, recentfile, filesData, filemanagerData, storageData };