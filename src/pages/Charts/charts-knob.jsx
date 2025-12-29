import React, { useState } from "react"
import { Container, Row, Col, Card, CardBody } from "reactstrap"

import Knob from "../AllCharts/knob/knob"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

const ChartsKnob = () => {

  //meta title
  document.title = "Jquery Knob Charts | Skote - قالب مدیریتی و داشبورد react"

  const [value, setvalue] = useState(35)
  const [value_cur, setvalue_cur] = useState(29)
  const [value_prev, setvalue_prev] = useState(44)
  const [angle, setangle] = useState(14)
  const [steps, setsteps] = useState(56)
  const [angleArc, setangleArc] = useState(54)
  const [ang_offset_arc, setang_offset_arc] = useState(44)
  const [readonly, setreadonly] = useState(85)

  const handleChange = newValue => {
    setvalue(newValue)
  }
  const handleChangecursor = newValue => {
    setvalue_cur(newValue)
  }
  const handleChangeprev = newValue => {
    setvalue_prev(newValue)
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs
            title="Charts"
            breadcrumbItem="Jquery نمودار های دستگیره ای"
          />

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <h4 className="card-title">مثال ها</h4>
                  <p className="card-title-desc">
                    شماره گیری زیبا، سازگار رو به پایین، قابل لمس، جی کوئری
                  </p>

                  <Row>
                    <Col lg="4">
                      <div className="text-center" dir="ltr">
                        <h5 className="font-size-14 mb-3">
                          غیرفعال کردن ورودی نمایشگر
                        </h5>
                        <Knob
                          value={value}
                          height={200}
                          width={150}
                          fgColor="#556ee6"
                          displayCustom={() => {
                            return false;
                          }}
                          onChange={handleChange}
                        />
                      </div>
                    </Col>
                    <Col lg="4">
                      <div className="text-center" dir="ltr">
                        <h5 className="font-size-14 mb-3">حالت مکان نما</h5>
                        <Knob
                          value={value_cur}
                          height={200}
                          width={150}
                          fgColor="#4ac18e"
                          cursor={true}
                          displayCustom={() => {
                            return false;
                          }}
                          onChange={handleChangecursor}
                        />
                      </div>
                    </Col>
                    <Col lg="4">
                      <div className="text-center" dir="ltr">
                        <h5 className="font-size-14 mb-3">
                          نمایش مقدار قبلی
                        </h5>
                        <Knob
                          value={value_prev}
                          height={200}
                          width={150}
                          fgColor="#50a5f1"
                          onChange={handleChangeprev}
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col lg="4">
                      <div className="text-center" dir="ltr">
                        <h5 className="font-size-14 mb-3">زاویه کمان</h5>
                        <Knob
                          value={angle}
                          fgColor="#ffbb44"
                          lineCap="round"
                          height={200}
                          width={150}
                          onChange={(e) => {
                            setangle(e);
                          }}
                        />
                      </div>
                    </Col>
                    <Col lg="4">
                      <div className="text-center" dir="ltr">
                        <h5 className="font-size-14 mb-3">
                          {" "}
                          مقادیر 5 رقمی، مرحله 1000
                        </h5>
                        <Knob
                          value={steps}
                          fgColor="#1d1e3a"
                          step={10}
                          height={200}
                          width={150}
                          onChange={(e) => {
                            setsteps(e);
                          }}
                        />
                      </div>
                    </Col>
                    <Col lg="4">
                      <div className="text-center" dir="ltr">
                        <h5 className="font-size-14 mb-3">
                          زاویه ی قوس و کمان
                        </h5>
                        <Knob
                          value={angleArc}
                          fgColor="#f46a6a"
                          angleArc={360}
                          angleOffset={5}
                          cursor={true}
                          height={200}
                          width={150}
                          onChange={(e) => {
                            setangleArc(e);
                          }}
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col lg="4">
                      <div className="text-center" dir="ltr">
                        <h5 className="font-size-14 mb-3">فقط خواندنی</h5>
                        <Knob
                          value={readonly}
                          fgColor="#e83e8c"
                          thickness={0.12}
                          readOnly={true}
                          height={200}
                          width={150}
                          onChange={(e) => {
                            setreadonly(e);
                          }}
                        />
                      </div>
                    </Col>
                    <Col lg="4">
                      <div className="text-center" dir="ltr">
                        <h5 className="font-size-14 mb-3">
                          افست زاویه و قوس
                        </h5>
                        <Knob
                          value={ang_offset_arc}
                          fgColor="#8d6e63"
                          thickness={0.18}
                          angleArc={300}
                          angleOffset={5}
                          cursor={true}
                          height={200}
                          width={150}
                          onChange={(e) => {
                            setang_offset_arc(e);
                          }}
                        />
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

export default ChartsKnob
