// img
import img1 from "../../assets/images/companies/img-1.png";
import img2 from "../../assets/images/companies/img-2.png";
import img3 from "../../assets/images/companies/img-3.png";

const walletOptions = [
    {
        id: "1",
        series: [76, 67, 61],
        availablebalance: 9575.39,
        income: 5749.46,
        Expense: 1698.38,
        Ethereum: {
            ETH: 1.5236,
            Dollar: 1123.64
        },
        Bitcoin: {
            BTC: 0.4412,
            Dollar: 2968.29
        },
        Litecoin: {
            LTC: 17.4169,
            Dollar: 1169.47
        }
    },
    {
        id: '2',
        series: [76, 40, 60],
        availablebalance: 6134.39,
        income: 2698.46,
        Expense: 845.38,
        Ethereum: {
            ETH: 7.5698,
            Dollar: 3657.19
        },
        Bitcoin: {
            BTC: 2.8527,
            Dollar: 7459.62
        },
        Litecoin: {
            LTC: 43.4985,
            Dollar: 4789.93
        }
    },
    {
        id: '3',
        series: [20, 55, 61],
        availablebalance: 5296.39,
        income: 4126.12,
        Expense: 568.49,
        Ethereum: {
            ETH: 5.6781,
            Dollar: 958.52
        },
        Bitcoin: {
            BTC: 1.5269,
            Dollar: 5239.16
        },
        Litecoin: {
            LTC: 49.5987,
            Dollar: 3698.13
        }
    },
    {
        id: '4',
        series: [70, 67, 40],
        availablebalance: 6134.39,
        income: 2632.46,
        Expense: 924.38,
        Ethereum: {
            ETH: 4.5701,
            Dollar: 1123.64
        },
        Bitcoin: {
            BTC: 0.4412,
            Dollar: 4025.32
        },
        Litecoin: {
            LTC: 35.3811,
            Dollar: 2263.09
        }
    }
]

const transactionsDataALL = [
  {
    id: 1,
    icon: "bx-down-arrow-circle",
    color: "primary",
    type: "خرید",
    currency: "BTC",
    date: "14 تیر, 1402",
    amount: "0.016 BTC",
    price: "تومان 125.20",
  },
  {
    id: 2,
    icon: "bx-up-arrow-circle",
    color: "danger",
    type: "فروش",
    currency: "ETH",
    date: "15 خرداد, 1401",
    amount: "0.56 ETH",
    price: " تومان112.34",
  },
  {
    id: 3,
    icon: "bx-down-arrow-circle",
    color: "primary",
    type: "خرید",
    currency: "LTC",
    date: "16 ابان, 1399",
    amount: "1.88 LTC",
    price: "تومان 94.22",
  },
  {
    id: 4,
    icon: "bx-down-arrow-circle",
    color: "primary",
    type: "خرید",
    currency: "ETH",
    date: "17 دی, 1400",
    amount: "0.42 ETH",
    price: "تومان 84.32",
  },
  {
    id: 5,
    icon: "bx-up-arrow-circle",
    color: "danger",
    type: "فروش",
    currency: "BTC",
    date: "18 فروردین, 1402",
    amount: "0.018 BTC",
    price: "تومان 145.80",
  },
  {
    id: 6,
    icon: "bx-down-arrow-circle",
    color: "primary",
    type: "خرید",
    currency: "BTC",
    date: "14 اسفند, 1401",
    amount: "0.016 BTC",
    price: "تومان 125.20",
  },
  {
    id: 7,
    icon: "bx-up-arrow-circle",
    color: "danger",
    type: "فروش",
    currency: "ETH",
    date: "15 خرداد, 1399",
    amount: "0.56 ETH",
    price: " تومان 112.34",
  },
];
const transactionsDataBuy = [
  {
    id: 1,
    icon: "bx-up-arrow-circle",
    color: "danger",
    type: "فروش",
    currency: "ETH",
    date: "15 مهر, 1402",
    amount: "0.56 ETH",
    price: "تومان 112.34",
  },
  {
    id: 2,
    icon: "bx-down-arrow-circle",
    color: "primary",
    type: "خرید",
    currency: "BTC",
    date: "14 بهمن, 1400",
    amount: "0.016 BTC",
    price: "تومان 125.20",
  },
  {
    id: 3,
    icon: "bx-down-arrow-circle",
    color: "primary",
    type: "خرید",
    currency: "ETH",
    date: "17 اردیبهشت, 1401",
    amount: "0.42 ETH",
    price: "تومان 84.32",
  },
  {
    id: 4,
    icon: "bx-down-arrow-circle",
    color: "primary",
    type: "خرید",
    currency: "LTC",
    date: "16 تیر, 1400",
    amount: "1.88 LTC",
    price: "تومان 94.22",
  },
  {
    id: 5,
    icon: "bx-down-arrow-circle",
    color: "primary",
    type: "خرید",
    currency: "BTC",
    date: "14 خرداد, 1400",
    amount: "0.016 BTC",
    price: "تومان 125.20",
  },
  {
    id: 6,
    icon: "bx-up-arrow-circle",
    color: "danger",
    type: "فروش",
    currency: "BTC",
    date: "18 ابان, 1399",
    amount: "0.018 BTC",
    price: "تومان 145.80",
  },
  {
    id: 7,
    icon: "bx-up-arrow-circle",
    color: "danger",
    type: "فروش",
    currency: "ETH",
    date: "15 آذر, 1402",
    amount: "0.56 ETH",
    price: "تومان 112.34",
  },
];

const transactionsDataSell = [
  {
    id: 1,
    icon: "bx-down-arrow-circle",
    color: "primary",
    type: "خرید",
    currency: "BTC",
    date: "14 دی, 1400",
    amount: "0.016 BTC",
    price: "تومان 125.20",
  },
  {
    id: 2,
    icon: "bx-down-arrow-circle",
    color: "primary",
    type: "خرید",
    currency: "LTC",
    date: "16 دی, 1400",
    amount: "1.88 LTC",
    price: "تومان 94.22",
  },
  {
    id: 3,
    icon: "bx-down-arrow-circle",
    color: "primary",
    type: "خرید",
    currency: "ETH",
    date: "17 فروردین, 1398",
    amount: "0.42 ETH",
    price: "تومان 84.32",
  },
  {
    id: 4,
    icon: "bx-up-arrow-circle",
    color: "danger",
    type: "فروش",
    currency: "ETH",
    date: "15 مرداد, 1401",
    amount: "0.56 ETH",
    price: "تومان 112.34",
  },
  {
    id: 5,
    icon: "bx-up-arrow-circle",
    color: "danger",
    type: "فروش",
    currency: "BTC",
    date: "18 مرداد, 1401",
    amount: "0.018 BTC",
    price: " تومان 145.80  ",
  },
  {
    id: 6,
    icon: "bx-up-arrow-circle",
    color: "danger",
    type: "فروش",
    currency: "ETH",
    date: "15 تیر, 1400",
    amount: "0.56 ETH",
    price: "تومان 112.34",
  },
  {
    id: 7,
    icon: "bx-down-arrow-circle",
    color: "primary",
    type: "خرید",
    currency: "BTC",
    date: "14 ابان, 1402",
    amount: "0.016 BTC",
    price: "تومان 125.20",
  },
];
const notificationsData = [
  {
    id: 1,
    avatar: img1,
    title: "زبان چند منظوره",
    description: "اگر چند زبان با هم ادغام شوند، گرامر زبان حاصل",
    author: "علی ",
    date: "12 خرداد, 1402",
  },
  {
    id: 2,
    avatar: img2,
    title: "راحت ترین روش اموزش",
    description:
      "برای یک فرد انگلیسی، مانند یک کمبریج  انگلیسی ساده شده به نظر می رسد",
    author: "هانیه",
    date: "13 تیر, 1402",
  },
  {
    id: 3,
    avatar: img3,
    title: "اقدامات مهم",
    description:
      "برای اولین بار بسته ی اموزشی چند زبانه",
    author: "درسا",
    date: "14 مهر, 1402",
  },
  {
    id: 4,
    avatar: img1,
    title: "دسته بندی",
    description:
      "سر فصل های اموزش را به صورت رایگان دریافت کنید",
    author: "حامد",
    date: "12 آبان, 1402",
  },
];

const cryptoReports = [
    {
        title: " بیت کوین",
        icon: "mdi mdi-bitcoin",
        color: "warning",
        value: "تومان 9134.39",
        desc: "+ 0.0012 ( 0.2 % ) ",
        series: [
            {
                name: "BTC",
                data: [12, 14, 2, 47, 42, 15, 47, 75, 65, 19, 14]
            },
        ],
        options: {
            chart: { sparkline: { enabled: !0 } },
            stroke: { curve: "smooth", width: 2 },
            colors: ["#f1b44c"],
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: false,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [25, 100, 100, 100],
                },
            },
            tooltip: { fixed: { enabled: false }, x: { show: false }, marker: { show: false } },
        },
        arrowUpDown: 'mdi mdi-arrow-up ms-1 text-success'
    },
    {
        title: " اتریوم",
        icon: "mdi mdi-ethereum",
        color: "primary",
        value: "تومان 245.44",
        desc: "- 4.102 ( 0.1 % ) ",
        series: [
            {
                name: "ETH",
                data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54]
            },
        ],
        options: {
            chart: { sparkline: { enabled: !0 } },
            stroke: { curve: "smooth", width: 2 },
            colors: ["#556ee6"],
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: false,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [25, 100, 100, 100],
                },
            },
            tooltip: { fixed: { enabled: false }, x: { show: false }, marker: { show: false } },
        },
        arrowUpDown: 'mdi mdi-arrow-down ms-1 text-danger'
    },
    {
        title: " لایت کوین",
        icon: "mdi mdi-litecoin",
        color: "info",
        value: "تومان 63.61",
        desc: "+ 1.792 ( 0.1 % ) ",
        series: [
            {
                name: "LTC",
                data: [35, 53, 93, 47, 54, 24, 47, 75, 65, 19, 14]
            },
        ],
        options: {
            chart: { sparkline: { enabled: !0 } },
            stroke: { curve: "smooth", width: 2 },
            colors: ["#50a5f1"],
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: false,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [25, 100, 100, 100],
                },
            },
            tooltip: { fixed: { enabled: false }, x: { show: false }, marker: { show: false } },
        },
        arrowUpDown: 'mdi mdi-arrow-up ms-1 text-success'
    },
];


export {
    walletOptions,
    transactionsDataALL,
    transactionsDataBuy,
    transactionsDataSell,
    notificationsData,
    cryptoReports
};