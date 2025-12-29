//Import images
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar6 from "../../assets/images/users/avatar-6.jpg";

const inboxmails = [
  {
    id: 1,
    name: "نورا, من (3)",
    description:
      "<a class='subject' href='#'>سلام – <span class='teaser'>سفر اینطوری ترتیب داده شده که تو اول بیایی دنبال من ،منتظرتم :)</span></a>",
    read: true,
    fav: false,
    date: "مهر 6",
  },
  {
    id: 2,
    name: "من, سهیل (7)",
    description:
      "<a href='#' class='subject'> <span class='bg-warning badge me-2'> آزاد </span> از اونجایی که پرسیدی و من به طرز غیرقابل تصوری در ایستگاه قطار حوصله ام سر رفته است </span></a>",
    read: true,
    fav: false,
    date: "مهر 6",
  },
  {
    id: 3,
    name: "پشتیبانی وب دنیس",
    description:
      "<a href='#' class='subject'>پاسخ: تنظیمات ایمیل جدید – <span class='teaser'> میتونی جواب بدی </span></a>",
    read: true,
    fav: false,
    date: "مهر 7",
  },
  {
    id: 4,
    name: "من, نیما (2)",
    description:
      "<a href='#' class='subject'> <span class='bg-info badge me-2'> پشتیبانی </span> پنجشنبه تعطیل است - <span class='teaser'> برای گرفتن نقشه ها به دفتر من بیایید </span></a>",
    read: true,
    fav: false,
    date: "مهر 4",
  },
  {
    id: 5,
    name: "ملیکا",
    description:
      "<a href='#' class='subject'> <span class='bg-primary badge me-2'> اجتماعی </span> داستان های این هفته – <span class='teaser'> اشتراک در سایت این هفته رایگان است </span></a>",
    read: true,
    fav: false,
    date: "آبان 28",
  },
  {
    id: 6,
    name: "مهندس تهرانی",
    description:
      "<a href='#' class='subject'> عکس های سمینار – <span class='teaser'> ادیت عکس های سمینار تمام شده ؟ </span></a>",
    read: true,
    fav: false,
    date: "آبان 28",
  },
  {
    id: 7,
    name: "ریما, من (5)",
    description:
      "<a href='#' class='subject'> <span class='bg-success badge me-2'> خانواده </span> آخرین عکس بر فراز روستای من – <span class='teaser'> بله من آن را دوست دارم! آیا ویدیویی را که از قطار سواری خود بین تهران و اصفهان به من نشان دادید، به خاطر دارید؟ اونی که منظره کوه داره؟ من خیلی دوست دارم آن یکی را دوباره ببینم! </span></a>",
    read: false,
    fav: false,
    date: "5:01 ق.ظ",
  },
  {
    id: 8,
    name: "ساحل ابراهیمی",
    description:
      "<a href='#' class='subject'> Mochila Beta: اشتراک تایید شد– <span class='teaser'> اشتراک شما تایید شد به شرکت ما خوش امدید </span></a>",
    read: true,
    fav: false,
    date: "مهر 8",
  },
  {
    id: 9,
    name: "شرکت HR",
    description:
      "<a href='#' class='subject'> پشتیبانی شرکت – <span class='teaser'> پنل کاربری خود را بروز کنید. </span></a>",
    read: true,
    fav: false,
    date: "مهر 8",
  },
  {
    id: 10,
    name: "نوری",
    description:
      "<a href='#' class='subject'> <span class='bg-danger badge me-2'> دوستان </span> اخر هفته – <span class='teaser'> برنامه ی جمعه باشه برای هفته ی بعد </span></a>",
    read: true,
    fav: false,
    date: "آبان 27",
  },
  {
    id: 11,
    name: "الین, من (5)",
    description:
      "<a href='#' class='subject'> در مورد جلسه ما – <span class='teaser'> عالی است، پنجشنبه می بینمت! </span></a>",
    read: true,
    fav: false,
    date: "آبان 24",
  },
  {
    id: 12,
    name: "کیمیا ",
    description:
      "<a href='#' class='subject'> <span class='bg-primary badge me-2'> اجتماعی </span> وظیفه تعیین شده: وب سایت ARP را کلون کنید – <span class='teaser'> Alex@Work روی صفحه وب به شما وظیفه ای محول کرده است</span></a>",
    read: true,
    fav: false,
    date: "آبان 24",
  },
  {
    id: 13,
    name: "مهندس تهرانی",
    description:
      "<a href='#' class='subject'> جلسه ی فردا – <span class='teaser'>سخنرانی بخش تکنولوژی به عهده ی شماس  </span></a>",
    read: true,
    fav: false,
    date: "آبان 23",
  },
  {
    id: 14,
    name: "هلیا, من (7)",
    description:
      "<a href='#' class='subject'>سلام – <span class='teaser'>فایل ها اپلود شد </span></a>",
    read: true,
    fav: false,
    date: "آبان 23",
  },
  {
    id: 15,
    name: "من, نورا (5)",
    description:
      "<a href='#' class='subject'> <span class='bg-info badge me-2'> پشتیبانی </span> خانه دوباره – <span class='teaser'> برای فردا همه چی امادس </span></a>",
    read: false,
    fav: false,
    date: "آبان 21",
  },
  {
    id: 16,
    name: "شرکت نوین",
    description:
      "<a href='#' class='subject'> 1 مورد جدید در صندوق ورودی Stackexchange شما – <span class='teaser'> موارد زیر از آخرین باری که آن را بررسی کردید به صندوق ورودی جهانی Stack Exchange شما اضافه شد </span></a>",
    read: true,
    fav: false,
    date: "آبان 21",
  },
  {
    id: 17,
    name: "Google Drive تیم",
    description:
      "<a href='#' class='subject'> اکنون می توانید از فضای ذخیره سازی خود در Google Drive استفاده کنید – <span class='teaser'> هی سارا توسلی! از خرید فضای ذخیره سازی اضافی در Google Drive سپاسگزاریم </span></a>",
    read: true,
    fav: false,
    date: "آبان 20",
  },
  {
    id: 18,
    name: "من, سهیل (11)",
    description:
      "<a href='#' class='subject'> قطار– <span class='teaser'> قطار اخر هفته ساعت چند به تهران می رسه ؟ </span></a>",
    read: true,
    fav: false,
    date: "آبان 19",
  },
];

const starredmails = [
  {
    id: 1,
    name: "سهیل, من (7)",
    description:
      "<a href='#' class='subject'> سلامم – <span class='teaser'> امروز ارائه ات خوب پیش رفت؟ </span></a>",
    read: true,
    fav: false,
    date: "آبان 23",
  },
  {
    id: 2,
    name: "من, نسترن (5)",
    description:
      "<a href='#' class='subject'> <span class='bg-info badge me-2'> پشتیبانی </span> خانه ای دوباره – <span class='teaser'> شبت بخیر  </span></a>",
    read: false,
    fav: false,
    date: "آبان 21",
  },
  {
    id: 3,
    name: "صرافی نهال",
    description:
      "<a href='#' class='subject'> 1 مورد جدید در صندوق ورودی Stackexchange شما – <span class='teaser'> موارد زیر از آخرین باری که آن را بررسی کردید به صندوق ورودی جهانی Stack Exchange شما اضافه شد</span></a>",
    read: true,
    fav: false,
    date: "آبان 21",
  },
  {
    id: 4,
    name: "Google Drive تیم",
    description:
      "<a href='#' class='subject'> اکنون می توانید از فضای ذخیره سازی خود در Google Drive استفاده کنید– <span class='teaser'> هی سارا توسلی! از خرید فضای ذخیره سازی اضافی در Google Drive سپاسگزاریم </span></a>",
    read: true,
    fav: false,
    date: "آبان 20",
  },
  {
    id: 5,
    name: "من, ساحل (11)",
    description:
      "<a href='#' class='subject'> قطار – <span class='teaser'> قطار اخر هفته برای ساعت چند میرسه به تهران ؟</span></a>",
    read: true,
    fav: false,
    date: "آبان 19",
  },
];

const importantmails = [
  {
    id: 1,
    name: "دلینا",
    description:
      "<a href='#' class='subject'> <span class='bg-danger badge me-2'> دوستان </span> Weekend on Revibe – <span class='teaser'> میتونی برای من نقشه هارو بفرستی با لینک ویدیو ها ؟ </span></a>",
    read: true,
    fav: false,
    date: "آبان 27",
  },
  {
    id: 2,
    name: "Erik, me (5)",
    description:
      "<a href='#' class='subject'> Regarding our meeting – <span class='teaser'> That's great, see you on Thursday! </span></a>",
    read: true,
    fav: false,
    date: "آبان 24",
  },
  {
    id: 3,
    name: "مهتاب موسوی",
    description:
      "<a href='#' class='subject'> <span class='bg-primary badge me-2'> اجتماعی </span> وظیفه تعیین شده: وب سایت ARP را کلون کنید – <span class='teaser'> Alex@Work روی صفحه وب به شما وظیفه ای محول کرده است</span></a>",
    read: true,
    fav: false,
    date: "آبان 24",
  },
  {
    id: 4,
    name: "تینا حامدی",
    description:
      "<a href='#' class='subject'> بریم کافه  – <span class='teaser'> برا امشب وقت داری بریم کافه ؟ </span></a>",
    read: true,
    fav: false,
    date: "آبان 23",
  },
  {
    id: 5,
    name: "حسین, من (7)",
    description:
      "<a href='#' class='subject'> سلامم – <span class='teaser'> ببخشید فایل ها دست شماست ؟ </span></a>",
    read: true,
    fav: false,
    date: "آبان 23",
  },
  {
    id: 6,
    name: "من, فرشته (5)",
    description:
      "<a href='#' class='subject'> <span class='bg-info badge me-2'> پشتیبانی </span>خانه ای دوباره – <span class='teaser'> این برای فردا خیلی عالیه  </span></a>",
    read: false,
    fav: false,
    date: "آبان 21",
  },
];

const draftmails = [
  {
    id: 1,
    name: "ملیکا",
    description:
      "<a href='#' class='subject'> <span class='bg-primary badge me-2'> اجتماعی </span> خبر های این هفته – <span class='teaser'> این هفته ی سنگینی بود بهت حف میدم خسته باشی برای خبر های امروز ادیت ویدیو ها با من </span></a>",
    read: true,
    fav: false,
    date: "آبان 28",
  },
  {
    id: 2,
    name: "سهام اصلی",
    description:
      "<a href='#' class='subject'> ارسال عکس – <span class='teaser'> عکس های واحد غربی را برای من ارسال کنید </span></a>",
    read: true,
    fav: false,
    date: "آبان 28",
  },
  {
    id: 3,
    name: "ریما, من (5)",
    description:
      "<a href='#' class='subject'> <span class='bg-success badge me-2'> خانواده </span> آخرین عکس بر فراز روستای من– <span class='teaser'>  آره من آن را دوست دارم! آیا ویدیویی را که از قطار سواری خود بین تهران و ایلام به من نشان دادید، به خاطر دارید؟ اونی که منظره کوه داره؟ من خیلی دوست دارم آن یکی را دوباره ببینم!</span></a>",
    read: false,
    fav: false,
    date: "5:01 am",
  },
  {
    id: 4,
    name: "اناهیتا اریانا",
    description:
      "<a href='#' class='subject'> Mochila Beta: اشتراک تایید شد – <span class='teaser'>  تایید شدی! به کلاس حاکم نام صندوق ورودی خوش آمدید. برای سوابق شما، در اینجا یک کپی از اطلاعاتی که برای ما ارسال کردید آمده است</span></a>",
    read: true,
    fav: false,
    date: "آبان 8",
  },
  {
    id: 5,
    name: "شرکت HR",
    description:
      "<a href='#' class='subject'> سرویس های ابری – <span class='teaser'>قیمت های جدید خرید سرور های ابری </span></a>",
    read: true,
    fav: false,
    date: "آبان 8",
  },
  {
    id: 6,
    name: "ریحانه ",
    description:
      "<a href='#' class='subject'> <span class='bg-danger badge me-2'> دوستان </span> آخر هفته در سرو – <span class='teaser'> اخر هفته در گالری سرو منتظرتم </span></a>",
    read: true,
    fav: false,
    date: "آبان 27",
  },
  {
    id: 7,
    name: "نازنین, من (5)",
    description:
      "<a href='#' class='subject'> Regarding our meeting – <span class='teaser'> That's great, see you on Thursday! </span></a>",
    read: true,
    fav: false,
    date: "آبان 24",
  },
];

const sentmails = [
  {
    id: 1,
    name: "پلتفرم HR",
    description:
      "<a href='#' class='subject'> پنل کاربری بروزرسانی شد – <span class='teaser'>به پنل کاربری خود سری بزنید تا از امکانات ان مطلع شوید </span></a>",
    read: true,
    fav: false,
    date: "آبان 8",
  },
  {
    id: 2,
    name: "رادمهر",
    description:
      "<a href='#' class='subject'> <span class='bg-danger badge me-2'> دوستان </span> اخر هفته – <span class='teaser'> برای تعطیلات اخر هفته برنامه ای نداری ؟ </span></a>",
    read: true,
    fav: false,
    date: "آبان 27",
  },
  {
    id: 3,
    name: "فریده, من (5)",
    description:
      "<a href='#' class='subject'> ملاقات – <span class='teaser'> ملاقات برای سه شنب هست ؟ </span></a>",
    read: true,
    fav: false,
    date: "آبان 24",
  },
  {
    id: 4,
    name: "کیان",
    description:
      "<a href='#' class='subject'> <span class='bg-primary badge me-2'> اجتماعی </span> وظیفه تعیین شده: وب سایت ARP را کلون کنید – <span class='teaser'> Alex@Work در صفحه وب به شما وظیفه ای محول کرده است </span></a>",
    read: true,
    fav: false,
    date: "آبان 24",
  },
  {
    id: 5,
    name: "اقای محمدی",
    description:
      "<a href='#' class='subject'> برای جلسه ی امروز – <span class='teaser'>سلام برای جلسه ی امروز فایل هارو فراموش نکنی </span></a>",
    read: true,
    fav: false,
    date: "آبان 23",
  },
  {
    id: 6,
    name: "مهندس نوری, من (7)",
    description:
      "<a href='#' class='subject'> سلام – <span class='teaser'> امروز ارائه داشتی ؟ </span></a>",
    read: true,
    fav: false,
    date: "آبان 23",
  },
  {
    id: 7,
    name: "من, ساره (5)",
    description:
      "<a href='#' class='subject'> <span class='bg-info badge me-2'> پشتیبانی </span> خانه ای دوباره – <span class='teaser'> این عالیه فردا میبینمت</span></a>",
    read: false,
    fav: false,
    date: "آبان 21",
  },
  {
    id: 8,
    name: "شرکت نهال",
    description:
      "<a href='#' class='subject'> 1 مورد جدید در صندوق ورودی Stackexchange شما – <span class='teaser'>موارد زیر از آخرین باری که آن را بررسی کردید به صندوق ورودی جهانی Stack Exchange شما اضافه شد </span></a>",
    read: true,
    fav: false,
    date: "آبان 21",
  },
];

const trashmails = [
  {
    id: 1,
    name: "امیری",
    description:
      "<a href='#' class='subject'> <span class='bg-primary badge me-2'> اجتماعی </span> وظیفه تعیین شده: وب سایت ARP را کلون کنید– <span class='teaser'> Alex@Work روی صفحه وب به شما وظیفه ای محول کرده است </span></a>",
    read: true,
    fav: false,
    date: "آبان 24",
  },
  {
    id: 2,
    name: "ایمان پارسا",
    description:
      "<a href='#' class='subject'> سمینار اخر هفته– <span class='teaser'> به عنوان سخنران بخش تکنولوژی دعوت شدی؟ </span></a>",
    read: true,
    fav: false,
    date: "آبان 23",
  },
  {
    id: 3,
    name: "تهرانی, من (7)",
    description:
      "<a href='#' class='subject'> سلام – <span class='teaser'> متاسفم که امروز توی جلسه تنها بودی </span></a>",
    read: true,
    fav: false,
    date: "آبان 23",
  },
  {
    id: 4,
    name: "من, نیما (5)",
    description:
      "<a href='#' class='subject'> <span class='bg-info badge me-2'> پشتیبانی </span> Home again! – <span class='teaser'> خیلی عالیه که فردا میبینمت</span></a>",
    read: false,
    fav: false,
    date: "آبان 21",
  },
];

const mailDB = {
  allmail: [
    {
      id: 1,
      name: "اناهید, من (3)",
      description:
        "<a class='subject' href='#'>سلام – <span class='teaser'>سفر به خانه از زهرا ترتیب داده شده است، سپس نرگس می آید من را از تهران بیاورد. :)</span></a>",
      read: true,
      starred: true,
      date: "مهر 6",
      category: "ستاره دار",
    },
    {
      id: 2,
      name: "من, سورن (7)",
      description:
        "<a href='#' class='subject'> <span class='bg-warning badge me-2'> آزاد </span> از اونجایی که پرسیدی و من به طرز غیر قابل تصوری در ایستگاه قطار حوصله ام سر رفته است – <span class='teaser'> باشه ممنون من باید آن را دوباره رزرو کنم، با شما تماس خواهم گرفت </span></a>",
      read: true,
      starred: false,
      date: "مهر 6",
      category: "ارسال شده",
    },
    {
      id: 3,
      name: "پشتیبانی وب دنیس",
      description:
        "<a href='#' class='subject'> تنظیمات جدید– <span class='teaser'> آیا در اسرع وقت به او پاسخ می دهید؟ </span></a>",
      read: true,
      starred: false,
      date: "مهر 7",
      category: "مهم",
    },
    {
      id: 4,
      name: "من, پرهام (2)",
      description:
        "<a href='#' class='subject'> <span class='bg-info badge me-2'> پشتیبانی </span> چهارشنبه تعطیل است - <span class='teaser'>برای خرید تلفن مورد علاقه ی خود استوری های این هفته ی من رو درباره جشنواره تخفیف از دست ندید</span></a>",
      read: true,
      starred: false,
      date: "مهر 4",
      category: "ورودی",
    },
    {
      id: 5,
      name: "ملیکا",
      description:
        "<a href='#' class='subject'> <span class='bg-primary badge me-2'> اجتماعی </span> بهترین داستان های این ماه – <span class='teaser'> بهترین  انتخاب های من برای شما در صفحه ی خودم آپلود شد </span></a>",
      read: true,
      starred: true,
      date: "آبان 28",
      category: "ستاره دار",
    },
    {
      id: 6,
      name: "سهام اصل",
      description:
        "<a href='#' class='subject'>سهام ماهانه– <span class='teaser'> برای دریافت سهام های این ماه باید به شرکت بیایید</span></a>",
      read: true,
      starred: false,
      date: "آبان 28",
      category: 2,
    },
    {
      id: 7,
      name: "رادین, من (5)",
      description:
        "<a href='#' class='subject'> <span class='bg-success badge me-2'> خانواده </span> اخر هفته برنامه ی سفر خانوادگی اوکیه وقت کردی بهم یه زنگ بزن </span></a>",
      read: false,
      starred: false,
      date: "5:01 ق.ظ",
      category: "ورودی",
    },
    {
      id: 8,
      name: "آرمان همتی",
      description:
        "<a href='#' class='subject'> اشتراک تایید شد – <span class='teaser'>اشتراک شما توسط تیم ما تایید شد خوشحالیم که به تیم ما پیوستید </span></a>",
      read: true,
      starred: false,
      date: "آبان 8",
      category: "ورودی",
    },
    {
      id: 9,
      name: "پلتفرم HR",
      description:
        "<a href='#' class='subject'>  سرویس انتخابی شما – <span class='teaser'> سرویس انتخابی شما نیاز به بروزرسانی دارد </span></a>",
      read: true,
      starred: false,
      date: "آبان 8",
      category: "ورودی",
    },
    {
      id: 10,
      name: "محسن",
      description:
        "<a href='#' class='subject'> <span class='bg-danger badge me-2'> دوستان </span> اخر هفته با موسیقی – <span class='teaser'> خوشحالم که اخر هفته در سمینار الهام گرفتن از موسیقی من شرکت میکنی منتظرتم </span></a>",
      read: true,
      starred: false,
      date: "آبان 27",
      category: "ورودی",
    },
    {
      id: 11,
      name: "الین, من (5)",
      description:
        "<a href='#' class='subject'> در مورد جلسه ما – <span class='teaser'> خوشحالم سه شنبه میبینمت</span></a>",
      read: true,
      starred: true,
      date: "آبان 24",
      category: "ستاره دار",
    },
    {
      id: 12,
      name: "نرگس",
      description:
        "<a href='#' class='subject'> <span class='bg-primary badge me-2'> اجتماعی </span> وظیفه محول شده: کلون کردن وب سایت ARP - <span class='teaser'> توسط Alex@Work در وب هیئت مدیره به شما یک کار اختصاص داده شده است. </span></a>",
      read: true,
      starred: false,
      date: "آبان 24",
      category: "مهم",
    },
    {
      id: 13,
      name: "نیما سهیلی ",
      description:
        "<a href='#' class='subject'> بریم ماهی گیری ؟ – <span class='teaser'> سلام ما فردا میخواهیم بریم ماهیگیری میای تو هم ؟ </span></a>",
      read: true,
      starred: false,
      date: "آبان 23",
      category: "سطل زباله",
    },
    {
      id: 14,
      name: "ستاره, من (7)",
      description:
        "<a href='#' class='subject'> سلامم– <span class='teaser'> ببخشید من نباید دیروز بسته مو میگرفتم ؟ </span></a>",
      read: true,
      starred: true,
      date: "آبان 23",
      category: "ستاره دار",
    },
    {
      id: 15,
      name: "من, پرهام (5)",
      description:
        "<a href='#' class='subject'> <span class='bg-info badge me-2'> پشتیبانی </span> دوباره خانه! – <span class='teaser'> این عالیه فردا میبینمت </span></a>",
      read: false,
      starred: false,
      date: "آبان 21",
      category: "در انتظار",
    },
    {
      id: 16,
      name: "صرافی نوین",
      description:
        "<a href='#' class='subject'>1 مورد جدید در صندوق ورودی Stackexchange شما – <span class='teaser'> موارد زیر از آخرین باری که آن را بررسی کردید به صندوق ورودی جهانی Stack Exchange شما اضافه شد </span></a>",
      read: true,
      starred: false,
      date: "آبان 21",
      category: "مهم",
    },
    {
      id: 17,
      name: "Google Drive تیم",
      description:
        "<a href='#' class='subject'> اکنون می توانید از فضای ذخیره سازی خود در Google Drive استفاده کنید – <span class='teaser'> سلام سارا! از خرید فضای ذخیره سازی اضافی در Google Drive سپاسگزاریم</span></a>",
      read: true,
      starred: true,
      date: "آبان 20",
      category: "ستاره دار",
    },
    {
      id: 18,
      name: "من, سهیل (11)",
      description:
        "<a href='#' class='subject'> قطار / اتوبوس – <span class='teaser'>قطار راه افتاده داریم میاییم </span></a>",
      read: true,
      starred: false,
      date: "آبان 19",
      category: "ورودی",
    },
  ],
  folders: [
    { id: 0, handle: "inbox", title: "ورودی" },
    { id: 1, handle: "important", title: "مهم" },
    { id: 2, handle: "drafts", title: "پیش نویس" },
    { id: 3, handle: "sent", title: "ارسال شده" },
    { id: 4, handle: "trash", title: "سطل زباله" },
  ],
};

const labelsData = [
  {
    id: 1,
    icon: "mdi mdi-arrow-right-drop-circle text-info float-end",
    text: "پشتیبانی از قالب",
  },
  {
    id: 2,
    icon: "mdi mdi-arrow-right-drop-circle text-warning float-end",
    text: "آزاد",
  },
  {
    id: 3,
    icon: "mdi mdi-arrow-right-drop-circle text-primary float-end",
    text: "اجتماعی",
  },
  {
    id: 4,
    icon: "mdi mdi-arrow-right-drop-circle text-danger float-end",
    text: "دوستان",
  },
  {
    id: 5,
    icon: "mdi mdi-arrow-right-drop-circle text-success float-end",
    text: "خانواده",
  },
];

const mailChatData = [
  { id: 1, imageSrc: avatar2, userTitle: "محمد دارابی", textMessage: "سلام" },
  { id: 1, imageSrc: avatar3, userTitle: "احسان نریمانی", textMessage: "زمان جلسه ی بعد" },
  { id: 1, imageSrc: avatar4, userTitle: "زهرا دهقان", textMessage: "همه چی خوبه" },
  { id: 1, imageSrc: avatar6, userTitle: "امیر ابراهیمی", textMessage: "خیلی عالیه" }
]

export { inboxmails, starredmails, importantmails, draftmails, sentmails, trashmails, mailDB, labelsData , mailChatData};