const dahsboardEmail = [
  {
    id: "Year",
    Year: [
      {
        name: "سری A",
        data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48],
      },
      {
        name: "سری B",
        data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22],
      },
      {
        name: "سری C",
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18],
      },
    ],
  },
  {
    id: "Month",
    Month: [
      {
        name: "سری A",
        type: "bar",
        data: [34, 55, 21, 77, 32, 63, 86, 42, 34, 18, 16, 41],
      },
      {
        name: "سری B",
        type: "bar",
        data: [10, 63, 40, 80, 52, 41, 11, 32, 30, 86, 44, 33],
      },
      {
        name: "سری C",
        type: "bar",
        data: [11, 17, 15, 85, 21, 14, 80, 58, 17, 12, 20, 18],
      },
    ],
  },
  {
    id: "Week",
    Week: [
      {
        name: "سری A",
        type: "bar",
        data: [14, 52, 11, 57, 22, 33, 31, 22, 64, 14, 32, 68],
      },
      {
        name: "سری B",
        type: "bar",
        data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22],
      },
      {
        name: "سری C",
        type: "bar",
        data: [11, 17, 15, 15, 34, 55, 21, 18, 17, 12, 20, 18],
      },
    ],
  },
];

const latestTransaction = [
  {
    orderId: "#SK2545",
    billingName: "علی محبی",
    orderDate: "24 فروردین 1402",
    total: "تومان392.000",
    paymentStatus: "پرداخت شده",
    methodIcon: "fab fa-cc-paypal",
    paymentMethod: "پی پال",
  },
  {
    orderId: "#SK2544",
    billingName: "طاهره رستمی",
    orderDate: "12 خرداد 1400",
    total: "404.000تومان",
    paymentStatus: "بازپرداخت",
    methodIcon: "fab fa-cc-visa",
    paymentMethod: "ویزا",
  },
  {
    orderId: "#SK2543",
    billingName: "باربد فرخی",
    orderDate: "26 آذر 1401",
    total: "412,000,000 تومان",
    paymentStatus: "پرداخت شده",
    methodIcon: "fab fa-cc-mastercard",
    paymentMethod: "مستر کارت",
  },
  {
    orderId: "#SK2542",
    billingName: "ناهید میرآقایی",
    orderDate: "6 1399تیر ",
    total: "384.000 تومان",
    paymentStatus: "پرداخت شده",
    methodIcon: "fab fa-cc-paypal",
    paymentMethod: "پی پال",
  },
  {
    orderId: "#SK2541",
    billingName: "امیر نوری",
    orderDate: "17 اردیبهشت 1400",
    total: "380.000 تومان",
    paymentStatus: "تمدید مجدد",
    methodIcon: "fab fa-cc-visa",
    paymentMethod: "ویزا",
  },
  {
    orderId: "#SK2540",
    billingName: "الناز عبدی",
    orderDate: "23 خرداد 1400",
    total: "400.000 تومان",
    paymentStatus: "پرداخت شده",
    methodIcon: "fab fa-cc-mastercard",
    paymentMethod: "مستر کارت",
  },
];

const activityData = [
  {
    id: 1,
    active: false,
    date: "22 فروردین",
    activity: "به فعالیت های داوطلبانه نیز پاسخ داد",
  },
  {
    id: 2,
    active: false,
    date: "17 خرداد",
    activity: "همه می دانند که چرا یک زبان مشترک جدید مطلوب است. ...ادامه مطلب",
  },
  {
    id: 3,
    active: true,
    date: "25 تیر",
    activity: "به گروه انجمن هیئت مدیره پیوست",
  },
  {
    id: 4,
    active: false,
    date: "14 مهر",
    activity: "پاسخ به نیاز در اولین فرصت",
  },
];

const TopCitiesSelling = [
    {
        id: 1,
        location: "تهران",
        value: "1,456",
        progress: {
            value: "94",
            color: "primary"
        }
    },
    {
        id: 2,
        location: "مشهد",
        value: "1,123",
        progress: {
            value: "82",
            color: "success"
        }
    },
    {
        id: 3,
        location: "اصفهان",
        value: "1,026",
        progress: {
            value: "70",
            color: "warning"
        }
    }
]


export { dahsboardEmail, activityData, latestTransaction, TopCitiesSelling };