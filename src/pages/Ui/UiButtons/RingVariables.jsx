import React from "react";
import { Card, CardBody, Col, Row } from "reactstrap";

const RingVariables = () => {
    return (
      <React.Fragment>
        <Row>
          <Col xl={6}>
            <Card>
              <CardBody>
                <h4 className="card-title">حلقه فوکوس</h4>
                <p className="card-title-desc">
                  برای مشاهده حلقه فوکوس مستقیما روی لینک زیر کلیک کنید اقدام
                  کنید یا به مثال زیر وارد کنید و سپس فشار دهید <kbd>Tab</kbd>.
                </p>
                <div>
                  <a
                    href="#!"
                    className="d-inline-flex focus-ring py-1 px-2 text-decoration-none border rounded-2"
                  >
                    حلقه فوکوس سفارشی
                  </a>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl={6}>
            <Card>
              <CardBody>
                <h4 className="card-title">متغیرهای CSS</h4>
                <p className="card-title-desc">
                  متغیرهای CSS <code>--bs-focus-ring-*</code> را به عنوان تغییر
                  دهید برای تغییر ظاهر پیش فرض لازم است
                </p>
                <div>
                  <a
                    href="#!"
                    className="d-inline-flex focus-ring py-1 px-2 text-decoration-none border rounded-2"
                    //  style="--bs-focus-ring-color: rgba(var(--bs-success-rgb), .25)"
                  >
                    حلقه فوکوس سبز
                  </a>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default RingVariables;