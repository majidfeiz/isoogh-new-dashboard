import React, { useState } from "react";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Row, Col, Card, CardBody, Container } from "reactstrap";


import { Rating } from "react-simple-star-rating";

const UiRating = () => {

  //meta title
  document.title = "Rating | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="المنت های UI" breadcrumbItem="رتبه بندی" />

          <Row>
            <Col className="col-12">
              <Card>
                <CardBody>
                  <Row>
                    <Col xl="3" md="4" sm="6">
                      <div className="p-4 text-center">
                        <h5 className="font-16 m-b-15">ارزیابی پایه</h5>
                        <Rating size={25} />
                      </div>
                    </Col>

                    <Col xl="3" md="4" sm="6">
                      <div className="p-4 text-center">
                        <h5 className="font-16 m-b-15">مقدار اولیه</h5>
                        <Rating
                          size={25}
                          initialValue={3}
                          transition
                          onClick={function noRefCheck() {}}
                        />
                      </div>
                    </Col>

                    <Col xl="3" md="4" sm="6">
                      <div className="p-4 text-center">
                        <h5 className="font-16 m-b-15">محدوده رنگ</h5>
                        <Rating
                          size={25}
                          fillColorArray={[
                            "#f14f45",
                            "#f16c45",
                            "#f18845",
                            "#f1b345",
                            "#f1d045",
                          ]}
                          transition
                          onClick={function noRefCheck() {}}
                        />
                      </div>
                    </Col>

                    <Col xl="3" md="4" sm="6">
                      <div className="p-4 text-center">
                        <h5 className="font-16 m-b-15">با راهنمای ابزار</h5>
                        <Rating
                          size={25}
                          showTooltip
                          onClick={function noRefCheck() {}}
                        />
                      </div>
                    </Col>

                    <Col xl="3" md="4" sm="6">
                      <div className="p-4 text-center">
                        <h5 className="font-16 m-b-15">راهنمای ابزار سفارشی</h5>
                        <Rating
                          size={25}
                          showTooltip
                          tooltipArray={[
                            "خیلی بد",
                            "بد",
                            "متوسط",
                            "خوب",
                            "عالی",
                          ]}
                          onClick={function noRefCheck() {}}
                        />
                      </div>
                    </Col>

                    <Col xl="3" md="4" sm="6">
                      <div className="p-4 text-center">
                        <h5 className="font-16 m-b-15">حالت فقط خواندن</h5>
                        <Rating
                          size={25}
                          initialValue={2}
                          readonly
                          onClick={function noRefCheck() {}}
                        />
                      </div>
                    </Col>

                    <Col xl="3" md="4" sm="6">
                      <div className="p-4 text-center">
                        <h5 className="font-16 m-b-15">نرخ کسر</h5>
                        <Rating
                          size={25}
                          allowFraction
                          showTooltip
                          tooltipArray={[
                            "افتضاح",
                            "خیلی خیلی بد+",
                            "بد",
                            "بد+",
                            "متوسط",
                            "متوسط+",
                            "عالی",
                            "عالی+",
                            "خیلی خوب",
                            "خیلی خوب+",
                          ]}
                          transition
                          onClick={function noRefCheck() {}}
                        />
                      </div>
                    </Col>

                    <Col xl="3" md="4" sm="6">
                      <div className="p-4 text-center">
                        <h5 className="font-16 m-b-15">
                          Hover را غیرفعال کنید
                        </h5>
                        <Rating size={25} onClick={function noRefCheck() {}} />
                      </div>
                    </Col>

                    <Col xl="3" md="4" sm="6">
                      <div className="p-4 text-center">
                        <h5 className="font-16 m-b-15">
                          Fill Hover را غیرفعال کنید
                        </h5>
                        <Rating
                          disableFillHover
                          size={25}
                          onClick={function noRefCheck() {}}
                        />
                      </div>
                    </Col>

                    <Col xl="3" md="4" sm="6">
                      <div className="p-4 text-center">
                        <h5 className="font-16 m-b-15">پشتیبانی RTL</h5>
                        <Rating
                          size={25}
                          onClick={function noRefCheck() {}}
                          rtl
                          showTooltip
                          titleSeparator="من"
                          tooltipArray={[
                            "خیلی بد",
                            "بد",
                            "متوسط",
                            "خوب",
                            "فوق العاده",
                          ]}
                          tooltipDefaultText="ارزیابی"
                        />
                      </div>
                    </Col>

                    <Col xl="3" md="4" sm="6">
                      <div className="p-4 text-center">
                        <h5 className="font-16 m-b-15">
                          در اشاره گر وارد کنید
                        </h5>
                        <Rating
                          size={25}
                          onClick={function noRefCheck() {}}
                          onPointerEnter={function noRefCheck() {}}
                        />
                      </div>
                    </Col>

                    <Col xl="3" md="4" sm="6">
                      <div className="p-4 text-center">
                        <h5 className="font-16 m-b-15">در ترک اشاره گر</h5>
                        <Rating
                          size={25}
                          onClick={function noRefCheck() {}}
                          onPointerLeave={function noRefCheck() {}}
                        />
                      </div>
                    </Col>

                    <Col xl="3" md="4" sm="6">
                      <div className="p-4 text-center">
                        <h5 className="font-16 m-b-15">در حرکت اشاره گر</h5>
                        <Rating
                          size={25}
                          onClick={function noRefCheck() {}}
                          onPointerMove={function noRefCheck() {}}
                        />
                      </div>
                    </Col>
                  </Row>{" "}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};
export default UiRating;
