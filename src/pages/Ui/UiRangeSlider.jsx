import React, { useState } from "react";
import { Row, Col, Card, CardBody, CardTitle, Container } from "reactstrap"
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

import Slider from "react-rangeslider"
import "react-rangeslider/lib/index.css"

const UiRangeSlider = () => {

  //meta title
  document.title = "Range Slider | Skote - قالب مدیریتی و داشبورد Vite React ";

  const formatkg = value => "$ " + value
  const formatdollar = value => value + " kg"
  const extra_age = value => value + " Age"

  const [def, setdef] = useState(15)
  const [min_max, setmin_max] = useState(70)
  const [step, setstep] = useState(25)
  const [prefix, setprefix] = useState(50)
  const [postfix, setpostfix] = useState(85)
  const [custom_val, setcustom_val] = useState(5)
  const [float_val, setfloat_val] = useState(55.5)
  const [extra, setextra] = useState(52)
  const [hide, sethide] = useState(5)

  const labels = {
    1: "فروردین",
    2: "اردیبهشت",
    3: "خرداد",
    4: "تیر",
    5: "مرداد",
    6: "شهریور",
    7: "مهر",
    8: "آبان",
    9: "آذر",
    10: "دی",
    11: "بهمن",
    12: "اسفند",
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="المنت های UI" breadcrumbItem="رنج اسلایدر" />

          <Row>
            <Col className="col-12">
              <Card>
                <CardBody>
                  <CardTitle>رنج اسلایدر ری اکت</CardTitle>
                  <Row>
                    <Col xl={6}>
                      <div className="p-3">
                        <h5 className="font-size-14 mb-3 mt-0">پیش فرض</h5>
                        <span className="float-left mt-4">0</span>{" "}
                        <span className="float-right  mt-4">100</span>
                        <div dir="ltr">
                          <Slider
                            value={def}
                            orientation="horizontal"
                            onChange={(value) => {
                              setdef(value);
                            }}
                          />
                        </div>
                      </div>
                    </Col>

                    <Col xl={6}>
                      <div className="p-3">
                        <h5 className="font-size-14 mb-3 mt-0">کمترین-بیشترین</h5>
                        <span className="float-left mt-4">30</span>{" "}
                        <span className="float-right  mt-4">90</span>
                        <div dir="ltr">
                          <Slider
                            value={min_max}
                            min={30}
                            max={90}
                            orientation="horizontal"
                            onChange={(value) => {
                              setmin_max(value);
                            }}
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col xl={6}>
                      <div className="p-3">
                        <h5 className="font-size-14 mb-3 mt-0">پیشوند</h5>
                        <span className="float-left mt-4">0</span>{" "}
                        <span className="float-right  mt-4">100</span>
                        <div dir="ltr"><Slider
                          min={0}
                          max={100}
                          format={formatkg}
                          value={prefix}
                          onChange={(value) => {
                            setprefix(value);
                          }}
                        /></div>
                      </div>
                    </Col>

                    <Col xl={6}>
                      <div className="p-3">
                        <h5 className="font-size-14 mb-3 mt-0">پسوندها</h5>
                        <span className="float-left mt-4">0</span>{" "}
                        <span className="float-right  mt-4">100</span>
                        <div dir="ltr"><Slider
                          min={0}
                          max={100}
                          format={formatdollar}
                          value={postfix}
                          onChange={(value) => {
                            setpostfix(value);
                          }}
                        /></div>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col xl={6}>
                      <div className="p-3">
                        <h5 className="font-size-14 mb-3 mt-0">گام</h5>
                        <span className="float-left mt-4">0</span>{" "}
                        <span className="float-right  mt-4">100</span>
                        <div dir="ltr"><Slider
                          value={step}
                          step={10}
                          orientation="horizontal"
                          onChange={(value) => {
                            setstep(value);
                          }}
                        /></div>
                      </div>
                    </Col>

                    <Col xl={6}>
                      <div className="p-3">
                        <h5 className="font-size-14 mb-3 mt-0">
                          ارزش های سفارشی
                        </h5>
                        <div dir="ltr"><Slider
                          value={custom_val}
                          min={1}
                          max={12}
                          labels={labels}
                          orientation="horizontal"
                          onChange={(value) => {
                            setcustom_val(value);
                          }}
                        /></div>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                   

                    <Col xl={6}>
                      <div className="p-3">
                        <h5 className="font-size-14 mb-3 mt-0">مثال اضافی</h5>
                        <span className="float-left mt-4">0</span>{" "}
                        <span className="float-right  mt-4">100</span>
                        <div dir="ltr"><Slider
                          min={0}
                          max={100}
                          format={extra_age}
                          value={extra}
                          onChange={(value) => {
                            setextra(value);
                          }}
                        /></div>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col xl={6}>
                      <div className="p-3">
                        <h5 className="font-size-14 mb-3 mt-0">
                          زیباسازی اعداد
                        </h5>
                        <span className="float-left mt-4">1</span>{" "}
                        <span className="float-right  mt-4">100</span>
                        <div dir="ltr"><Slider
                          value={float_val}
                          step={0.5}
                          orientation="horizontal"
                          onChange={(value) => {
                            setfloat_val(value);
                          }}
                        /></div>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default UiRangeSlider
