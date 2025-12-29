import React from "react";
import {
  Card,
  Row,
  Col,
  CardBody,
  CardTitle,
  Container
} from "reactstrap";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const UiTypography = () => {

  //meta title
  document.title = "Typography | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="المنت های UI" breadcrumbItem="تایپوگرافی" />
          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="ms-3 me-4">
                      <h1 className="display-4 mb-0">A</h1>
                    </div>
                    <div className="flex-grow-1 align-self-center">
                      <p className="text-muted mb-2">Font Family</p>
                      <h5 className="mb-0">&quot;Yekan&quot;, sans-serif</h5>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <CardTitle className="h4">سر تیتر</CardTitle>
                  <p className="card-title-desc">
                    همه سرفصل‌های HTML، <code>&lt;h1&gt;</code> تا{" "}
                    <code>&lt;h6&gt;</code>، در دسترس هستند
                  </p>

                  <h1 className="mb-3">
                    h1. عنوان بوت استرپ{" "}
                    <small className="text-muted">2.03125rem (32.5px)</small>
                  </h1>
                  <h2 className="mb-3">
                    h2. عنوان بوت استرپ{" "}
                    <small className="text-muted">1.625rem (26px)</small>
                  </h2>
                  <h3 className="mb-3">
                    h3. عنوان بوت استرپ{" "}
                    <small className="text-muted">1.42188rem (22.75px)</small>
                  </h3>
                  <h4 className="mb-3">
                    h4. عنوان بوت استرپ{" "}
                    <small className="text-muted">1.21875rem (19.5px)</small>
                  </h4>
                  <h5 className="mb-3">
                    h5. عنوان بوت استرپ{" "}
                    <small className="text-muted">1.01563rem (16.25)</small>
                  </h5>
                  <h6>
                    h6. عنوان بوت استرپ{" "}
                    <small className="text-muted">0.8125rem (13px)</small>
                  </h6>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Row>
                    <Col sm="6">
                      <div className="d-flex align-items-center">
                        <div className="me-4">
                          <h1 className="fw-medium display-4 mb-0">Aa</h1>
                        </div>
                        <div className="flex-grow-1">
                          <p className="text-muted mb-2">Font Weight</p>
                          <h4 className="mb-0">500</h4>
                        </div>
                      </div>
                    </Col>
                    <Col sm="6">
                      <div className="d-flex align-items-center mt-4 mt-sm-0">
                        <div className="flex-shrink-0 me-4">
                          <h1 className="fw-semibold display-4 mb-0">Aa</h1>
                        </div>
                        <div className="flex-grow-1">
                          <p className="text-muted mb-2">Font Weight</p>
                          <h4 className="mb-0">600</h4>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col xl="6">
              <Card>
                <CardBody>
                  <CardTitle className="h4">نمایش سرفصل ها</CardTitle>
                  <p className="card-title-desc">
                    عناصر عنوان سنتی به گونه ای طراحی شده اند که بهترین عملکرد
                    را داشته باشند گوشت محتوای صفحه شما.{" "}
                  </p>

                  <h1 className="display-1">نمایش دادن 1</h1>
                  <h1 className="display-2">نمایش دادن 2</h1>
                  <h1 className="display-3">نمایش دادن 3</h1>
                  <h1 className="display-4">نمایش دادن 4</h1>
                  <h1 className="display-5">نمایش دادن 5</h1>
                  <h1 className="display-6 mb-0">نمایش دادن 6</h1>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xl="6">
              <Card>
                <CardBody>
                  <CardTitle className="h4">عناصر متن درون خطی</CardTitle>
                  <p className="card-title-desc">
                    یک ظاهر طراحی برای عناصر رایج HTML5 درون خطی
                  </p>

                  <p className="lead">
                    لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و
                    با استفاده از طراحان گرافیک است.
                  </p>
                  <p>
                    می توانید از تگ علامت گذاری برای <mark> برجسته کردن</mark>{" "}
                    متن استفاده کنید
                  </p>
                  <p>
                    <del>
                      این خط متن به عنوان متن حذف شده در نظر گرفته می شود
                    </del>
                  </p>
                  <p>
                    <s>این خط از متن قرار است به عنوان دیگر تلقی شود دقیق</s>
                  </p>
                  <p>
                    <ins>
                      این خط از متن قرار است به عنوان افزودنی در نظر گرفته شود
                      سند
                    </ins>
                  </p>
                  <p>
                    <u>این خط متن به صورت زیرخط دار ارائه می شود</u>
                  </p>
                  <p>
                    <small>
                      این خط از متن به عنوان چاپ ظریف در نظر گرفته شده است
                    </small>
                  </p>
                  <p>
                    <strong>این خط به صورت متن پررنگ ارائه می شود</strong>
                  </p>
                  <p className="mb-0">
                    <em>این خط به صورت متن ایتالیک ارائه شده است</em>
                  </p>
                </CardBody>
              </Card>
            </Col>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">لیست بدون استایل</CardTitle>
                  <p className="card-title-desc">
                    پیش فرض را حذف کنید{" "}
                    <code className="highlighter-rouge">list-style</code> و
                    حاشیه سمت چپ در موارد لیست (فقط کودکان فوری).{" "}
                    <strong>
                      این فقط در مورد موارد فوری فهرست کودکان اعمال می شود
                    </strong>
                    ، به این معنی که باید className را برای هر تو در تو اضافه
                    کنید لیست ها نیز
                  </p>

                  <ul className="list-unstyled mb-0">
                    <li>لورم ایپسوم متن ساختگی با تولید سادگی</li>
                    <li>
                      لورم ایپسوم متن ساختگی با تولید سادگی
                      <ul>
                        <li>لورم ایپسوم متن ساختگی با تولید سادگی</li>
                        <li>لورم ایپسوم متن ساختگی با تولید سادگی</li>
                        <li>لورم ایپسوم متن ساختگی با تولید سادگی</li>
                      </ul>
                    </li>
                    <li>لورم ایپسوم متن ساختگی با تولید سادگی</li>
                  </ul>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <CardTitle className="h4">فهرست درون خطی</CardTitle>
                  <p className="card-title-desc">
                    گلوله های یک لیست را بردارید و مقداری نور اعمال کنید{" "}
                    <code className="highlighter-rouge">حاشیه</code> با یک
                    ترکیبی از دو کلاس،{" "}
                    <code className="highlighter-rouge">.list-inline</code> و
                    <code className="highlighter-rouge">.list-inline-item</code>
                    .
                  </p>

                  <ul className="list-inline mb-0">
                    <li className="list-inline-item">
                      لورم ایپسوم متن ساختگی با تولید سادگی
                    </li>
                    <li className="list-inline-item">
                      لورم ایپسوم متن ساختگی با تولید سادگی
                    </li>
                    <li className="list-inline-item">
                      لورم ایپسوم متن ساختگی با تولید سادگی
                    </li>
                  </ul>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">نقل قول های بلوکی</CardTitle>
                  <p className="card-title-desc">
                    برای نقل قول بلوک های محتوا از منبع دیگری در داخل سند شما
                    بسته بندی کردن{" "}
                    <code className="highlighter-rouge">
                      &lt;blockquote className=&quot;blockquote&quot;&gt;
                    </code>{" "}
                    اطراف هر <abbr title="HyperText Markup Language">HTML</abbr>{" "}
                    به عنوان نقل قول
                  </p>
                  <Row>
                    <Col xs="6">
                      <div>
                        <blockquote className="blockquote font-size-16 mb-0">
                          <p>
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است.
                          </p>
                          <footer className="blockquote-footer">
                            شخصی معروف در{" "}
                            <cite title="Source Title">عنوان منبع</cite>
                          </footer>
                        </blockquote>
                      </div>
                    </Col>
                    <Col xs="6">
                      <blockquote className="blockquote  blockquote-reverse font-size-16 mb-0">
                        <p>
                          لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                          چاپ و با استفاده از طراحان گرافیک است.
                        </p>
                        <footer className="blockquote-footer">
                          فردی مشهور در{" "}
                          <cite title="Source Title">عنوان منبع</cite>
                        </footer>
                      </blockquote>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col className="col-12">
              <Card>
                <CardBody>
                  <CardTitle className="h4">تراز فهرست توضیحات</CardTitle>
                  <p className="card-title-desc">
                    با استفاده از شبکه ما، اصطلاحات و توضیحات را به صورت افقی
                    تراز کنید کلاس‌ها (یا میکس‌های معنایی) از پیش تعریف‌شده
                    سیستم. برای برای مدت طولانی تر، می توانید به صورت اختیاری یک{" "}
                    اضافه کنید
                    <code className="highlighter rouge"> برش متن</code>{" "}
                    className برای کوتاه کردن متن با بیضی
                  </p>

                  <dl className="row mb-0">
                    <dt className="col-sm-3">لیست های توضیحات</dt>
                    <dd className="col-sm-9">
                      لیست توضیحات برای تعریف اصطلاحات عالی است
                    </dd>

                    <dt className="col-sm-3">لورم</dt>
                    <dd className="col-sm-9">
                      لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ
                      و با استفاده از طراحان گرافیک است.
                    </dd>
                    <dd className="col-sm-9 offset-sm-3">
                      لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ
                      و با استفاده از طراحان گرافیک است.
                    </dd>

                    <dt className="col-sm-3">لورم ایپسوم</dt>
                    <dd className="col-sm-9">
                      لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ
                      و با استفاده از طراحان گرافیک است.
                    </dd>

                    <dt className="col-sm-3 text-truncate">
                      اصطلاح کوتاه شده کوتاه شده است
                    </dt>
                    <dd className="col-sm-9">
                      لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ
                      و با استفاده از طراحان گرافیک است.
                    </dd>

                    <dt className="col-sm-3">تو در تو</dt>
                    <dd className="col-sm-9 mb-0">
                      <dl className="row mb-0">
                        <dt className="col-sm-4">لیست تعریف تو در تو</dt>
                        <dd className="col-sm-8">
                          لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                          چاپ و با استفاده از طراحان گرافیک است.
                        </dd>
                      </dl>
                    </dd>
                  </dl>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">تبدیل متن</CardTitle>
                  <p className="card-title-desc">
                    از <code>.text-کوچک</code>، استفاده کنید
                    <code>.text-uppercase</code> یا{" "}
                    <code>.text-capitalize</code> برای تبدیل متن
                  </p>
                  <div>
                    <p className="text-lowercase">متن با حروف کوچک.</p>
                    <p className="text-uppercase">متن بزرگ</p>
                    <p className="text-capitalize mb-0">متن با حروف بزرگ.</p>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">تزیین متن</CardTitle>
                  <p className="card-title-desc">
                    تزیین متن در اجزا با کلاس های تزیین متن
                  </p>
                  <div>
                    <p className="text-decoration-underline">
                      این متن یک خط زیر آن دارد
                    </p>
                    <p className="text-decoration-line-through">
                      این متن دارای یک خط است که از آن عبور می کند
                    </p>
                    <a href="#" className="text-decoration-none">
                      تزیین متن این لینک حذف شده است
                    </a>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">اندازه فونت</CardTitle>
                  <p className="card-title-desc">
                    به سرعت اندازه فونت متن را تغییر دهید
                  </p>
                  <div>
                    <p className="fs-1">.fs-1 متن</p>
                    <p className="fs-2">.fs-2 متن</p>
                    <p className="fs-3">.fs-3 متن</p>
                    <p className="fs-4">.fs-4 متن</p>
                    <p className="fs-5">.fs-5 متن</p>
                    <p className="fs-6 mb-0">.fs-6 متن</p>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">بسته بندی و سرریز متن</CardTitle>
                  <p className="card-title-desc">
                    متن را با یک کلاس <code>.text-wrap</code> بپیچید
                  </p>

                  <div className="mb-3">
                    <div
                      className="badge bg-primary text-wrap"
                      style={{ width: "6rem" }}
                    >
                      این متن باید بسته بندی شود
                    </div>
                  </div>

                  <p className="card-title-desc">
                    جلوگیری از بسته بندی متن با <code>.text-nowrap</code> کلاس
                  </p>

                  <div>
                    <div
                      className="text-nowrap bg-light border"
                      style={{ width: "8rem" }}
                    >
                      این متن باید سرریز از والد باشد
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <CardTitle className="h4">شکستن کلمه</CardTitle>
                  <p className="card-title-desc">
                    از کلاس <code>text-break</code> برای جلوگیری از رشته های
                    طولانی استفاده کنید متن از شکستن طرح اجزای شما
                  </p>

                  <div>
                    <p className="text-break mb-0">
                      mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">وزن قلم و حروف کج</CardTitle>
                  <p className="card-title-desc">
                    ابزارهای <code>font-style</code> به اختصار ابزارهای{" "}
                    <code>.fst-*</code> و <code>font-weight</code>
                    به اختصار <code>.fw-*</code> نامیده می شوند
                  </p>

                  <div>
                    <p className="fw-bold">متن پررنگ.</p>
                    <p className="fw-bolder">
                      متن وزن پررنگ تر (نسبت به عنصر والد)
                    </p>
                    <p className="fw-semibold">متن وزن نیمه درشت.</p>
                    <p className="fw-normal">متن با وزن معمولی.</p>
                    <p className="fw-light">متن سبک وزن</p>
                    <p className="fw-lighter">متن سبک تر (نسبت به عنصر والد)</p>
                    <p className="fst-italic">متن کج.</p>
                    <p className="fst-normal mb-0">متن با سبک فونت معمولی</p>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">ارتفاع خط</h4>
                  <p className="card-title-desc">
                    متن را با یک کلاس <code>.text-wrap</code> بپیچید
                  </p>

                  <div>
                    <p className="lh-1">
                      این یک پاراگراف طولانی است که برای نشان دادن چگونگی ارتفاع
                      خط یک عنصر تحت تأثیر ابزارهای ما قرار می گیرد. کلاس ها بر
                      روی خود عنصر یا گاهی اوقات اعمال می شوند عنصر والد این
                      کلاس ها را می توان در صورت نیاز سفارشی کرد با API ابزار ما
                    </p>
                    <p className="lh-sm">
                      این یک پاراگراف طولانی است که برای نشان دادن چگونگی ارتفاع
                      خط یک عنصر تحت تأثیر ابزارهای ما قرار می گیرد. کلاس ها بر
                      روی خود عنصر یا گاهی اوقات اعمال می شوند عنصر والد این
                      کلاس ها را می توان در صورت نیاز سفارشی کرد با API ابزار ما
                    </p>
                    <p className="lh-base">
                      این یک پاراگراف طولانی است که برای نشان دادن چگونگی ارتفاع
                      خط یک عنصر تحت تأثیر ابزارهای ما قرار می گیرد. کلاس ها بر
                      روی خود عنصر یا گاهی اوقات اعمال می شوند عنصر والد این
                      کلاس ها را می توان در صورت نیاز سفارشی کرد با API ابزار ما
                    </p>
                    <p className="lh-lg mb-0">
                      این یک پاراگراف طولانی است که برای نشان دادن چگونگی ارتفاع
                      خط یک عنصر تحت تأثیر ابزارهای ما قرار می گیرد. کلاس ها بر
                      روی خود عنصر یا گاهی اوقات اعمال می شوند عنصر والد این
                      کلاس ها را می توان در صورت نیاز سفارشی کرد با API ابزار ما
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};
export default UiTypography;
