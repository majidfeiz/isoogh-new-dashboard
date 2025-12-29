//import images
import airbnb from "../../assets/images/companies/airbnb.svg";
import mailChimp from "../../assets/images/companies/mailchimp.svg";
import reddit from "../../assets/images/companies/reddit.svg";
import amzon from "../../assets/images/companies/amazon.svg";
import adobPhotoShop from "../../assets/images/companies/adobe-photoshop.svg";
import line from "../../assets/images/companies/line.svg";
import weChat from "../../assets/images/companies/wechat.svg";
import sass from "../../assets/images/companies/sass.svg";
import adobe from "../../assets/images/companies/adobe.svg";
import flutter from "../../assets/images/companies/flutter.svg";
import spotify from "../../assets/images/companies/spotify.svg";
import avatar5 from '../../assets/images/users/avatar-5.jpg';

const jobVacancyData = [
  {
    id: 1,
    img: airbnb,
    title: "مدیر پروژه",
    country: " ایران",
    vacancy: 8,
  },
  {
    id: 2,
    img: mailChimp,
    title: "مدیر بازاریابی",
    country: "ایران",
    vacancy: 12,
  },
  {
    id: 3,
    img: reddit,
    title: "طراح محصول",
    country: "قطر",
    vacancy: 25,
  },
  {
    id: 4,
    img: amzon,
    title: "توسعه دهنده Magento",
    country: "عمان",
    vacancy: 8,
  },
  {
    id: 5,
    img: adobPhotoShop,
    title: "کارشناس فروش محصولات",
    country: " ایران",
    vacancy: 1,
  },
  {
    id: 6,
    img: line,
    title: "همکار تجاری",
    country: " ایران",
    vacancy: 15,
  },
];

const statisticsApplications = [
    {
        id: 1,
        data: {
            company: [30, 48, 28, 74, 39, 87, 54, 36, 50, 87, 84],
            newJobs: [20, 50, 42, 10, 24, 28, 60, 35, 47, 64, 78],
            totalJobs: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
            jobView: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
        }
    },
    {
        id: 2,
        data: {
            company: [25, 95, 87, 14, 56, 12, 14, 56, 35, 14, 25],
            newJobs: [85, 87, 56, 45, 14, 87, 56, 98, 19, 51, 78, 49],
            totalJobs: [85, 75, 95, 48, 59, 68, 15, 35, 26, 45, 59, 57],
            jobView: [78, 89, 84, 98, 67, 59, 48, 42, 35, 29, 18, 59],
        }
    },
    {
        id: 3,
        data: {
            company: [30, 48, 28, 74, 39, 87, 54, 56, 35, 14, 30],
            newJobs: [52, 43, 69, 75, 49, 28, 56, 19, 51, 60, 49],
            totalJobs: [57, 49, 68, 87, 71, 29, 49, 26, 50, 59, 57],
            jobView: [78, 84, 95, 76, 68, 57, 48, 35, 29, 20, 59],
        }
    }
];
const recentAddedJobsData = [
  {
    logo: weChat,
    jobTitle: "مدیر بازاریابی",
    company: "جهان گستر ، ایران",
    postedTime: "53",
    postedText: "دقایقی پیش",
  },
  {
    logo: sass,
    jobTitle: "توسعه دهنده Frontend",
    company: "کارشین ، ایران",
    postedTime: "47",
    postedText: "دقایقی پیش",
  },
  {
    logo: adobe,
    jobTitle: "توسعه دهنده ری اکت",
    company: "قلم خلاق ، ایران",
    postedTime: "1",
    postedText: "ساعاتی پیش",
  },
  {
    logo: airbnb,
    jobTitle: "NodeJs توسعه دهنده ی",
    company: "اسکات ، قطر",
    postedTime: "2",
    postedText: "ساعاتی پیش",
  },
  {
    logo: flutter,
    jobTitle: "بازاریابی دیجیتال",
    company: "وب تکنولوژی ، ایران",
    postedTime: "8",
    postedText: "ساعاتی پیش",
  },
  {
    logo: mailChimp,
    jobTitle: "مدیر بازاریابی",
    company: "اسکات تکنولوژی ، عمان",
    postedTime: "1",
    postedText: "یک روز پیش",
  },
  {
    logo: spotify,
    jobTitle: "همکار تجاری",
    company: "Themesbrand, قطر",
    postedTime: "2",
    postedText: "چند روز پیش",
  },
  {
    logo: reddit,
    jobTitle: "Backend توسعه دهنده",
    company: "Adobe Agency,  قطر",
    postedTime: "3",
    postedText: "چند روز پیش",
  },
];

const activityFeedData = [
  {
    type: "اپلیکیشن",
    name: "کیانا صادفی",
    action: "برای کار درخواست داد",
    jobTitle: "توسعه دهنده Sr.frontend",
    timestamp: "3 دقیقه قبل",
    img: avatar5,
  },
  {
    type: "اشتراک",
    message: "اشتراک شما امروز به اتمام می رسد",
    actionLink: "#",
    timestamp: "53 دقیقه قبل",
  },
  {
    type: "ایجاد حساب کاربری",
    name: "نرگس ابراهیمی",
    action: "یک حساب کاربری جدید به عنوان یک ایجاد کرد",
    accountType: "فریلنسر",
    timestamp: "1 ساعت قبل",
  },
  {
    type: "اپلیکیشن",
    name: "حامد محمدی",
    action: "برای کار درخواست داد",
    jobTitle: "مدیر پروژه",
    timestamp: "3 ساعت قبل",
    img: avatar5,
  },
  {
    type: "ایجاد حساب کاربری",
    name: "سارا عبدی",
    action: "یک حساب کاربری جدید به عنوان یک ایجاد کرد",
    accountType: "فریلنسر",
    timestamp: "1 ساعت قبل",
  },
];

const chartsData = [
  {
    id: 1,
    title: "نمای شغل",
    price: "14,487",
    perstangeValue: "18.89",
    badgeColor: "success",
    seriesData: [
      {
        name: "نمای شغل",
        data: [36, 21, 65, 22, 35, 50, 87, 98],
      },
    ],
    color: '["--bs-success", "--bs-transparent"]',
  },
  {
    id: 2,
    title: "برنامه جدید",
    price: "7,402",
    perstangeValue: "24.07",
    badgeColor: "success",
    seriesData: [
      {
        name: "برنامه جدید",
        data: [36, 48, 10, 74, 35, 50, 70, 73],
      },
    ],
    color: '["--bs-success", "--bs-transparent"]',
  },
  {
    id: 3,
    title: "مجموع تایید شده",
    price: "12,487",
    perstangeValue: " 8.41",
    badgeColor: "success",
    seriesData: [
      {
        name: "مجموع تایید شده",
        data: [60, 14, 5, 60, 30, 43, 65, 84],
      },
    ],
    color: '["--bs-success", "--bs-transparent"]',
  },
  {
    id: 4,
    title: "مجموع پروژه ها",
    price: "12,487",
    perstangeValue: " 20.63",
    badgeColor: "danger",
    istrendingArrow: true,
    seriesData: [
      {
        name: "مجموع پروژه ها",
        data: [32, 22, 7, 55, 20, 45, 36, 20],
      },
    ],
    color: '["--bs-danger", "--bs-transparent"]',
  },
];

export { jobVacancyData, statisticsApplications, recentAddedJobsData, activityFeedData, chartsData };