import React from "react";
import { CardBody, CardText, CardTitle, Card, Col, Row } from "reactstrap";

// img
import img2 from "../../../assets/images/small/img-2.jpg";
import img3 from "../../../assets/images/small/img-3.jpg";

const CardTitleImg = () => {
    return (
      <React.Fragment>
        <Row>
          <Col lg={6}>
            <Card>
              <Row className="no-gutters align-items-center">
                <Col md={4}>
                  <img className="img-fluid" src={img2} alt="Skote" />
                </Col>
                <Col md={8}>
                  <CardBody>
                    <CardTitle tag="h4">عنوان کارت</CardTitle>
                    <CardText>
                      این یک کارت عریض‌تر با متن پشتیبانی در زیر است هدایت طبیعی
                      به محتوای اضافی
                    </CardText>
                    <CardText>
                      <small className="text-muted">
                        آخرین به روز رسانی 3 دقیقه قبل
                      </small>
                    </CardText>
                  </CardBody>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col lg={6}>
            <Card>
              <Row className="no-gutters align-items-center">
                <Col md={8}>
                  <CardBody>
                    <CardTitle tag="h4">عنوان کارت</CardTitle>
                    <CardText>
                      این یک کارت عریض‌تر با متن پشتیبانی در زیر است هدایت طبیعی
                      به محتوای اضافی
                    </CardText>
                    <CardText>
                      <small className="text-muted">
                        آخرین به روز رسانی 3 دقیقه قبل
                      </small>
                    </CardText>
                  </CardBody>
                </Col>
                <Col md={4}>
                  <img className="img-fluid" src={img3} alt="Skote" />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default CardTitleImg;