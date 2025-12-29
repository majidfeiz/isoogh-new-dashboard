import React from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Container,
} from "reactstrap";

// Carousel
import Slide from "./CarouselTypes/slide";
import Slidewithcontrol from "./CarouselTypes/slidewithcontrol";
import Slidewithindicator from "./CarouselTypes/slidewithindicator";
import Slidewithcaption from "./CarouselTypes/slidewithcaption";
import Slidewithfade from "./CarouselTypes/slidewithfade";
import IndividualInterval from "./CarouselTypes/individualInterval";
import SlideDark from "./CarouselTypes/slideDark";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const UiCarousel = () => {

  //meta title
  document.title = "Carousel | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="المنت های UI" breadcrumbItem="اسلایدر" />

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle> فقط اسلایدها</CardTitle>
                  <CardSubtitle className="mb-3">
                    اینجا یک اسلایدر فقط با اسلاید است. به حضور{" "}
                    <code>.d-block</code> and <code>.img-fluid</code> on تصاویر
                    اسلایدر برای جلوگیری از ترازبندی تصویر پیش فرض مرورگر
                  </CardSubtitle>
                  <Slide />
                </CardBody>
              </Card>
            </Col>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle>با کنترل</CardTitle>
                  <CardSubtitle className="mb-3">
                    اضافه کردن در کنترل های قبلی و بعدی:
                  </CardSubtitle>
                  <Slidewithcontrol />
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle>با اندیکاتورها</CardTitle>
                  <CardSubtitle className="mb-3">
                    شما همچنین می توانید نشانگرها را به اسلایدر اضافه کنید کنترل
                    ها را نیز همچنین
                  </CardSubtitle>
                  <Slidewithindicator />
                </CardBody>
              </Card>
            </Col>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle>با زیرنویس</CardTitle>
                  <CardSubtitle className="mb-3">
                    با به اسلایدهای خود به راحتی زیرنویس اضافه کنید عنصر{" "}
                    <code>.carousel-caption</code> در هر{" "}
                    <code>.carousel-item</code>
                  </CardSubtitle>
                  <Slidewithcaption />
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg="6">
              <Card>
                <CardBody>
                  <CardTitle>محو شدن</CardTitle>
                  <CardSubtitle className="mb-3">
                    برای متحرک سازی، <code>.carousel-fade</code> را به چرخ فلک
                    خود اضافه کنید اسلایدهایی با انتقال محو به جای اسلاید
                  </CardSubtitle>
                  <Slidewithfade />
                </CardBody>
              </Card>
            </Col>

            <Col xl="6">
              <Card>
                <CardBody>
                  <CardTitle>
                    فاصله <code>.carousel-item</code> فردی
                  </CardTitle>
                  <p className="card-title-desc">
                    اضافه کردن <code>data-bs-interval=""</code> به یک{" "}
                    <code>.carousel-item</code>
                    برای تغییر میزان زمان تأخیر بین خودکار دوچرخه سواری به مورد
                    بعدی
                  </p>
                  <IndividualInterval />
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle>نوع تیره</CardTitle>
                  <p className="card-title-desc">
                    <code>.carousel-dark</code> را به آن اضافه کنید{" "}
                    <code>.carousel </code>
                    برای کنترل‌ها، نشانگرها و زیرنویس‌های تیره‌تر. کنترل ها
                    دارند از پر کردن سفید پیش‌فرض خود با the معکوس شده‌اند ویژگی{" "}
                    <code> فیلتر </code> CSS. زیرنویس‌ها و کنترل‌ها متغیرهای
                    Sass اضافی دارند که آن را سفارشی می کنند
                    <code> رنگ </code> و <code>background-color</code>
                  </p>
                  <SlideDark />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default UiCarousel;
