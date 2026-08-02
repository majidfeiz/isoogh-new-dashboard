# فرانت یکپارچه‌سازی بله

## مسیرها

- Mini App: `/bale-mini-app`
- مدیریت مجموعه‌ها: `/settings/integrations/bale/schools`
- اتصال کاربران: `/settings/integrations/bale/connections`
- سلامت سرویس: `/settings/integrations/bale/health`
- مدیریت Outbox: `/settings/integrations/bale/outbox`
- تنظیمات سراسری امن: `/settings/integrations/bale/configuration`
- لاگ تخصصی: `/logs/bale`
- اتصال حساب شخصی: `/profile/bale`

## انتشار Mini App

آدرس عمومی HTTPS برنامه باید با پسوند `/bale-mini-app` در تنظیمات امن backend بله ثبت شود. فرانت فقط `VITE_API_BASE_URL` را به‌عنوان تنظیم عمومی API مصرف می‌کند؛ token بازو، webhook secret و کلید سفیر نباید به env فرانت یا bundle وارد شوند.

اسکریپت رسمی `https://tapi.bale.ai/miniapp.js?3` پیش از entry برنامه بارگذاری می‌شود. Mini App در `main.jsx` خارج از `BrowserRouter` و session پنل mount می‌شود و router حافظه‌ای و token موقت مستقل دارد.

در nginx فقط مسیر `/bale-mini-app` اجازه embed شدن از `https://bale.ai` و زیردامنه‌های HTTPS بله را دارد. سایر مسیرهای پنل همچنان با `X-Frame-Options: SAMEORIGIN` در برابر iframe محافظت می‌شوند. بعد از تغییر این policy باید image فرانت دوباره build و deploy شود؛ تغییر React به‌تنهایی header نسخه production را عوض نمی‌کند.

## قرارداد امنیتی

- فقط `window.Bale.WebApp.initData` خام برای exchange ارسال می‌شود.
- `initDataUnsafe` برای احراز هویت استفاده نمی‌شود.
- نقش، مدرسه، capability و navigation از bootstrap backend دریافت می‌شوند.
- `Bale User ID` در UI و query به‌صورت string باقی می‌ماند.
- عملیات تماس و submit کلید idempotency مستقل دارند.
- خطای 401 فقط session بله را پاک می‌کند و حداکثر یک exchange کنترل‌شده آغاز می‌کند.

## تنظیمات سرور

مقادیر `BALE_OTP_PROVIDER`، `BALE_OUTBOX_WORKER_ENABLED`، token بازو، webhook secret، Safir key و URL عمومی Mini App فقط در backend تنظیم می‌شوند. صفحه مدیریت مجموعه‌ها صرفاً feature flagها و eventهای مجاز هر مجموعه را PATCH می‌کند.

تنظیم گروهی مجموعه‌ها حداکثر ۵۰۰ شناسه را به `/bale/admin/schools/settings/bulk` می‌فرستد. مدیریت Webhook از صفحه سلامت انجام می‌شود و عملیات ثبت آن body خالی دارد؛ URL امن از تنظیم backend خوانده می‌شود. اتاق تماس مشاور نیز تمام داده اولیه را با یک درخواست `call-room` دریافت می‌کند.

تنظیمات سراسری از `/bale/admin/settings` خوانده می‌شود. پاسخ امن GET فقط وضعیت configured را دارد؛ ورودی‌های `botToken`، `webhookSecret` و `safirApiAccessKey` همیشه خالی hydrate می‌شوند و فقط هنگام واردکردن مقدار جدید در PATCH حضور دارند. ساعت سکوت مجموعه‌ها با `HH:mm` و timezone از نوع IANA، بدون تبدیل زمانی مرورگر ارسال می‌شوند.
