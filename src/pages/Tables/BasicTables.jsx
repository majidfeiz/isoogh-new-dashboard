import React from "react";

import {
  Table,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
} from "reactstrap"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

const BasicTable = () => {

  //meta title
  document.title = "Basic Tables | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="جدول ها" breadcrumbItem="جداول پایه" />

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">مثال پایه</CardTitle>
                  <p className="card-title-desc">
                    برای یک ظاهر طراحی اولیه - روکش سبک و فقط افقی
                    تقسیم‌کننده‌ها - کلاسName پایه <code>.table</code> را به هر
                    کدام اضافه کنید
                    <code>&lt;جدول&gt;</code>
                  </p>

                  <div className="table-responsive">
                    <Table className="table mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>نام</th>
                          <th>نام خانوادگی</th>
                          <th>نام کاربری</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>ستاره</td>
                          <td>سهیلی</td>
                          <td>@star</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>علی</td>
                          <td>خداپرست</td>
                          <td>@ali</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>الین</td>
                          <td>نوری</td>
                          <td>@elin</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">جدول تاریک</CardTitle>
                  <p className="card-title-desc">
                    همچنین می‌توانید رنگ‌ها را معکوس کنید - با متن روشن روی
                    تاریک پس زمینه-با <code>.table-dark</code>
                  </p>

                  <div className="table-responsive">
                    <Table className="table table-dark mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>نام</th>
                          <th>نام خانوادگی</th>
                          <th>نام کاربری</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>ستاره</td>
                          <td>سهیلی</td>
                          <td>@star</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>علی</td>
                          <td>خداپرست</td>
                          <td>@ali</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>الین</td>
                          <td>نوری</td>
                          <td>@elin</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">تیتر جدول</CardTitle>
                  <CardSubtitle className="card-title-desc">
                    از یکی از دو تغییر دهنده className برای ساختن استفاده کنید
                    <code>&lt;thead&gt;</code>ها خاکستری روشن یا تیره به نظر می
                    رسند
                  </CardSubtitle>

                  <div className="table-responsive">
                    <Table className="table mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>نام</th>
                          <th>نام خانوادگی</th>
                          <th>نام کاربری</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>ستاره</td>
                          <td>سهیلی</td>
                          <td>@star</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>علی</td>
                          <td>خداپرست</td>
                          <td>@ali</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>الین</td>
                          <td>نوری</td>
                          <td>@elin</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>نگین</td>
                          <td>ابراهیمی</td>
                          <td>@nnebi</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">ردیف های راه راه</CardTitle>
                  <CardSubtitle className="card-title-desc">
                    از <code>.table striped</code> برای افزودن نوار زبرا به هر
                    کدام استفاده کنید ردیف جدول در <code>&lt;tbody&gt;</code>
                  </CardSubtitle>

                  <div className="table-responsive">
                    <Table className="table table-striped mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>نام</th>
                          <th>نام خانوادگی</th>
                          <th>نام کاربری</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>ستاره</td>
                          <td>سهیلی</td>
                          <td>@star</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>علی</td>
                          <td>خداپرست</td>
                          <td>@ali</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>الین</td>
                          <td>نوری</td>
                          <td>@elin</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">ستون های راه راه</CardTitle>
                  <p className="card-title-desc">
                    از <code>.table-striped-columns</code> استفاده کنید برای
                    اضافه کردن خط گورخر به هر ستون جدول
                  </p>
                  <div className="table-responsive">
                    <Table className="table table-striped-columns mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>نام</th>
                          <th>نام خانوادگی</th>
                          <th>نام کاربری</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>ستاره</td>
                          <td>سهیلی</td>
                          <td>@star</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>علی</td>
                          <td>خداپرست</td>
                          <td>@ali</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>الین</td>
                          <td>نوری</td>
                          <td>@elin</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">جدول حاشیه دار</CardTitle>
                  <CardSubtitle className="card-title-desc">
                    برای حاشیه‌ها در هر طرف، <code>.table bordered</code> را
                    اضافه کنید جدول و سلول ها
                  </CardSubtitle>

                  <div className="table-responsive">
                    <Table className="table table-bordered mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>نام</th>
                          <th>نام خانوادگی</th>
                          <th>نام کاربری</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>ستاره</td>
                          <td>سهیلی</td>
                          <td>@star</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>علی</td>
                          <td>خداپرست</td>
                          <td>@ali</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>الین</td>
                          <td>نوری</td>
                          <td>@elin</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">جدول بدون حاشیه</CardTitle>
                  <CardSubtitle className="card-title-desc">
                    {" "}
                    برای جدول بدون حاشیه <code>.table-borderless</code> اضافه
                    کنید مرز ها
                  </CardSubtitle>

                  <div className="table-responsive">
                    <Table className="table table-borderless mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>نام</th>
                          <th>نام خانوادگی</th>
                          <th>نام کاربری</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>ستاره</td>
                          <td>سهیلی</td>
                          <td>@star</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>علی</td>
                          <td>خداپرست</td>
                          <td>@ali</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>الین</td>
                          <td>نوری</td>
                          <td>@elin</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">رنگ حاشیه جدول</h4>
                  <p className="card-title-desc">
                    <code>.table bordered</code> و <code>.border *</code> را
                    اضافه کنید برای حاشیه های رنگی در همه طرف جدول و سلول ها
                  </p>
                  <div className="table-responsive">
                    <Table className="table table-bordered border-primary mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>نام</th>
                          <th>نام خانوادگی</th>
                          <th>نام کاربری</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>ستاره</td>
                          <td>سهیلی</td>
                          <td>@star</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>علی</td>
                          <td>خداپرست</td>
                          <td>@ali</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>الین</td>
                          <td>نوری</td>
                          <td>@elin</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">رنگ حاشیه جدول</h4>
                  <p className="card-title-desc">
                    اضافه کردن <code>.table border</code> و{" "}
                    <code>.border *</code> برای حاشیه های رنگی در همه طرف جدول و
                    سلول ها
                  </p>

                  <div className="table-responsive">
                    <Table className="table table-bordered border-success mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>نام</th>
                          <th>نام خانوادگی</th>
                          <th>نام کاربری</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>ستاره</td>
                          <td>سهیلی</td>
                          <td>@star</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>علی</td>
                          <td>خداپرست</td>
                          <td>@ali</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>الین</td>
                          <td>نوری</td>
                          <td>@elin</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <div className="table-responsive">
                    <h4 className="card-title">چیدمان عمودی</h4>
                    <p className="card-title-desc">
                      سلول های جدول در <code>&lt;tbody&gt;</code> خود را به ارث
                      می برند تراز از <code>&lt;table&gt;</code> و تراز می شوند
                      به صورت پیش فرض به بالا از کلاس های تراز عمودی استفاده
                      کنید برای تراز مجدد در جایی که نیاز است
                    </p>

                    <div className="table-responsive">
                      <Table className="align-middle mb-0">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>نام</th>
                            <th>نام خانوادگی</th>
                            <th>اقدامات</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row">1</th>
                            <td>ستاره</td>
                            <td>سهیلی</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-light btn-sm"
                              >
                                مشاهده
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">2</th>
                            <td>علی</td>
                            <td>خداپرست</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-light btn-sm"
                              >
                                مشاهده
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">3</th>
                            <td>الین</td>
                            <td>نوری</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-light btn-sm"
                              >
                                مشاهده
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">4</th>
                            <td>علی</td>
                            <td>اسماعیلی</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-light btn-sm"
                              >
                                مشاهده
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">تو در تو</h4>
                  <p className="card-title-desc">
                    {" "}
                    سبک های حاشیه، سبک های فعال و انواع جدول اینطور نیستند توسط
                    جداول تودرتو به ارث رسیده است
                  </p>

                  <div className="table-responsive">
                    <Table className="table-striped table-bordered mb-0">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">نام</th>
                          <th scope="col">نام خانوادگی</th>
                          <th scope="col">رسیدگی</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>ستاره</td>
                          <td>سهیلی</td>
                          <td>@star</td>
                        </tr>
                        <tr>
                          <td colSpan="4">
                            <table className="table mb-0">
                              <thead>
                                <tr>
                                  <th scope="col">سر تیتر</th>
                                  <th scope="col">سر تیتر</th>
                                  <th scope="col">سر تیتر</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <th scope="row">A</th>
                                  <td>نام</td>
                                  <td>نام خانوادگی</td>
                                </tr>
                                <tr>
                                  <th scope="row">B</th>
                                  <td>نام</td>
                                  <td>نام خانوادگی</td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>علی</td>
                          <td>خداپرست</td>
                          <td>@ali</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">قابل شناور شدن </CardTitle>
                  <CardSubtitle className="card-title-desc">
                    برای فعال کردن حالت شناور، <code>.table hover</code> را
                    اضافه کنید ردیف‌های جدول در یک <code>&lt;tbody&gt;</code>
                  </CardSubtitle>

                  <div className="table-responsive">
                    <Table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>نام</th>
                          <th>نام خانوادگی</th>
                          <th>نام کاربری</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>ستاره</td>
                          <td>سهیلی</td>
                          <td>@star</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>علی</td>
                          <td>خداپرست</td>
                          <td>@ali</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>الین</td>
                          <td>نوری</td>
                          <td>@elin</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">جدول کوچک </CardTitle>
                  <CardSubtitle className="card-title-desc">
                    {" "}
                    برای فشرده‌تر کردن جدول‌ها، <code>.table-sm</code> را اضافه
                    کنید برش لایه سلولی به نصف
                  </CardSubtitle>

                  <div className="table-responsive">
                    <Table className="table table-sm m-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>نام</th>
                          <th>نام خانوادگی</th>
                          <th>نام کاربری</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>ستاره</td>
                          <td>سهیلی</td>
                          <td>@star</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>علی</td>
                          <td>خداپرست</td>
                          <td>@ali</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>الین</td>
                          <td>نوری</td>
                          <td>@elin</td>
                        </tr>
                        <tr>
                          <th scope="row">5</th>
                          <td>Jacob</td>
                          <td>Thornton</td>
                          <td>@fat</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">نام کلاس متنی</CardTitle>
                  <CardSubtitle className="card-title-desc">
                    از className متنی برای رنگ آمیزی ردیف های جدول یا فردی
                    استفاده کنید سلول ها
                  </CardSubtitle>

                  <div className="table-responsive">
                    <Table className="table mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>عنوان ستون</th>
                          <th>عنوان ستون</th>
                          <th>عنوان ستون</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="table-light">
                          <th scope="row">1</th>
                          <td>محتوای ستون</td>
                          <td>محتوای ستون</td>
                          <td>محتوای ستون</td>
                        </tr>

                        <tr className="table-success">
                          <th scope="row">2</th>
                          <td>محتوای ستون</td>
                          <td>محتوای ستون</td>
                          <td>محتوای ستون</td>
                        </tr>

                        <tr className="table-info">
                          <th scope="row">3</th>
                          <td>محتوای ستون</td>
                          <td>محتوای ستون</td>
                          <td>محتوای ستون</td>
                        </tr>

                        <tr className="table-warning">
                          <th scope="row">4</th>
                          <td>محتوای ستون</td>
                          <td>محتوای ستون</td>
                          <td>محتوای ستون</td>
                        </tr>

                        <tr className="table-danger">
                          <th scope="row">5</th>
                          <td>محتوای ستون</td>
                          <td>محتوای ستون</td>
                          <td>محتوای ستون</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">زیرنویس ها </CardTitle>
                  <CardSubtitle className="card-title-desc">
                    یک <code>&lt;caption&gt;</code> مانند یک عنوان برای عمل می
                    کند یک میز. این به کاربران دارای صفحه خوان کمک می کند تا
                    جدولی را پیدا کنند و بفهمند در مورد چیست و تصمیم بگیرند که
                    آیا آنها می خواهند بخوانش
                  </CardSubtitle>

                  <div className="table-responsive">
                    <Table className="table mb-0">
                      <caption>لیست کاربران</caption>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>نام</th>
                          <th>نام خانوادگی</th>
                          <th>نام کاربری</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>ستاره</td>
                          <td>سهیلی</td>
                          <td>@star</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>علی</td>
                          <td>خداپرست</td>
                          <td>@ali</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>الین</td>
                          <td>نوری</td>
                          <td>@elin</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">جدول پاسخگو </CardTitle>
                  <CardSubtitle className="card-title-desc">
                    با قرار دادن هر <code>.table</code> جداول پاسخگو ایجاد کنید
                    در <code>.table پاسخگو</code>
                    تا آنها را به صورت افقی روی دستگاه های کوچک حرکت دهید (زیر
                    768 پیکسل)
                  </CardSubtitle>

                  <div className="table-responsive">
                    <Table className="table mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>عنوان جدول</th>
                          <th>عنوان جدول</th>
                          <th>عنوان جدول</th>
                          <th>عنوان جدول</th>
                          <th>عنوان جدول</th>
                          <th>عنوان جدول</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                          <td>سلول جدول</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
}

export default BasicTable
