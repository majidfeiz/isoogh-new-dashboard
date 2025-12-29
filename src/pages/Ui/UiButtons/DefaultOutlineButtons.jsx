import React from "react";
import { Button, Card, CardBody, CardTitle, Col, Row } from "reactstrap";

const DefaultOutlineButtons = () => {
    return (
      <React.Fragment>
        <Row>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>دکمه های پیش فرض</CardTitle>
                <p className="card-title-desc">
                  بوت استرپ شامل شش سبک دکمه از پیش تعریف شده است که هر یک از
                  آنها سرو می شود هدف معنایی خودش
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    color="primary"
                    className="btn btn-primary waves-effect waves-light"
                  >
                    اولیه
                  </Button>
                  <Button
                    color="secondary"
                    className="btn btn-secondary waves-effect waves-light"
                  >
                    ثانوی
                  </Button>
                  <Button
                    color="success"
                    className="btn btn-success waves-effect waves-light"
                  >
                    موفقیت
                  </Button>
                  <Button
                    color="info"
                    className="btn btn-info waves-effect waves-light"
                  >
                    اطلاعات
                  </Button>
                  <Button
                    color="warning"
                    className="btn btn-warning waves-effect waves-light"
                  >
                    هشدار
                  </Button>
                  <Button
                    color="danger"
                    className="btn btn-danger waves-effect waves-light"
                  >
                    خطر
                  </Button>
                  <Button
                    color="dark"
                    className="btn btn-dark waves-effect waves-light"
                  >
                    تاریک
                  </Button>
                  <Button color="link" className="btn btn-link waves-effect">
                    لینک
                  </Button>
                  <Button color="light" className="btn btn-light waves-effect">
                    روشن
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>دکمه های طرح کلی</CardTitle>
                <p className="card-title-desc">
                  کلاس های اصلاح کننده پیش فرض را با جایگزین کنید
                  <code className="highlighter-rouge">.btn-outline-*</code>
                  برای حذف تمام تصاویر پس زمینه و رنگ ها در هر دکمه
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Button color="primary" outline>
                    اولیه
                  </Button>
                  <Button color="secondary" outline>
                    ثانویه
                  </Button>
                  <Button color="success" outline>
                    موفقیت
                  </Button>
                  <Button color="info" outline>
                    اطلاعات
                  </Button>
                  <Button color="warning" outline>
                    هشدار
                  </Button>
                  <Button color="danger" outline>
                    خطر
                  </Button>
                  <Button color="dark" outline>
                    تاریک
                  </Button>
                  <Button color="light" outline>
                    روشن
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default DefaultOutlineButtons;