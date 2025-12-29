import React, { useState } from "react";
import {
  Alert,
  Col,
  Row,
  Card,
  CardBody,
  CardTitle,
  UncontrolledAlert,
  Container,
} from "reactstrap";
import { Link } from "react-router-dom";

//Import Breadcrumb
import Breadcrumbs from "../../../components/Common/Breadcrumb";

const UiAlert = () => {
  //meta title
  document.title = "Alert | Skote - قالب مدیریتی و داشبورد Vite React ";

  const [show, setShow] = useState(false);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="المنت های UI" breadcrumbItem="هشدارها" />

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle>هشدارهای پیش فرض </CardTitle>
                  <p className="card-title-desc">
                    هشدارها برای هر طول متن و همچنین یک متن در دسترس هستند دکمه
                    رد اختیاری برای یک ظاهر طراحی مناسب، از یکی از آنها استفاده
                    کنید چهار کلاس زمینه ای <strong>الزامی</strong> (به عنوان
                    مثال، <code>.alert-success</code>). برای اخراج درون خطی، از
                    پلاگین جی کوئری را هشدار می دهد
                  </p>

                  <div>
                    <Alert color="primary">
                      یک هشدار اولیه ساده - آن را بررسی کنید!
                    </Alert>
                    <Alert color="secondary" role="alert">
                      یک هشدار ثانویه ساده - آن را بررسی کنید!
                    </Alert>
                    <Alert color="success" role="alert">
                      یک هشدار موفقیت ساده - آن را بررسی کنید!
                    </Alert>
                    <Alert color="danger" role="alert">
                      یک هشدار خطر ساده - آن را بررسی کنید!
                    </Alert>
                    <Alert color="warning" role="alert">
                      یک هشدار ساده - آن را بررسی کنید!
                    </Alert>
                    <Alert color="info" className="mb-0" role="alert">
                      یک هشدار اطلاعات ساده - آن را بررسی کنید!
                    </Alert>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-2">رنگ پیوند </CardTitle>
                  <p className="card-title-desc">
                    از استفاده کنید
                    <code className="highlighter-rouge">.alert-link</code> ابزار
                    نام کلاس به سرعت پیوندهای رنگی منطبق را ارائه می دهد در هر
                    هشدار
                  </p>

                  <div>
                    <Alert color="primary">
                      یک هشدار اولیه ساده با{" "}
                      <Link to="#" className="alert-link">
                        یک لینک نمونه
                      </Link>
                      . اگر دوست داشتید روی آن کلیک کنید
                    </Alert>
                    <Alert color="secondary">
                      یک هشدار ثانویه ساده با{" "}
                      <Link to="#" className="alert-link">
                        یک لینک نمونه
                      </Link>
                      . اگر دوست داشتید روی آن کلیک کنید
                    </Alert>
                    <Alert color="success">
                      یک هشدار موفقیت ساده با{" "}
                      <Link to="#" className="alert-link">
                        یک لینک نمونه
                      </Link>
                      . اگر دوست داشتید روی آن کلیک کنید
                    </Alert>
                    <Alert color="danger">
                      یک هشدار خطر ساده با{" "}
                      <Link to="#" className="alert-link">
                        یک لینک نمونه
                      </Link>
                      . اگر دوست داشتید روی آن کلیک کنید
                    </Alert>
                    <Alert color="warning">
                      یک هشدار هشدار ساده با{" "}
                      <Link to="#" className="alert-link">
                        یک لینک نمونه
                      </Link>
                      . اگر دوست داشتید روی آن کلیک کنید
                    </Alert>
                    <Alert color="info" className="mb-0">
                      یک هشدار اطلاعات ساده با{" "}
                      <Link to="#" className="alert-link">
                        یک لینک نمونه
                      </Link>
                      . اگر دوست داشتید روی آن کلیک کنید
                    </Alert>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-2">رد کردن </CardTitle>
                  <p className="card-title-desc">
                    یک دکمه رد کردن و <code>.alert-dismissible</code> را اضافه
                    کنید کلاس، که بالشتک اضافی را در سمت راست هشدار اضافه می کند
                    و دکمه <code>.btn-close</code> را قرار می دهد
                  </p>

                  <div>
                    <UncontrolledAlert color="primary">
                      یک هشدار اولیه ساده - آن را بررسی کنید!
                    </UncontrolledAlert>
                    <UncontrolledAlert color="secondary" role="alert">
                      یک هشدار ثانویه ساده - آن را بررسی کنید!
                    </UncontrolledAlert>
                    <UncontrolledAlert color="success" role="alert">
                      یک هشدار موفقیت ساده - آن را بررسی کنید!
                    </UncontrolledAlert>
                    <UncontrolledAlert color="danger" role="alert">
                      یک هشدار خطر ساده - آن را بررسی کنید!
                    </UncontrolledAlert>
                    <UncontrolledAlert color="warning" role="alert">
                      یک هشدار ساده - آن را بررسی کنید!
                    </UncontrolledAlert>
                    <UncontrolledAlert
                      color="info"
                      className="mb-0"
                      role="alert"
                    >
                      یک هشدار اطلاعات ساده - آن را بررسی کنید!
                    </UncontrolledAlert>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">با آیکون</CardTitle>
                  <div>
                    <UncontrolledAlert
                      color="primary"
                      className="alert-dismissible fade show"
                      role="alert"
                    >
                      <i className="mdi mdi-bullseye-arrow me-2"></i>یک هشدار
                      ساده اولیه - آن را بررسی کنید
                    </UncontrolledAlert>
                    <UncontrolledAlert
                      color="secondary"
                      className="alert-dismissible fade show"
                      role="alert"
                    >
                      <i className="mdi mdi-grease-pencil me-2"></i>یک هشدار
                      ثانویه ساده - آن را بررسی کنید!
                    </UncontrolledAlert>
                    <UncontrolledAlert
                      color="success"
                      className="alert-dismissible fade show"
                      role="alert"
                    >
                      <i className="mdi mdi-check-all me-2"></i>یک هشدار موفقیت
                      ساده - آن را بررسی کنید!
                    </UncontrolledAlert>
                    <UncontrolledAlert
                      color="danger"
                      className="alert-dismissible fade show"
                      role="alert"
                    >
                      <i className="mdi mdi-block-helper me-2"></i>یک هشدار خطر
                      ساده - آن را بررسی کنید!
                    </UncontrolledAlert>
                    <UncontrolledAlert
                      color="warning"
                      className="alert-dismissible fade show"
                      role="alert"
                    >
                      <i className="mdi mdi-alert-outline me-2"></i>یک هشدار
                      هشدار ساده - آن را بررسی کنید!
                    </UncontrolledAlert>
                    <UncontrolledAlert
                      color="info"
                      className="alert-dismissible fade show mb-0"
                      role="alert"
                    >
                      <i className="mdi mdi-alert-circle-outline me-2"></i>یک
                      هشدار اطلاعات ساده - آن را بررسی کنید!
                    </UncontrolledAlert>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <h4 className="card-title">مثال زنده</h4>
                  <p className="card-title-desc">
                    روی دکمه زیر کلیک کنید تا یک هشدار نمایش داده شود (پنهان شده
                    با درون خط سبک ها را شروع کنید)، سپس آن را با رد کنید (و
                    نابود کنید). دکمه بسته تعبیه شده
                  </p>
                  <div className="">
                    <div id="liveAlertPlaceholder">
                      <Alert
                        isOpen={show}
                        toggle={() => {
                          setShow(false);
                        }}
                      >
                        خوب، شما این پیام هشدار را راه اندازی کردید!
                      </Alert>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setShow(true)}
                      id="liveAlertBtn"
                    >
                      نمایش هشدار زنده
                    </button>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="card-title">مطالب اضافی</CardTitle>
                  <p className="card-title-desc">
                    هشدارها همچنین می توانند حاوی عناصر HTML اضافی مانند سرفصل
                    ها، پاراگراف ها و تقسیم کننده ها
                  </p>

                  <div>
                    <Alert className="alert-success" role="alert">
                      <h4 className="alert-heading">آفرین!</h4>
                      <p>
                        اوه، بله، شما با موفقیت این هشدار مهم را خواندید پیام
                        این متن نمونه کمی طولانی تر اجرا می شود به طوری که می
                        توانید ببینید فاصله گذاری در یک هشدار چگونه کار می کند
                        با این نوع مطالب
                      </p>
                      <hr className="border-success-subtle" />
                      <p className="mb-0">
                        هر زمان که نیاز داشتید، حتما از ابزارهای حاشیه استفاده
                        کنید چیزها را خوب و مرتب نگه دارید
                      </p>
                    </Alert>
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

export default UiAlert;
