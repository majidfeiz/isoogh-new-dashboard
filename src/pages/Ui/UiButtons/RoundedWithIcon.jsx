import React from "react";
import { Button, Card, CardBody, CardTitle, Col, Row } from "reactstrap";

const RoundedWithIcon = () => {
    return (
      <React.Fragment>
        <Row>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>دکمه های گرد</CardTitle>
                <p className="card-title-desc">
                  برای حاشیه گرد دکمه از کلاس <code>.btn-rounded</code> استفاده
                  کنید
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Button color="primary" className="btn-rounded ">
                    اولیه
                  </Button>
                  <Button color="secondary" className="btn-rounded ">
                    ثانویه
                  </Button>
                  <Button color="success" className="btn-rounded ">
                    موفقیت
                  </Button>
                  <Button color="info" className="btn-rounded ">
                    اطلاعات
                  </Button>
                  <Button color="warning" className="btn-rounded ">
                    هشدار
                  </Button>
                  <Button color="danger" className="btn-rounded ">
                    خطر
                  </Button>
                  <Button color="dark" className="btn-rounded ">
                    تاریک
                  </Button>
                  <Button color="link" className="btn-rounded">
                    لینک
                  </Button>
                  <Button color="light" className="btn-rounded">
                    روشن
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>دکمه ها با آیکون</CardTitle>
                <p className="card-title-desc">دکمه اضافه کردن نماد </p>

                <div className="d-flex flex-wrap gap-2">
                  <Button type="button" color="primary ">
                    <i className="bx bx-smile font-size-16 align-middle me-2"></i>{" "}
                    اولیه
                  </Button>
                  <Button type="button" color="success ">
                    <i className="bx bx-check-double font-size-16 align-middle me-2"></i>{" "}
                    ثانویه
                  </Button>
                  <Button type="button" color="warning ">
                    <i className="bx bx-error font-size-16 align-middle me-2"></i>{" "}
                    هشدار
                  </Button>
                  <Button type="button" color="danger ">
                    <i className="bx bx-block font-size-16 align-middle me-2"></i>{" "}
                    خطر
                  </Button>
                  <Button type="button" color="dark ">
                    <i className="bx bx-loader bx-spin font-size-16 align-middle me-2"></i>{" "}
                    بارگذاری
                  </Button>
                  <Button type="button" color="light ">
                    <i className="bx bx-hourglass bx-spin font-size-16 align-middle me-2"></i>{" "}
                    بارگذاری
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default RoundedWithIcon;