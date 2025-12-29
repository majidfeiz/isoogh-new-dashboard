import React from "react";
import { Button, Card, CardBody, CardTitle, Col, Row } from "reactstrap";

const SoftButtons = () => {
    return (
      <React.Fragment>
        <Row>
          <Col xl={12}>
            <Card>
              <CardBody>
                <CardTitle className="card-title">دکمه های نرم</CardTitle>
                <p className="card-title-desc">
                  برای دکمه های نرم از کلاس <code>.btn-soft*</code> استفاده کنید
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="btn btn-soft-primary waves-effect waves-light"
                  >
                    اولیه
                  </Button>
                  <Button
                    type="button"
                    className="btn btn-soft-secondary waves-effect waves-light"
                  >
                    ثانویه
                  </Button>
                  <Button
                    type="button"
                    className="btn btn-soft-success waves-effect waves-light"
                  >
                    موفقیت
                  </Button>
                  <Button
                    type="button"
                    className="btn btn-soft-info waves-effect waves-light"
                  >
                    اطلاعات
                  </Button>
                  <Button
                    type="button"
                    className="btn btn-soft-warning waves-effect waves-light"
                  >
                    هشدار
                  </Button>
                  <Button
                    type="button"
                    className="btn btn-soft-danger waves-effect waves-light"
                  >
                    خطر
                  </Button>
                  <Button
                    type="button"
                    className="btn btn-soft-dark waves-effect waves-light"
                  >
                    تاریک
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default SoftButtons;