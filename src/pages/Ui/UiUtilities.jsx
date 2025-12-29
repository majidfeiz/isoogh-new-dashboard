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

import avtar2 from "../../assets/images/users/avatar-2.jpg";
import avtar5 from "../../assets/images/users/avatar-5.jpg";


//import Images
import avatar1 from "../../assets/images/users/avatar-1.jpg";
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../assets/images/users/avatar-5.jpg";
import img3 from "../../assets/images/small/img-3.jpg";
import image1 from "../../assets/images/small/img-1.jpg";

const UiUtilites = () => {
  document.title = "Utilities | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="المنت های UI" breadcrumbItem="عمومی" />

          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <h4 className="card-title">حاشیه ها</h4>
                  <p className="card-title-desc">
                    از ابزارهای حاشیه برای افزودن یا حذف حاشیه های یک عنصر
                    استفاده کنید. از بین تمام مرزها یا یکی در یک زمان انتخاب
                    کنید
                  </p>

                  <div>
                    <h6 className="mb-3">عرض حاشیه ها</h6>

                    <div className="hstack gap-3">
                      <div className="avatar-md">
                        <div className="avatar-title bg-transparent border text-center">
                          <code>.border</code>
                        </div>
                      </div>
                      <div className="avatar-md">
                        <div className="avatar-title bg-transparent border border-1 text-center">
                          <code>.border-1</code>
                        </div>
                      </div>
                      <div className="avatar-md">
                        <div className="avatar-title bg-transparent border border-2 text-center">
                          <code>.border-2</code>
                        </div>
                      </div>
                      <div className="avatar-md">
                        <div className="avatar-title bg-transparent border border-3 text-center">
                          <code>.border-3</code>
                        </div>
                      </div>
                      <div className="avatar-md">
                        <div className="avatar-title bg-transparent border border-4 text-center">
                          <code>.border-4</code>
                        </div>
                      </div>
                      <div className="avatar-md">
                        <div className="avatar-title bg-transparent border border-5 text-center">
                          <code>.border-5</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Row className="mt-4">
                    <Col xl={6}>
                      <div>
                        <h6 className="mb-3">افزودنی</h6>

                        <div className="hstack gap-3">
                          <div className="avatar-md">
                            <div className="avatar-title bg-light border-primary border text-center">
                              <code>.border</code>
                            </div>
                          </div>
                          <div className="avatar-md">
                            <div className="avatar-title bg-light border-primary border-top text-center">
                              <code>.border-top</code>
                            </div>
                          </div>
                          <div className="avatar-md">
                            <div className="avatar-title bg-light border-primary border-end text-center">
                              <code>.border-end</code>
                            </div>
                          </div>
                          <div className="avatar-md">
                            <div className="avatar-title bg-light border-primary border-bottom text-center">
                              <code>.border-bottom</code>
                            </div>
                          </div>
                          <div className="avatar-md">
                            <div className="avatar-title bg-light border-primary border-start text-center">
                              <code>.border-start</code>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col xl={6}>
                      <div>
                        <h6 className="mb-3">کاهشی</h6>

                        <div className="hstack gap-3">
                          <div className="avatar-md">
                            <div className="avatar-title bg-light border-primary border-0 text-center">
                              <code>.border-0</code>
                            </div>
                          </div>
                          <div className="avatar-md">
                            <div className="avatar-title bg-light border-primary border border-top-0 text-center">
                              <code>.border-top-0</code>
                            </div>
                          </div>
                          <div className="avatar-md">
                            <div className="avatar-title bg-light border-primary border border-end-0 text-center">
                              <code>.border-end-0</code>
                            </div>
                          </div>
                          <div className="avatar-md">
                            <div className="avatar-title bg-light border-primary border border-bottom-0 text-center">
                              <code>.border-bottom-0</code>
                            </div>
                          </div>
                          <div className="avatar-md">
                            <div className="avatar-title bg-light border-primary border border-start-0 text-center">
                              <code>.border-start-0</code>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <div className="mt-4">
                    <h6 className="mb-3">رنگ حاشیه ها</h6>

                    <div className="hstack gap-3">
                      <div className="avatar-md">
                        <div className="avatar-title bg-transparent border border-primary text-center">
                          <code>.border-primary</code>
                        </div>
                      </div>
                      <div className="avatar-md">
                        <div className="avatar-title bg-transparent border border-secondary text-center">
                          <code>.border-secondary</code>
                        </div>
                      </div>
                      <div className="avatar-md">
                        <div className="avatar-title bg-transparent border border-success text-center">
                          <code>.border-success</code>
                        </div>
                      </div>
                      <div className="avatar-md">
                        <div className="avatar-title bg-transparent border border-danger text-center">
                          <code>.border-danger</code>
                        </div>
                      </div>
                      <div className="avatar-md">
                        <div className="avatar-title bg-transparent border border-info text-center">
                          <code>.border-info</code>
                        </div>
                      </div>
                      <div className="avatar-md">
                        <div className="avatar-title bg-transparent border border-warning text-center">
                          <code>.border-warning</code>
                        </div>
                      </div>
                      <div className="avatar-md">
                        <div className="avatar-title bg-transparent border border-dark text-center">
                          <code>.border-dark</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h6 className="mb-3">حاشیه ها Opacity</h6>

                    <div className="hstack gap-4">
                      <div className="text-center">
                        <div className="avatar-md mx-auto mb-1">
                          <div className="avatar-title bg-transparent border border-primary text-center"></div>
                        </div>
                        <code>پیش فرض</code>
                      </div>
                      <div className="text-center">
                        <div className="avatar-md mx-auto mb-1">
                          <div className="avatar-title bg-transparent border border-primary border-opacity-75 text-center"></div>
                        </div>
                        <code>.border-opacity-75</code>
                      </div>
                      <div className="text-center">
                        <div className="avatar-md mx-auto mb-1">
                          <div className="avatar-title bg-transparent border border-primary border-opacity-50 text-center"></div>
                        </div>
                        <code>.border-opacity-50</code>
                      </div>
                      <div className="text-center">
                        <div className="avatar-md mx-auto mb-1">
                          <div className="avatar-title bg-transparent border border-primary border-opacity-25 text-center"></div>
                        </div>
                        <code>.border-opacity-25</code>
                      </div>
                      <div className="text-center">
                        <div className="avatar-md mx-auto mb-1">
                          <div className="avatar-title bg-transparent border border-primary border-opacity-10 text-center"></div>
                        </div>
                        <code>.border-opacity-10</code>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h6 className="mb-3">Border Radius</h6>

                    <div className="hstack gap-4">
                      <div className="text-center">
                        <img
                          src={avtar5}
                          alt=""
                          className="avatar-md rounded d-block mx-auto"
                        />
                        <code>.rounded</code>
                      </div>
                      <div className="text-center">
                        <img
                          src={avtar5}
                          alt=""
                          className="avatar-md rounded-top d-block mx-auto"
                        />
                        <code>.rounded-top</code>
                      </div>
                      <div className="text-center">
                        <img
                          src={avtar5}
                          alt=""
                          className="avatar-md rounded-end d-block mx-auto"
                        />
                        <code>.rounded-end</code>
                      </div>
                      <div className="text-center">
                        <img
                          src={avtar5}
                          alt=""
                          className="avatar-md rounded-bottom d-block mx-auto"
                        />
                        <code>.rounded-bottom</code>
                      </div>
                      <div className="text-center">
                        <img
                          src={avtar5}
                          alt=""
                          className="avatar-md rounded-start d-block mx-auto"
                        />
                        <code>.rounded-start</code>
                      </div>
                      <div className="text-center">
                        <img
                          src={avtar5}
                          alt=""
                          className="avatar-md rounded-circle d-block mx-auto"
                        />
                        <code>.rounded-circle</code>
                      </div>
                      <div className="text-center">
                        <img
                          src={img3}
                          alt=""
                          height="72"
                          className="rounded-pill d-block mx-auto"
                        />
                        <code>.rounded-pill</code>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h6 className="mb-3">اندازه حاشیه دور </h6>
                      <div className="hstack gap-4">
                        <div className="text-center">
                          <img
                            src={avtar2}
                            alt=""
                            className="avatar-md rounded-0 d-block mx-auto"
                          />
                          <code>.rounded-0</code>
                        </div>
                        <div className="text-center">
                          <img
                            src={avtar2}
                            alt=""
                            className="avatar-md rounded-1 d-block mx-auto"
                          />
                          <code>.rounded-1</code>
                        </div>
                        <div className="text-center">
                          <img
                            src={avtar2}
                            alt=""
                            className="avatar-md rounded-2 d-block mx-auto"
                          />
                          <code>.rounded-2</code>
                        </div>
                        <div className="text-center">
                          <img
                            src={avtar2}
                            alt=""
                            className="avatar-md rounded-3 d-block mx-auto"
                          />
                          <code>.rounded-3</code>
                        </div>
                        <div className="text-center">
                          <img
                            src={avtar2}
                            alt=""
                            className="avatar-md rounded-4 d-block mx-auto"
                          />
                          <code>.rounded-4</code>
                        </div>
                        <div className="text-center">
                          <img
                            src={avtar2}
                            alt=""
                            className="avatar-md rounded-5 d-block mx-auto"
                          />
                          <code>.rounded-5</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">استک ها - عمودی</h4>
                  <p className="card-title-desc">
                    برای ایجاد طرح بندی عمودی از <code>.vstack</code> استفاده
                    کنید. انباشته موارد به طور پیش فرض تمام عرض هستند. از{" "}
                    <code>.gap-*</code> استفاده کنید ابزارهای کاربردی برای اضافه
                    کردن فاصله بین آیتم ها
                  </p>

                  <div className="vstack gap-3 mb-4">
                    <div className="bg-light border">آیتم اول</div>
                    <div className="bg-light border">آیتم دوم</div>
                    <div className="bg-light border">آیتم سوم</div>
                  </div>

                  <h6 className="mb-3">مثال پشته های عمودی</h6>
                  <div className="vstack gap-2 col-md-5 mx-auto">
                    <button type="button" className="btn btn-primary">
                      ذخیره تغییرات
                    </button>
                    <button type="button" className="btn btn-outline-danger">
                      لغو
                    </button>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">استک ها - افقی</h4>
                  <p className="card-title-desc">
                    برای ایجاد طرح بندی عمودی از <code>.vstack</code> استفاده
                    کنید. انباشته موارد به طور پیش فرض تمام عرض هستند. از{" "}
                    <code>.gap-*</code> استفاده کنید ابزارهای کاربردی برای اضافه
                    کردن فاصله بین آیتم ها
                  </p>

                  <div className="hstack gap-3 mb-4">
                    <div className="bg-light border">آیتم اول</div>
                    <div className="bg-light border">آیتم دوم</div>
                    <div className="bg-light border">آیتم سوم</div>
                  </div>

                  <p className="card-title-desc">
                    استفاده از ابزارهای حاشیه افقی مانند ms-auto به عنوان فاصله:
                  </p>
                  <div className="hstack gap-3 mb-4">
                    <div className="bg-light border">آیتم اول</div>
                    <div className="bg-light border ms-auto">آیتم دوم</div>
                    <div className="vr"></div>
                    <div className="bg-light border">آیتم سوم</div>
                  </div>

                  <h6 className="mb-3">نمونه های استک های افقی</h6>
                  <div className="hstack gap-3">
                    <input
                      className="form-control me-auto"
                      type="text"
                      placeholder="آیتم خود را اینجا اضافه کنید..."
                      aria-label="Add your item here..."
                    />
                    <button type="button" className="btn btn-secondary">
                      ارسال
                    </button>
                    <div className="vr"></div>
                    <button type="button" className="btn btn-outline-danger">
                      بازنشانی
                    </button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <CardTitle>تناسب شی</CardTitle>
                  <p className="card-title-desc">
                    کلاس <code>object-fit</code> را به اضافه کنید
                    <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Replaced_element">
                      عنصر جایگزین شده
                    </a>
                  </p>
                  <Row className="text-center gy-3">
                    <Col>
                      <img
                        src={image1}
                        className="object-fit-contain border rounded avatar-xl d-block mx-auto mb-2"
                        alt="..."
                      />
                      <code>.object-fit-contain</code>
                    </Col>
                    <Col>
                      <img
                        src={image1}
                        className="object-fit-cover border rounded avatar-xl d-block mx-auto mb-2"
                        alt="..."
                      />
                      <code>.object-fit-cover</code>
                    </Col>
                    <Col>
                      <img
                        src={image1}
                        className="object-fit-fill border rounded avatar-xl d-block mx-auto mb-2"
                        alt="..."
                      />
                      <code>.object-fit-fill</code>
                    </Col>
                    <Col>
                      <img
                        src={image1}
                        className="object-fit-scale border rounded avatar-xl d-block mx-auto mb-2"
                        alt="..."
                      />
                      <code>.object-fit-scale</code>
                    </Col>
                    <Col>
                      <img
                        src={image1}
                        className="object-fit-none border rounded avatar-xl d-block mx-auto mb-2"
                        alt="..."
                      />
                      <code>.object-fit-none</code>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <CardTitle>Z-index</CardTitle>
                  <p className="card-title-desc">
                    از ابزارهای <code>z index</code> برای چیدن عناصر در بالا
                    استفاده کنید از یکدیگر به یک مقدار دیگر{" "}
                    <code>position</code> نیاز دارد نسبت به <code>static</code>،
                    که می تواند با سفارشی تنظیم شود سبک‌ها یا استفاده از ما{" "}
                    <a href="https:etbootstrap.com/docs/5.3/utilities/position/">
                      تاسیسات موقعیت
                    </a>
                    .
                  </p>

                  <div className="position-relative z-1">
                    <img
                      src={avatar1}
                      alt=""
                      className="avatar-xxl rounded position-relative z-n1"
                    />
                    <img
                      src={avatar2}
                      alt=""
                      className="avatar-xxl rounded position-relative z-0 ms-n5 mt-5"
                    />
                    <img
                      src={avatar3}
                      alt=""
                      className="avatar-xxl rounded position-relative z-1 ms-n5"
                    />
                    <img
                      src={avatar4}
                      alt=""
                      className="avatar-xxl rounded position-relative z-2 ms-n5 mt-5"
                    />
                    <img
                      src={avatar5}
                      alt=""
                      className="avatar-xxl rounded position-relative z-3 ms-n5"
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <h4 className="card-title">سایه ها</h4>
                  <p className="card-title-desc">
                    در حالی که سایه های روی کامپوننت ها به طور پیش فرض غیرفعال
                    هستند بوت استرپ و می تواند از طریق فعال شود
                    <code>$enable-shadows</code>، همچنین می‌توانید به سرعت یا را
                    اضافه کنید یک سایه را با ابزار <code>box-shadow</code> ما
                    حذف کنید کلاس ها. شامل پشتیبانی از <code>.shadow-none</code>{" "}
                    و سه اندازه پیش‌فرض (که متغیرهای مرتبط با همخوانی داشتن)
                  </p>

                  <div className="vstack gap-5">
                    <div className="shadow-none p-3 bg-light rounded">
                     بدون سایه <code>.shadow-none</code>
                    </div>
                    <div className="shadow-sm p-3 bg-body rounded">
                     سایه کم <code>shadow-sm</code>
                    </div>
                    <div className="shadow p-3 bg-white rounded">
                      سایه معمولی <code>shadow</code>
                    </div>
                    <div className="shadow-lg p-3 bg-body rounded">
                      سایه زیاد <code>shadow-lg</code>
                    </div>
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
export default UiUtilites;
