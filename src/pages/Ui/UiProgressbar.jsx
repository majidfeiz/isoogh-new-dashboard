import React from "react"
import { Card, CardBody, Col, Container, Progress, Row } from "reactstrap"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

const UiProgressbar = () => {

  //meta title
  document.title = "Progress Bars | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="المنت های UI" breadcrumbItem="نوارهای پیشرفت" />

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">نمونه های پیش فرض</h4>
                  <p className="card-title-desc">
                    اجزای پیشرفت با دو عنصر HTML ساخته شده اند، برخی CSS برای
                    تنظیم عرض و چند ویژگی
                  </p>
                  <div>
                    <div className="mb-4">
                      <Progress color="primary" value={25}></Progress>
                    </div>{" "}
                    <div className="mb-4">
                      <Progress color="primary" value={50}></Progress>
                    </div>
                    <div className="mb-4">
                      <Progress color="primary" value={75}></Progress>
                    </div>
                    <div>
                      <Progress color="primary" value={100}></Progress>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">پس زمینه ها</h4>
                  <p className="card-title-desc">
                    از کلاس های پس زمینه ابزار برای تغییر ظاهر استفاده کنید
                    نوارهای پیشرفت فردی
                  </p>

                  <div>
                    <div className="mb-4">
                      <Progress color="success" value={25}></Progress>
                    </div>

                    <div className="mb-4">
                      <Progress color="info" value={50}></Progress>
                    </div>

                    <div className="mb-4">
                      <Progress color="warning" value={75}></Progress>
                    </div>

                    <div>
                      <Progress color="danger" value={100}></Progress>
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
                  <h4 className="card-title">نمونه برچسب ها</h4>
                  <p className="card-title-desc">
                    با قرار دادن متن در نوار پیشرفت، برچسب‌ها را به نوارهای
                    پیشرفت خود اضافه کنید{" "}
                    <code className="highlighter-rouge">.progress-bar</code>.
                  </p>

                  <div>
                    <Progress color="primary" value={25}>
                      25%
                    </Progress>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">نمودار های متعدد</h4>
                  <p className="card-title-desc">
                    اگر چندین نوار پیشرفت را در یک جزء پیشرفت قرار دهید تو نیاز
                    داری
                  </p>

                  <div>
                    <Progress multi>
                      <Progress bar color="primary" value={15}></Progress>
                      <Progress bar color="success" value={30}></Progress>
                      <Progress bar color="info" value={20}></Progress>
                    </Progress>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">ارتفاع</h4>
                  <p className="card-title-desc">
                    ما فقط یک تنظیم کردیم مقدار{" "}
                    <code className="highlighter rouge">ارتفاع</code> روشن است
                    <code className="highlighter rouge">نوار پیشرفت</code>،
                    بنابراین اگر آن مقدار خارجی را تغییر دهید{" "}
                    <code className="highlighter rouge">.progress</code> خواهد
                    بود به طور خودکار بر این اساس اندازه را تغییر دهید
                  </p>

                  <div>
                    <div className="mb-4">
                      <h5 className="font-size-13">پیش رفتن sm</h5>
                      <Progress
                        value={25}
                        color="primary"
                        className="progress-sm"
                      ></Progress>
                    </div>
                    <div className="mb-4">
                      <h5 className="font-size-13">پیش رفتن md</h5>
                      <Progress
                        value={40}
                        color="success"
                        className="progress-md"
                      ></Progress>
                    </div>
                    <div className="mb-4">
                      <h5 className="font-size-13">پیش رفتن lg</h5>
                      <Progress
                        value={50}
                        color="warning"
                        className="progress-lg"
                      ></Progress>
                    </div>
                    <div>
                      <h5 className="font-size-13">پیش رفتن xl</h5>
                      <Progress
                        value={70}
                        color="danger"
                        className="progress-xl"
                      ></Progress>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">راه راه</h4>
                  <p className="card-title-desc">
                    اضافه کردن{" "}
                    <code className="highlighter-rouge"> راه راه </code> به هر
                    یک برای اعمال یک نوار از طریق گرادیان CSS بر روی پیشرفت رنگ
                    پس زمینه نوار
                  </p>

                  <div>
                    <div className="mb-4">
                      <Progress striped color="primary" value={25}></Progress>
                    </div>

                    <div>
                      <Progress striped color="success" value={40}></Progress>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <h4 className="card-title">راه راه های متحرک</h4>
                  <p className="card-title-desc">
                    گرادیان راه راه نیز می تواند متحرک شود. اضافه کردن{" "}
                    <code>.progress-bar-animated</code> به{" "}
                    <code>.progress-bar</code> برای متحرک سازی نوارها به سمت
                    راست سمت چپ از طریق انیمیشن های CSS3
                  </p>

                  <div>
                    <Progress
                      value={75}
                      color="primary"
                      style={{ width: "75%" }}
                      animated
                    ></Progress>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">پیشرفت متحرک</h4>
                  <p className="card-title-desc">
                    اضافه کردن کلاس <code>.animated-progess</code> با{" "}
                    <code>.progress-bar</code> برای نوار پیشرفت متحرک
                  </p>

                  <div>
                    <div className="animated-progess mb-4">
                      <Progress value={10} color="primary"></Progress>
                    </div>
                    <div className="animated-progess mb-4">
                      <Progress value={25} color="success"></Progress>
                    </div>
                    <div className="animated-progess mb-4">
                      <Progress value={50} color="info"></Progress>
                    </div>
                    <div className="animated-progess mb-4">
                      <Progress value={75} color="warning"></Progress>
                    </div>
                    <div className="animated-progess">
                      <Progress value={100} color="danger"></Progress>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">پیشرفت سفارشی</h4>
                  <p className="card-title-desc mb-4">
                    نمونه ای از پیشرفت سفارشی
                  </p>

                  <div>
                    <div className="custom-progess mb-5">
                      <Progress
                        className="progress-sm"
                        color="danger"
                        value={84}
                        max={100}
                      ></Progress>
                      <div className="avatar-xs progress-icon">
                        <span className="avatar-title rounded-circle border border-danger">
                          <i className="bx bxl-html5 text-danger font-size-18"></i>
                        </span>
                      </div>
                    </div>

                    <div className="custom-progess mb-5">
                      <Progress
                        className="progress-sm"
                        color="primary"
                        value={75}
                        max={100}
                      ></Progress>
                      <div className="avatar-xs progress-icon">
                        <span className="avatar-title rounded-circle border border-primary">
                          <i className="bx bxl-css3 text-primary font-size-18"></i>
                        </span>
                      </div>
                    </div>

                    <div className="custom-progess mb-5">
                      <Progress
                        className="progress-sm"
                        color="info"
                        value={62}
                        max={100}
                      ></Progress>
                      <div className="avatar-xs progress-icon">
                        <span className="avatar-title rounded-circle border border-info">
                          <i className="bx bxl-jquery text-info font-size-18"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xl="6">
              <Card>
                <CardBody>
                  <h4 className="card-title">نمونه پیشرفت</h4>

                  <p className="card-title-desc">
                    می توانید از این کلاس ها با اجزای موجود برای ایجاد استفاده
                    کنید جدید
                  </p>
                  <div className="mt-5">
                    <div className="position-relative m-4">
                      <Progress
                        value={50}
                        color="primary"
                        style={{ height: "1px" }}
                      ></Progress>
                      <button
                        className="position-absolute top-0 start-0 translate-middle btn btn-sm btn-primary rounded-pill"
                        style={{ width: "2rem", height: "2rem" }}
                      >
                        1
                      </button>
                      <button
                        className="position-absolute top-0 start-50 translate-middle btn btn-sm btn-primary rounded-pill"
                        style={{ width: "2rem", height: "2rem" }}
                      >
                        2
                      </button>
                      <button
                        className="position-absolute top-0 start-100 translate-middle btn btn-sm btn-secondary rounded-pill"
                        style={{ width: "2rem", height: "2rem" }}
                      >
                        3
                      </button>
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
}

export default UiProgressbar
