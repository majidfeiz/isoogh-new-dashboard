import React, { useState } from "react";
import {
  Button,
  Popover,
  PopoverHeader,
  PopoverBody,
  Tooltip,
  Col,
  Row,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Container,
  Spinner,
  Badge,
  UncontrolledPopover,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const UiGeneral = () => {

  //meta title
  document.title = "General | Skote - قالب مدیریتی و داشبورد Vite React ";

  const [popovertop, setpopovertop] = useState(false);
  const [popoverleft, setpopoverleft] = useState(false);
  const [popoverright, setpopoverright] = useState(false);
  const [popoverbottom, setpopoverbottom] = useState(false);
  const [popoverdismiss, setpopoverdismiss] = useState(false);

  const [ttop, setttop] = useState(false);
  const [tbottom, settbottom] = useState(false);
  const [tleft, settleft] = useState(false);
  const [tright, settright] = useState(false);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="المنت های UI" breadcrumbItem="رابط کاربری عمومی" />

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <Row>
                    <Col xl={6}>
                      <div>
                        <CardTitle>نشان ها</CardTitle>
                        <p className="card-title-desc">
                          هر یک از کلاس های اصلاح کننده ذکر شده در زیر را به آن
                          اضافه کنید ظاهر یک نشان را تغییر دهید
                        </p>
                        <div>
                          <Badge color="primary" className="me-1">
                            اولیه
                          </Badge>
                          <Badge color="success" className="me-1">
                            موفقیت
                          </Badge>
                          <Badge color="info" className="me-1">
                            اطلاعات
                          </Badge>
                          <Badge color="warning" className="me-1">
                            هشدار
                          </Badge>
                          <Badge color="danger" className="me-1">
                            خطر
                          </Badge>
                          <Badge color="dark" className="me-1">
                            تاریک
                          </Badge>
                        </div>

                        <div className="mt-5">
                          <h5 className="font-size-14">نشان نرم</h5>
                          <div className="mt-1">
                            <Badge className="badge-soft-primary me-1">
                              اولیه
                            </Badge>
                            <Badge className="badge-soft-success me-1">
                              موفقیت
                            </Badge>
                            <Badge className="badge-soft-info me-1">Info</Badge>
                            <Badge className="badge-soft-warning me-1">
                              هشدار
                            </Badge>
                            <Badge className="badge-soft-danger me-1">
                              خطر
                            </Badge>
                            <Badge className="badge-soft-dark me-1">
                              تاریک
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col lg={6}>
                      <CardTitle>نشان های قرص</CardTitle>
                      <p className="card-title-desc">
                        از <code>.rounded pill</code> تغییر دهنده className
                        استفاده کنید مدالها را گردتر کنید (با بزرگتر{" "}
                        <code>شعاع مرز</code>و <code>padding</code> افقی اضافی).
                        مفید اگر نشان های نسخه 3 را از دست دادید
                      </p>

                      <div>
                        <Badge pill color="primary" className="me-1">
                          اولیه
                        </Badge>
                        <Badge pill color="success" className="me-1">
                          موفقیت
                        </Badge>
                        <Badge pill color="info" className="me-1">
                          اطلاعات
                        </Badge>
                        <Badge pill color="warning" className="me-1">
                          هشدار
                        </Badge>
                        <Badge pill color="danger" className="me-1">
                          خطر
                        </Badge>
                        <Badge pill color="dark" className="me-1">
                          تاریک
                        </Badge>
                      </div>

                      <div className="mt-5">
                        <h5 className="font-size-14">نشان نرم</h5>
                        <div className="mt-1">
                          <Badge pill className="badge-soft-primary ms-1">
                            اولیه
                          </Badge>
                          <Badge pill className="badge-soft-success ms-1">
                            موفقیت
                          </Badge>
                          <Badge pill className="badge-soft-info ms-1">
                            اطلاعات
                          </Badge>
                          <Badge pill className="badge-soft-warning ms-1">
                            هشدار
                          </Badge>
                          <Badge pill className="badge-soft-danger ms-1">
                            خطر
                          </Badge>
                          <Badge pill className="badge-soft-dark ms-1">
                            تاریک
                          </Badge>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <hr className="mt-5" />
                  <Row>
                    <Col xl="6">
                      <div className="mt-4">
                        <h4 className="card-title">نشان ها در دکمه ها</h4>
                        <p className="card-title-desc">
                          نشان ها را می توان به عنوان بخشی از پیوندها یا دکمه ها
                          استفاده کرد یک شمارنده ارائه کنید
                        </p>

                        <div className="d-flex flex-wrap gap-2">
                          <button type="button" className="btn btn-primary">
                            اعلانات <Badge className="bg-success ms-1">4</Badge>
                          </button>
                          <button type="button" className="btn btn-success">
                            پیام <span className="badge bg-danger ms-1">2</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                          >
                            پیش نویس{" "}
                            <span className="badge bg-success ms-1">2</span>
                          </button>
                        </div>
                      </div>
                    </Col>

                    <Col xl="6">
                      <div className="mt-4">
                        <h4 className="card-title">نمونه های موقعیت نشان ها</h4>
                        <p className="card-title-desc">
                          نمونه ای از موقعیت نشان ها
                        </p>

                        <div className="d-flex flex-wrap gap-3">
                          <button
                            type="button"
                            className="btn btn-primary position-relative"
                          >
                            ایمیل ها{" "}
                            <span className="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-success">
                              +99{" "}
                              <span className="visually-hidden">
                                پیام های خوانده نشده
                              </span>
                            </span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-light position-relative"
                          >
                            هشدار ها{" "}
                            <span className="position-absolute top-0 start-0 translate-middle badge border border-light rounded-circle bg-danger p-1">
                              <span className="visually-hidden">
                                پیام های خوانده نشده
                              </span>
                            </span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-primary position-relative p-0 avatar-xs rounded"
                          >
                            <span className="avatar-title bg-transparent">
                              <i className="bx bxs-envelope"></i>
                            </span>
                            <span className="position-absolute top-0 start-0 translate-middle badge border border-light rounded-circle bg-danger p-1">
                              <span className="visually-hidden">
                                پیام های خوانده نشده
                              </span>
                            </span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-light position-relative p-0 avatar-xs rounded-circle"
                          >
                            <span className="avatar-title bg-transparent text-reset">
                              <i className="bx bxs-bell"></i>
                            </span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-light position-relative p-0 avatar-xs rounded-circle"
                          >
                            <span className="avatar-title bg-transparent text-reset">
                              <i className="bx bx-menu"></i>
                            </span>
                            <span className="position-absolute top-0 start-0 translate-middle badge border border-light rounded-circle bg-success p-1">
                              <span className="visually-hidden">
                                پیام های خوانده نشده
                              </span>
                            </span>
                          </button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle>پاپاورها</CardTitle>
                  <p className="card-title-desc">
                    چهار گزینه در دسترس است: بالا، راست، پایین و چپ هم راستا.
                    هنگام استفاده از Bootstrap در دستورالعمل ها منعکس می شوند
                    RTL
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      id="Popovertop"
                      color="secondary"
                      onClick={() => {
                        setpopovertop(!popovertop);
                      }}
                    >
                      پاپوور در بالا
                    </Button>
                    <Popover
                      placement="top"
                      isOpen={popovertop}
                      target="Popovertop"
                      toggle={() => {
                        setpopovertop(!popovertop);
                      }}
                    >
                      <PopoverHeader>عنوان پاپاورها</PopoverHeader>
                      <PopoverBody>
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                        چاپ و با استفاده از طراحان گرافیک است
                      </PopoverBody>
                    </Popover>

                    <Button
                      id="Popoverright"
                      onClick={() => {
                        setpopoverright(!popoverright);
                      }}
                      color="secondary"
                    >
                      پاپاور در سمت راست
                    </Button>
                    <Popover
                      placement="right"
                      isOpen={popoverright}
                      target="Popoverright"
                      toggle={() => {
                        setpopoverright(!popoverright);
                      }}
                    >
                      <PopoverHeader>عنوان پاپاورها</PopoverHeader>
                      <PopoverBody>
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                        چاپ و با استفاده از طراحان گرافیک است
                      </PopoverBody>
                    </Popover>

                    <Button
                      id="Popoverbottom"
                      onClick={() => {
                        setpopoverbottom(!popoverbottom);
                      }}
                      color="secondary"
                    >
                      پاپوور به سمت پایین
                    </Button>
                    <Popover
                      placement="bottom"
                      isOpen={popoverbottom}
                      target="Popoverbottom"
                      toggle={() => {
                        setpopoverbottom(!popoverbottom);
                      }}
                    >
                      <PopoverHeader>عنوان پاپاورها</PopoverHeader>
                      <PopoverBody>
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                        چاپ و با استفاده از طراحان گرافیک است
                      </PopoverBody>
                    </Popover>

                    <Button
                      id="Popoverleft"
                      onClick={() => {
                        setpopoverleft(!popoverleft);
                      }}
                      color="secondary"
                    >
                      پاپاور به سمت چپ
                    </Button>
                    <Popover
                      placement="left"
                      isOpen={popoverleft}
                      target="Popoverleft"
                      toggle={() => {
                        setpopoverleft(!popoverleft);
                      }}
                    >
                      <PopoverHeader>عنوان پاپاورها</PopoverHeader>
                      <PopoverBody>
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                        چاپ و با استفاده از طراحان گرافیک است
                      </PopoverBody>
                    </Popover>

                    <Button
                      id="Popoverdismiss"
                      className="btn btn-success"
                      onClick={() => {
                        setpopoverdismiss(!popoverdismiss);
                      }}
                    >
                      پاپاور انصرافی
                    </Button>
                    <UncontrolledPopover
                      trigger="focus"
                      target="Popoverdismiss"
                      placement="right"
                    >
                      <PopoverHeader>پاپاور انصرافی</PopoverHeader>
                      <PopoverBody>
                        و در اینجا برخی از مطالب شگفت انگیز است. بسیار جذاب است.
                        درست؟
                      </PopoverBody>
                    </UncontrolledPopover>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle>نکات ابزار</CardTitle>
                  <CardSubtitle className="mb-3">
                    برای دیدن نکات ابزار، نشانگر را روی پیوندهای زیر نگه دارید:
                  </CardSubtitle>

                  <div className="d-flex flex-wrap gap-2">
                    <Tooltip
                      placement="top"
                      isOpen={ttop}
                      target="TooltipTop"
                      toggle={() => {
                        setttop(!ttop);
                      }}
                    >
                      سلام دنیا!
                    </Tooltip>
                    <Tooltip
                      placement="right"
                      isOpen={tright}
                      target="TooltipRight"
                      toggle={() => {
                        settright(!tright);
                      }}
                    >
                      سلام دنیا!
                    </Tooltip>
                    <Tooltip
                      placement="bottom"
                      isOpen={tbottom}
                      target="TooltipBottom"
                      toggle={() => {
                        settbottom(!tbottom);
                      }}
                    >
                      سلام دنیا!
                    </Tooltip>
                    <Tooltip
                      placement="left"
                      isOpen={tleft}
                      target="TooltipLeft"
                      toggle={() => {
                        settleft(!tleft);
                      }}
                    >
                      سلام دنیا!
                    </Tooltip>

                    <button
                      type="button"
                      className="btn btn-primary"
                      id="TooltipTop"
                    >
                      {" "}
                      راهنمای ابزار در بالا
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      id="TooltipRight"
                    >
                      {" "}
                      راهنمای ابزار در راست
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      id="TooltipBottom"
                    >
                      {" "}
                      راهنمای ابزار در پایین
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      id="TooltipLeft"
                    >
                      {" "}
                      راهنمای ابزار در چپ
                    </button>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={12}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">صفحه بندی</CardTitle>
                  <Row>
                    <Col lg={6}>
                      <CardTitle>مثال پیش فرض</CardTitle>
                      <CardSubtitle className="mb-3">
                        پیوندهای صفحه بندی یک سری مطالب مرتبط را نشان می دهد در
                        چندین صفحه وجود دارد
                      </CardSubtitle>

                      <Pagination aria-label="Page navigation example">
                        <PaginationItem>
                          <PaginationLink href="#">قبلی</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">بعدی</PaginationLink>
                        </PaginationItem>
                      </Pagination>

                      <Pagination aria-label="Page navigation example">
                        <PaginationItem>
                          <PaginationLink href="#" previous>
                            <i className="mdi mdi-chevron-left" />
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink next>
                            <i className="mdi mdi-chevron-right" />
                          </PaginationLink>
                        </PaginationItem>
                      </Pagination>
                    </Col>

                    <Col lg={6}>
                      <CardTitle>حالت های غیر فعال و فعال</CardTitle>
                      <CardSubtitle className="mb-3">
                        پیوندهای صفحه بندی برای موارد مختلف قابل تنظیم هستند
                        موقعیت. برای پیوندهایی که از <code>.disabled</code>{" "}
                        استفاده کنید غیرقابل کلیک و <code>.active</code> نشان
                        داده می شود صفحه فعلی
                      </CardSubtitle>

                      <Pagination aria-label="Page navigation example">
                        <PaginationItem disabled>
                          <PaginationLink href="#" tabIndex="-1">
                            قبلی
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem active>
                          <PaginationLink href="#">
                            2 <span className="sr-only">(فعلی)</span>
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">بعدی</PaginationLink>
                        </PaginationItem>
                      </Pagination>

                      <Pagination aria-label="Page navigation example">
                        <PaginationItem disabled>
                          <PaginationLink>
                            <i className="mdi mdi-chevron-left" />
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem active>
                          <PaginationLink>
                            2<span className="sr-only">(فعلی)</span>
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">
                            <i className="mdi mdi-chevron-right" />
                          </PaginationLink>
                        </PaginationItem>
                      </Pagination>
                    </Col>
                  </Row>

                  <Row>
                    <Col lg={6}>
                      <CardTitle>Sizing</CardTitle>
                      <CardSubtitle className="mb-3">
                        صفحه بندی بزرگتر یا کوچکتر را دوست دارید؟ اضافه کردن{" "}
                        <code>.pagination-lg</code> یا{" "}
                        <code>.pagination-sm</code> برای اندازه های اضافی
                      </CardSubtitle>

                      <Pagination
                        size="lg"
                        aria-label="Page navigation example"
                      >
                        <PaginationItem disabled>
                          <PaginationLink href="#" tabIndex="-1">
                            قبلی
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">بعدی</PaginationLink>
                        </PaginationItem>
                      </Pagination>

                      <Pagination
                        size="sm"
                        aria-label="Page navigation example"
                      >
                        <PaginationItem disabled>
                          <PaginationLink href="#" tabIndex="-1">
                            قبلی
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">بعدی</PaginationLink>
                        </PaginationItem>
                      </Pagination>
                    </Col>

                    <Col lg={6}>
                      <CardTitle>هم ترازی</CardTitle>
                      <CardSubtitle className="mb-3">
                        تراز اجزای صفحه بندی را با ابزارهای فلکس باکس
                      </CardSubtitle>

                      <Pagination
                        aria-label="Page navigation example"
                        listClassName="justify-content-center"
                      >
                        <PaginationItem disabled>
                          <PaginationLink href="#" tabIndex="-1">
                            قبلی
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">بعدی</PaginationLink>
                        </PaginationItem>
                      </Pagination>

                      <Pagination
                        aria-label="Page navigation example"
                        listClassName="justify-content-end"
                      >
                        <PaginationItem disabled>
                          <PaginationLink href="#" tabIndex="-1">
                            قبلی
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">بعدی</PaginationLink>
                        </PaginationItem>
                      </Pagination>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle>چرخاننده مرزی</CardTitle>
                  <CardSubtitle className="mb-3">
                    از اسپینرهای حاشیه برای نشانگر بارگیری سبک استفاده کنید
                  </CardSubtitle>
                  <div>
                    <Spinner className="ms-2" color="primary" />
                    <Spinner className="ms-2" color="secondary" />
                    <Spinner className="ms-2" color="success" />
                    <Spinner className="ms-2" color="danger" />
                    <Spinner className="ms-2" color="warning" />
                    <Spinner className="ms-2" color="info" />
                    <Spinner className="ms-2" color="light" />
                    <Spinner className="ms-2" color="dark" />
                  </div>
                </CardBody>{" "}
              </Card>
            </Col>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle>اسپینر در حال رشد</CardTitle>
                  <CardSubtitle className="mb-3">
                    اگر به اسپینر حاشیه علاقه ندارید، به رشد بروید چرخنده در
                    حالی که از نظر فنی نمی چرخد، اما می چرخد بارها و بارها رشد
                    می کنند!
                  </CardSubtitle>
                  <div>
                    <Spinner type="grow" className="ms-2" color="primary" />
                    <Spinner type="grow" className="ms-2" color="secondary" />
                    <Spinner type="grow" className="ms-2" color="success" />
                    <Spinner type="grow" className="ms-2" color="danger" />
                    <Spinner type="grow" className="ms-2" color="warning" />
                    <Spinner type="grow" className="ms-2" color="info" />
                    <Spinner type="grow" className="ms-2" color="light" />
                    <Spinner type="grow" className="ms-2" color="dark" />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">دکمه بستن</h4>
                  <p className="card-title-desc">
                    گزینه ای برای رد کردن یا بستن یک جزء با ارائه دهید
                    <code>.btn بستن</code>. سبک پیش فرض محدود است، اما بسیار
                    قابل تنظیم متغیرهای Sass را تغییر دهید تا جایگزین شوند
                    پیش‌فرض <code>تصویر پس‌زمینه</code>.{" "}
                    <strong>حتماً متنی را برای صفحه‌خوان‌ها اضافه کنید</strong>،
                    همانطور که با <code>برچسب aria</code> انجام دادیم
                  </p>

                  <div>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                    ></button>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">غیرفعال کردن دکمه بستن</h4>
                  <p className="card-title-desc">
                    دکمه‌های غیرفعال بستن <code>معروفی</code> خود را تغییر
                    می‌دهند. ما همچنین{" "}
                    <code>رویدادهای اشاره گر را اعمال کرده ایم: هیچ</code> و{" "}
                    <code>انتخاب کاربر: هیچ</code> برای جلوگیری از شناور و حالت
                    های فعال از تحریک
                  </p>

                  <div>
                    <button
                      type="button"
                      className="btn-close"
                      disabled
                      aria-label="Close"
                    ></button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">دکمه بستن نوع سفید</h4>
                  <p className="card-title-desc">
                    <code>.btn-close</code> پیش فرض را به رنگ سفید تغییر دهید
                    کلاس <code>.btn-close-white</code>. این کلاس از استفاده می
                    کند ویژگی <code>filter</code> برای معکوس کردن{" "}
                    <code>تصویر پس زمینه</code>
                  </p>

                  <div className="card-body bg-dark">
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      aria-label="Close"
                    ></button>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      disabled
                      aria-label="Close"
                    ></button>
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

export default UiGeneral;
