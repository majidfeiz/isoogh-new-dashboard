import avatar1 from "../../assets/images/users/avatar-1.jpg";
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../assets/images/users/avatar-5.jpg";
import avatar6 from "../../assets/images/users/avatar-6.jpg";
import avatar7 from "../../assets/images/users/avatar-7.jpg";
import avatar8 from "../../assets/images/users/avatar-8.jpg";
import companies01 from "../../assets/images/companies/img-1.png";
import companies02 from "../../assets/images/companies/img-2.png";
import companies03 from "../../assets/images/companies/img-3.png";
import companies04 from "../../assets/images/companies/img-4.png";
import companies05 from "../../assets/images/companies/img-5.png";
import companies06 from "../../assets/images/companies/img-6.png";

const projects = [
  {
    id: 1,
    img: companies02,
    name: "طراحی لوگوی برند",
    description: "برای رسیدن به آن ضروری خواهد بود",
    status: "در حال پردازش",
    color: "warning",
    dueDate: "22 خرداد, 19",
    commentsCount: 183,
    team: [
      { id: 1, img: avatar8, fullname: "طاها رستمی" },
      { id: 2, img: avatar2, fullname: "زهرا داوودی" },
    ],
    startDate: "08 اردیبهشت, 1402",
    projectDetails: {
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد",
      points: [
        "برای دستیابی به این امر، لازم است",
        "وجود جداگانه کمی غیر منطقی است.",
        "اگر چند زبان با هم ادغام شوند",
      ],
    },
    files: [
      { name: "Skote Landing.Zip", size: "3.25 MB", link: "#" },
      { name: "Skote Admin.Zip", size: "3.15 MB", link: "#" },
      { name: "Skote Logo.Zip", size: "2.02 MB", link: "#" },
      { name: "Veltrix admin.Zip", size: "2.25 MB", link: "#" },
    ],
    comments: [
      {
        id: 1,
        username: "سارا توسلی",
        userImg: avatar2,
        comment: "وجود جداگانه کمی غیر منطقی است",
      },
      {
        id: 2,
        username: "دلوین جهاگیر",
        userImg: avatar3,
        comment: "@هنری برای یک فرد انگلیسی ساده شده است",
        reply: {
          username: "هلیا قمی",
          comment: "به عنوان یک دوست این فوق العاده است",
        },
      },
      {
        id: 3,
        username: "احسان مجد",
        comment: " وجود جداگانه کمی غیر منطقی است",
      },
    ],
  },
  {
    id: 2,
    img: companies03,
    name: "طراحی جدید لندینگ",
    description: "برای علم، موسیقی، ورزش و غیره",
    status: "به تاخیر انداختن",
    color: "danger",
    dueDate: "13 دی, 19",
    commentsCount: 175,
    team: [
      { id: 3, img: "Null", name: "K", color: "info" },
      { id: 4, img: avatar2, fullname: "دانیال راد" },
    ],
    startDate: "08 فروردین, 1402",
    projectDetails: {
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد",
      points: [
        "برای دستیابی به این امر، لازم است",
        "وجود جداگانه کمی غیر منطقی است",
        "اگر چند زبان با هم ادغام شوند",
      ],
    },
    files: [
      { name: "Skote Landing.Zip", size: "3.25 MB", link: "#" },
      { name: "Skote Admin.Zip", size: "3.15 MB", link: "#" },
      { name: "Skote Logo.Zip", size: "2.02 MB", link: "#" },
      { name: "Veltrix admin.Zip", size: "2.25 MB", link: "#" },
    ],
    comments: [
      {
        id: 1,
        username: "اناهید اریانا",
        userImg: avatar2,
        comment: "وجود جداگانه کمی غیر منطقی است.",
      },
      {
        id: 2,
        username: "فرشته مینایی",
        userImg: avatar3,
        comment: "به عنوان یک دوست این فوق العاده است ",
        reply: {
          username: "امیر رستمی",
          comment: "پروژه های محشری رو میبینم",
        },
      },
      {
        id: 3,
        username: "کیان منافی",
        comment: " وجود جداگانه کمی غیر منطقی است.",
      },
    ],
  },
  {
    id: 3,
    img: companies04,
    name: "طراحی مجدد - صفحه لندینگ",
    description: "اگر چند زبان با هم ادغام شوند",
    status: "تکمیل شده",
    color: "success",
    dueDate: "14 دی, 19",
    commentsCount: 202,
    team: [
      { id: 5, img: avatar1, fullname: "نیما موحدی" },
      { id: 6, img: avatar6, fullname: "نیما موحدی" },
      { id: 7, img: avatar7, fullname: "نیما موحدی" },
    ],
    startDate: "08 فروردین, 1402",
    projectDetails: {
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد",
      points: [
        "برای دستیابی به این امر، لازم است",
        "وجود جداگانه کمی غیر منطقی است.",
        "اگر چند زبان با هم ادغام شوند",
      ],
    },
    files: [
      { name: "Skote Landing.Zip", size: "3.25 MB", link: "#" },
      { name: "Skote Admin.Zip", size: "3.15 MB", link: "#" },
      { name: "Skote Logo.Zip", size: "2.02 MB", link: "#" },
      { name: "Veltrix admin.Zip", size: "2.25 MB", link: "#" },
    ],
    comments: [
      {
        id: 1,
        username: "David Lambert",
        userImg: avatar2,
        comment: "وجود جداگانه کمی غیر منطقی است.",
      },
      {
        id: 2,
        username: "سارا مقیمی",
        userImg: avatar3,
        comment: "@هنری برای یک فرد انگلیسی ساده شده است",
        reply: {
          username: "سینا رفعتی",
          comment: "به عنوان یک دوست این عالی است",
        },
      },
      {
        id: 3,
        username: "ساره نوری",
        comment: " وجود جداگانه کمی غیر منطقی است.",
      },
    ],
  },
  {
    id: 4,
    img: companies05,
    name: "طراح UI",
    description: "وجود جداگانه کمی غیر منطقی است",
    status: "تکمیل شده",
    color: "success",
    dueDate: "13 بهمن, 19",
    commentsCount: 194,
    team: [
      { id: 8, img: avatar1, fullname: "عماد عبداللهی" },
      { id: 9, img: avatar3, fullname: "نورا فرخی" },
      { id: 10, img: "Null", name: "3+", color: "danger" },
    ],
    startDate: "08 اردیبهشت, 1402",
    projectDetails: {
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد",
      points: [
        "برای دستیابی به این امر، لازم است",
        "وجود جداگانه کمی غیر منطقی است.",
        "اگر چند زبان با هم ادغام شوند",
      ],
    },
    files: [
      { name: "Skote Landing.Zip", size: "3.25 MB", link: "#" },
      { name: "Skote Admin.Zip", size: "3.15 MB", link: "#" },
      { name: "Skote Logo.Zip", size: "2.02 MB", link: "#" },
      { name: "Veltrix admin.Zip", size: "2.25 MB", link: "#" },
    ],
    comments: [
      {
        id: 1,
        username: "داوود تهرانی",
        userImg: avatar2,
        comment: "وجود جداگانه کمی غیر منطقی است.",
      },
      {
        id: 2,
        username: "الهه رستمی",
        userImg: avatar3,
        comment: "به عنوان یک دوست فوق العاده است",
        reply: {
          username: "نازنین حاتمی",
          comment: "برنامه ی پیگیری در حال انجام است",
        },
      },
      {
        id: 3,
        username: "همایون اقایی",
        comment: " وجود جداگانه کمی غیر منطقی است.",
      },
    ],
  },
  {
    id: 5,
    img: companies06,
    name: "رابط کاربری قالب وبلاگ",
    description: "برای علم، موسیقی، ورزش و غیره",
    status: "در حال پردازش",
    color: "warning",
    dueDate: "24 اسفند, 19",
    commentsCount: 122,
    team: [
      { id: 11, img: avatar4, fullname: "سارا عباسی" },
      { id: 12, img: avatar5, fullname: "حامد نوری" },
    ],
    startDate: "08 فروردین, 1402",
    projectDetails: {
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد",
      points: [
        "برای دستیابی به این امر، لازم است",
        "وجود جداگانه کمی غیر منطقی است.",
        "اگر چند زبان با هم ادغام شوند",
      ],
    },
    files: [
      { name: "Skote Landing.Zip", size: "3.25 MB", link: "#" },
      { name: "Skote Admin.Zip", size: "3.15 MB", link: "#" },
      { name: "Skote Logo.Zip", size: "2.02 MB", link: "#" },
      { name: "Veltrix admin.Zip", size: "2.25 MB", link: "#" },
    ],
    comments: [
      {
        id: 1,
        username: "ریما داوودی",
        userImg: avatar2,
        comment: "وجود جداگانه کمی غیر منطقی است.",
      },
      {
        id: 2,
        username: "طاها اقایی",
        userImg: avatar3,
        comment: "به عنوان یک دوست این فوق العاده است ",
        reply: {
          username: "حسین همتی",
          comment: "پروژه های محشری رو میبینم",
        },
      },
      {
        id: 3,
        username: "Steven Carlson",
        comment: " وجود جداگانه کمی غیر منطقی است.",
      },
    ],
  },
  {
    id: 6,
    img: companies03,
    name: "لندینگ چند منظوره",
    description: "به سادگی Occidental خواهد بود",
    status: "به تاخیر انداختن",
    color: "danger",
    dueDate: "15 بهمن, 19",
    commentsCount: 214,
    team: [
      { id: 13, img: avatar5, fullname: "حسین رحمانی" },
      {
        id: 14,
        img: "Null",
        name: "R",
        color: "warning",
        fullname: "علی زمانی",
      },
    ],
  },
  {
    id: 7,
    img: companies04,
    name: "رابط کاربری لندینگ برنامه",
    description: "برای رسیدن به آن ضروری خواهد بود",
    status: "تکمیل شده",
    color: "success",
    dueDate: "11 آبان, 19",
    commentsCount: 185,
    team: [
      {
        id: 15,
        img: "Null",
        name: "L",
        color: "pink",
        fullname: "Lony Mackay",
      },
      { id: 16, img: avatar2, fullname: "دانیال عباسی" },
    ],
    startDate: "08 دی, 1402",
    projectDetails: {
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد",
      points: [
        "برای دستیابی به این امر، لازم است",
        "وجود جداگانه کمی غیر منطقی است.",
        "اگر چند زبان با هم ادغام شوند",
      ],
    },
    files: [
      { name: "Skote Landing.Zip", size: "3.25 MB", link: "#" },
      { name: "Skote Admin.Zip", size: "3.15 MB", link: "#" },
      { name: "Skote Logo.Zip", size: "2.02 MB", link: "#" },
      { name: "Veltrix admin.Zip", size: "2.25 MB", link: "#" },
    ],
    comments: [
      {
        id: 1,
        username: "David Lambert",
        userImg: avatar2,
        comment: "وجود جداگانه کمی غیر منطقی است.",
      },
      {
        id: 2,
        username: "Steve Foster",
        userImg: avatar3,
        comment: "به عنوان یک دوست این فوق العاده است d",
        reply: {
          username: "Jeffrey Walker",
          comment: "پروژه های محشری رو میبینم",
        },
      },
      {
        id: 3,
        username: "Steven Carlson",
        comment: " وجود جداگانه کمی غیر منطقی است.",
      },
    ],
  },
  {
    id: 8,
    img: companies02,
    name: "طراحی ادمین جدید",
    description: "Their most common words.",
    status: "تکمیل شده",
    color: "success",
    dueDate: "12 خرداد, 19",
    commentsCount: 106,
    team: [
      { id: 17, img: avatar4, fullname: "سارا مقیمی" },
      { id: 18, img: avatar5, fullname: "شهاب اکبری" },
      {
        id: 19,
        img: "Null",
        name: "A",
        color: "success",
        fullname: "Aeffrey Walker",
      },
      { id: 20, img: avatar2, fullname: "دانیال صادقی" },
    ],
    startDate: "08 تیر, 1402",
    projectDetails: {
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد",
      points: [
        "برای دستیابی به این امر، لازم است",
        "وجود جداگانه کمی غیر منطقی است",
        "اگر چند زبان با هم ادغام شوند",
      ],
    },
    files: [
      { name: "Skote Landing.Zip", size: "3.25 MB", link: "#" },
      { name: "Skote Admin.Zip", size: "3.15 MB", link: "#" },
      { name: "Skote Logo.Zip", size: "2.02 MB", link: "#" },
      { name: "Veltrix admin.Zip", size: "2.25 MB", link: "#" },
    ],
    comments: [
      {
        id: 1,
        username: "همایون امرایی",
        userImg: avatar2,
        comment: "وجود جداگانه کمی غیر منطقی است.",
      },
      {
        id: 2,
        username: "سهیل عباسی",
        userImg: avatar3,
        comment: "به عنوان یک دوست این فوق العاده است ",
        reply: {
          username: "ستاره نوری",
          comment: "پروژه های محشری رو میبینم",
        },
      },
      {
        id: 3,
        username: "شهاب نوری",
        comment: " وجود جداگانه کمی غیر منطقی است.",
      },
    ],
  },
  {
    id: 9,
    img: companies01,
    name: "طراحی ادمین جدید",
    description: "به سادگی Occidental خواهد بود",
    status: "تکمیل شده",
    color: "success",
    dueDate: "15 مرداد, 19",
    commentsCount: 214,
    team: [
      {
        id: 21,
        img: avatar4,
        fullname: "Janice Cole",
        skills: [
          { id: 1, name: "فرانت اند" },
          { id: 2, name: "طراح" },
        ],
      },
      {
        id: 22,
        img: avatar5,
        fullname: "نیما اکبری",
        skills: [{ id: 1, name: "UI/UX" }],
      },
      {
        id: 23,
        img: "Null",
        name: "A",
        color: "success",
        fullname: "اناهید همتی",
        skills: [{ id: 1, name: "بک اند" }],
      },
      {
        id: 24,
        img: avatar2,
        fullname: "دانیال صداقت",
        skills: [
          { id: 1, name: "فرانت اند" },
          { id: 2, name: "UI" },
        ],
      },
    ],
    startDate: "08 آذر, 1402",
    projectDetails: {
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد",
      points: [
        "برای دستیابی به این امر، لازم است",
        "وجود جداگانه کمی غیر منطقی است.",
        "اگر چند زبان با هم ادغام شوند",
      ],
    },
    files: [
      { name: "Skote Landing.Zip", size: "3.25 MB", link: "#" },
      { name: "Skote Admin.Zip", size: "3.15 MB", link: "#" },
      { name: "Skote Logo.Zip", size: "2.02 MB", link: "#" },
      { name: "Veltrix admin.Zip", size: "2.25 MB", link: "#" },
    ],
    comments: [
      {
        id: 1,
        username: "داوود اسکندری",
        userImg: avatar2,
        comment: "وجود جداگانه کمی غیر منطقی است.",
      },
      {
        id: 2,
        username: "شهاب اکبری",
        userImg: avatar3,
        comment: "به عنوان یک دوست این فوق العاده است ",
        reply: {
          username: "نیما سعادت",
          comment: "پروژه های محشری رو میبینم",
        },
      },
      {
        id: 3,
        username: "ایمان پناهی",
        comment: " وجود جداگانه کمی غیر منطقی است.",
      },
    ],
  },
  {
    id: 10,
    img: companies02,
    name: "طراحی جدید",
    description: "به سادگی Occidental خواهد بود",
    status: "تکمیل شده",
    color: "success",
    dueDate: "15 بهمن, 19",
    commentsCount: 214,
    team: [
      {
        id: 25,
        img: "Null",
        name: "L",
        color: "pink",
        fullname: "Lony Mackay",
      },
      { id: 26, img: avatar2, fullname: "کارن عباسی" },
    ],
    startDate: "08 اردیبهشت, 1402",
    projectDetails: {
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد",
      points: [
        "برای دستیابی به این امر، لازم است",
        "وجود جداگانه کمی غیر منطقی است.",
        "اگر چند زبان با هم ادغام شوند",
      ],
    },
    files: [
      { name: "Skote Landing.Zip", size: "3.25 MB", link: "#" },
      { name: "Skote Admin.Zip", size: "3.15 MB", link: "#" },
      { name: "Skote Logo.Zip", size: "2.02 MB", link: "#" },
      { name: "Veltrix admin.Zip", size: "2.25 MB", link: "#" },
    ],
    comments: [
      {
        id: 1,
        username: "همایون سعادت",
        userImg: avatar2,
        comment: "وجود جداگانه کمی غیر منطقی است.",
      },
      {
        id: 2,
        username: "سهیل امامی",
        userImg: avatar3,
        comment: "به عنوان یک دوست این فوق العاده است ",
        reply: {
          username: "فریده محبی",
          comment: "پروژه های محشری رو میبینم",
        },
      },
      {
        id: 3,
        username: "نرگس میری",
        comment: " وجود جداگانه کمی غیر منطقی است.",
      },
    ],
  },
  {
    id: 11,
    img: companies02,
    name: "طراحی ادمین جدید",
    description: "به سادگی Occidental خواهد بود",
    status: "تکمیل شده",
    color: "success",
    dueDate: "15 بهمن, 19",
    commentsCount: 214,
    team: [
      {
        id: 27,
        img: avatar4,
        fullname: "دلینا خوش برخورد",
        skills: [
          { id: 1, name: "Frontend" },
          { id: 2, name: "UI" },
        ],
      },
      {
        id: 28,
        img: "Null",
        name: "A",
        color: "success",
        fullname: "ستاره عباسی",
        skills: [{ id: 1, name: "بک اند" }],
      },
      {
        id: 29,
        img: avatar5,
        fullname: "سیمین زاهدی",
        skills: [{ id: 1, name: "UI/UX" }],
      },
    ],
    startDate: "08 فروردین, 1402",
    projectDetails: {
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد",
      points: [
        "برای دستیابی به این امر، لازم است",
        "وجود جداگانه کمی غیر منطقی است.",
        "اگر چند زبان با هم ادغام شوند",
      ],
    },
    files: [
      { name: "Skote Landing.Zip", size: "3.25 MB", link: "#" },
      { name: "Skote Admin.Zip", size: "3.15 MB", link: "#" },
      { name: "Skote Logo.Zip", size: "2.02 MB", link: "#" },
      { name: "Veltrix admin.Zip", size: "2.25 MB", link: "#" },
    ],
    comments: [
      {
        id: 1,
        username: "صادق فتحی",
        userImg: avatar2,
        comment: "وجود جداگانه کمی غیر منطقی است.",
      },
      {
        id: 2,
        username: "ابراهیم راد",
        userImg: avatar3,
        comment: "به عنوان یک دوست این فوق العاده است ",
        reply: {
          username: "لیلا فتحی",
          comment: "پروژه های محشری رو میبینم",
        },
      },
      {
        id: 3,
        username: "نیما قربانی",
        comment: " وجود جداگانه کمی غیر منطقی است.",
      },
    ],
  },
];

const options = {
  chart: {
    height: 290,
    type: "bar",
    toolbar: {
      show: !1,
    },
  },
  plotOptions: {
    bar: {
      columnWidth: "14%",
      endingShape: "rounded",
    },
  },
  dataLabels: {
    enabled: !1,
  },
  series: [
    {
      name: "بررسی اجمالی",
      data: [42, 56, 40, 64, 26, 42, 56, 35, 62],
    },
  ],
  grid: {
    yaxis: {
      lines: {
        show: !1,
      },
    },
  },
  yaxis: {
    title: {
      text: "% (Percentage)",
    },
  },
  xaxis: {
    labels: {
      rotate: -90,
    },
    categories: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    title: {
      text: "هفته",
    },
  },
  colors: ["#556ee6"],
};

const series = [
  {
    name: "بررسی اجمالی",
    data: [42, 56, 40, 64, 26, 42, 56, 35, 62],
  },
];

const projectListData = [
  {
    id: 1,
    img: companies01,
    name: "طراحی ادمین جدید",
    description: "به سادگی Occidental خواهد بود",
    dueDate: "15 دی, 19",
    status: "تکمیل شده",
    color: "success",
    isProfile: true,

    team: [
      {
        id: 1,
        img: avatar4,
      },
      {
        id: 2,
        img: avatar5,
      },
      {
        id: 3,
        profile: "A",
        profileColor: "success",
      },
      {
        id: 4,
        img: avatar2,
      },
    ],
  },
  {
    id: 2,
    img: companies02,
    name: "طراحی لوگوی برند",
    description: "برای رسیدن به آن ضروری خواهد بود",
    dueDate: "22 اسفند, 19",
    status: "در حال پردازش",
    color: "warning",
    team: [
      { id: 1, img: avatar1 },
      { id: 2, img: avatar3 },
    ],
  },
  {
    id: 3,
    img: companies03,
    name: "New Landing Design",
    description: "برای علم، موسیقی، ورزش و غیره",
    dueDate: "13 اسفند, 19",
    status: "به تاخیر انداختن",
    color: "danger",
    team: [
      { id: 1, img: avatar3 },
      { id: 2, img: avatar8 },
      { id: 2, img: avatar6 },
    ],
  },
  {
    id: 4,
    img: companies04,
    name: "طراحی مجدد - صفحه لندینگ",
    description: "اگر چند زبان با هم ادغام شوند",
    dueDate: "14 بهمن, 19",
    status: "تکمیل شده",
    color: "success",
    team: [
      { id: 1, img: avatar5 },
      {
        id: 2,
        profile: "R",
        profileColor: "warning",
      },
      { id: 3, img: avatar2 },
    ],
  },
  {
    id: 5,
    img: companies05,
    name: "رابط کاربری داشبورد Skote",
    description: "وجود جداگانه کمی غیر منطقی است",
    dueDate: "22 دی, 19",
    status: "تکمیل شده",
    color: "success",
    team: [
      { id: 1, img: avatar4 },
      { id: 2, img: avatar1 },
    ],
  },
  {
    id: 6,
    img: companies06,
    name: "رابط کاربری قالب وبلاگ",
    description: " برای علم، موسیقی، ورزش و غیره",
    dueDate: "24 Oct, 19",
    status: "در حال پردازش",
    color: "warning",
    team: [
      {
        id: 1,
        profile: "A",
        profileColor: "danger",
      },
      { id: 2, img: avatar2 },
    ],
  },
  {
    id: 7,
    img: companies03,
    name: "لندینگ چند منظوره",
    description: "به سادگی Occidental خواهد بود",
    dueDate: "15 آبان, 19",
    status: "به تاخیر انداختن",
    color: "danger",
    team: [
      { id: 1, img: avatar4 },
      { id: 2, img: avatar5 },
      { id: 3, img: avatar2 },
    ],
  },
];

const OverviewTeamMember = [
  {
    id: 1,
    img: avatar2,
    title: "دانیال هاشمی",
    label_1: "فرانت اند",
    label_2: "UI",
  },
  {
    id: 2,
    img: avatar1,
    title: "فرشته دارابی",
    label_1: "UI / UX",
  },
  {
    id: 3,
    title: "ستاره راد",
    label_1: "بک اند",
    profile: "C",
  },
  {
    id: 4,
    img: avatar4,
    title: "حامد نوری",
    label_1: "فرانت اند",
    label_2: "UI",
  },
  {
    id: 4,
    title: "همایون عباسی",
    label_1: "بک اند",
    profile: "T",
  },
];

const projectAssignedTo = [
  {
    id: 1,
    name: "محمد طالب",
    imageSrc: avatar2,
  },
  {
    id: 2,
    name: "پریناز داوودی",
    imageSrc: avatar3,
  },
  {
    id: 3,
    name: "لاله همایونی",
    imageSrc: avatar4,
  },
  {
    id: 4,
    name: "علی زمانی",
    imageSrc: avatar1,
  },
  {
    id: 5,
    name: "ساره خوش برخورد",
    imageSrc: avatar5,
  },
  {
    id: 6,
    name: "ملیکا عباسی",
    imageSrc: avatar6,
  },
  {
    id: 7,
    name: "نگار پارسا",
    imageSrc: avatar7,
  },
  {
    id: 8,
    name: "کارن همایونی",
    imageSrc: avatar8,
  }
]

export { projects, options, series, projectListData, OverviewTeamMember,projectAssignedTo };
