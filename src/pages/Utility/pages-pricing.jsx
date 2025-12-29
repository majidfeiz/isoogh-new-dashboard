import React from "react"
import { Container, Row, Col } from "reactstrap";


//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

//Import Pricing Cards
import CardPricing from "./card-pricing"

const PagesPricing = () => {

  //meta title
  document.title = "Pricing | Skote - قالب مدیریتی و داشبورد Vite React ";

  const pricings = [
    {
      id: 1,
      title: "شروع کننده",
      description: "این فیلد شروع کننده است",
      icon: "bx-walk",
      price: "19",
      duration: "هر ماه",
      link: "",
      features: [
        { title: "پشتیبانی زنده رایگان" },
        { title: "کاربر نامحدود" },
        { title: "بدون ردیابی زمان" },
        { title: "راه اندازی رایگان" },
      ],
    },
    {
      id: 2,
      title: "حرفه ای",
      description: "این فیلد حرفه ای است",
      icon: "bx-run",
      price: "29",
      duration: "هر ماه",
      link: "",
      features: [
        { title: "پشتیبانی زنده رایگان" },
        { title: "کاربر نامحدود" },
        { title: "بدون ردیابی زمان" },
        { title: "راه اندازی رایگان" },
      ],
    },
    {
      id: 3,
      title: "شرکت، پروژه",
      description: "این فیلد شرکت است",
      icon: "bx-cycling",
      price: "39",
      duration: "هر ماه",
      link: "",
      features: [
        { title: "پشتیبانی زنده رایگان" },
        { title: "کاربر نامحدود" },
        { title: "بدون ردیابی زمان" },
        { title: "راه اندازی رایگان" },
      ],
    },
    {
      id: 4,
      title: "نامحدود",
      description: "این فیلد نامحدود است",
      icon: "bx-car",
      price: "49",
      duration: "هر ماه",
      link: "",
      features: [
        { title: "پشتیبانی زنده رایگان" },
        { title: "کاربر نامحدود" },
        { title: "بدون ردیابی زمان" },
        { title: "راه اندازی رایگان" },
      ],
    },
  ];
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="ابزارهای مفید" breadcrumbItem="قیمت گذاری" />

          <Row className="justify-content-center">
            <Col lg={6}>
              <div className="text-center mb-5">
                <h4>طرح قیمت گذاری خود را انتخاب کنید</h4>
                <p className="text-muted">
                  برای رسیدن به این هدف، داشتن یکدست ضروری است دستور زبان، تلفظ
                  و کلمات رایج تر اگر چندین زبان ها به هم می پیوندند
                </p>
              </div>
            </Col>
          </Row>

          <Row>
            {pricings.map((pricing, key) => (
              <CardPricing pricing={pricing} key={"_pricing_" + key} />
            ))}
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}
export default PagesPricing
