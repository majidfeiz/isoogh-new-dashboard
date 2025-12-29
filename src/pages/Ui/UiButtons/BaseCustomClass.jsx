import React from "react";
import { Button, Card, CardBody, Col, Row } from "reactstrap";

const BaseCustomClass = () => {
    return (
      <React.Fragment>
        <Row>
          <Col xl={6}>
            <Card>
              <CardBody>
                <h4 className="card-title">کلاس پایه</h4>
                <p className="card-title-desc">
                  بوت استرپ یک کلاس پایه <code>.btn</code> دارد که راه اندازی می
                  شود سبک های اساسی مانند padding و هم ترازی محتوا. توسط
                  پیش‌فرض، کنترل‌های <code>.btn</code> یک حاشیه شفاف دارند و رنگ
                  پس‌زمینه، و فاقد هرگونه فوکوس واضح و شناور است سبک ها
                </p>

                <button type="button" className="btn">
                  کلاس پایه
                </button>
              </CardBody>
            </Card>
          </Col>
          <Col xl={6}>
            <Card>
              <CardBody>
                <h4 className="card-title">اندازه سفارشی با متغیرهای CSS</h4>
                <p className="card-title-desc">
                  شما حتی می توانید اندازه سفارشی خود را با متغیرهای CSS رول
                  کنید:
                </p>
                <div>
                  <Button
                    type="button"
                    color="primary"
                    //  style={{--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: ".75rem"}}
                  >
                    دکمه سفارشی
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default BaseCustomClass;