import React from "react";
import { Button, Card, CardBody, CardTitle, Col, Row } from "reactstrap";

const ButtonSizesWidth = () => {
    return (
      <React.Fragment>
        <Row>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>اندازه دکمه ها</CardTitle>
                <p className="card-title-desc">
                  <code>.btn-lg</code> یا <code>.btn-sm</code> را برای اندازه
                  های اضافی
                </p>

                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <Button color="primary" className="btn btn-lg ">
                    دکمه بزرگ
                  </Button>
                  <Button color="secondary" className="btn btn-lg ">
                    دکمه بزرگ
                  </Button>
                  <Button color="primary" className="btn-sm">
                    دکمه کوچک
                  </Button>
                  <Button color="secondary" className=" btn-sm ">
                    دکمه کوچک
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>عرض دکمه ها</CardTitle>
                <p className="card-title-desc">
                  افزودن <code>.w-xs</code>، <code>.w-sm</code>،{" "}
                  <code>.w-md</code> و <code> .w-lg</code> className برای دکمه
                  های اضافی عرض
                </p>

                <div className="d-flex flex-wrap gap-2">
                  <Button type="button" color="primary" className="w-xs ">
                    خیلی کوچک
                  </Button>
                  <Button type="button" color="danger" className="w-sm ">
                    کوچک
                  </Button>
                  <Button type="button" color="warning" className="w-md ">
                    متوسط
                  </Button>
                  <Button type="button" color="success" className="w-lg ">
                    بزرگ
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default ButtonSizesWidth;