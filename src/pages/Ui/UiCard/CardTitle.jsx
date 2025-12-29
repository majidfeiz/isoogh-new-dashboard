import React from "react";
import { CardBody, CardText, CardTitle, Card, Col, Row } from "reactstrap";
import img5 from "../../../assets/images/small/img-5.jpg";
import img6 from "../../../assets/images/small/img-6.jpg";
import img7 from "../../../assets/images/small/img-7.jpg";

const CardTitles = () => {
    return (
      <React.Fragment>
        <Row>
          <Col lg={4}>
            <Card>
              <img className="card-img img-fluid" src={img5} alt="Skote" />
              <CardBody>
                <CardTitle tag="h4" className="mt-0">
                  عنوان کارت
                </CardTitle>
                <CardText>
                  این یک کارت گسترده تر با متن پشتیبانی در زیر به عنوان یک طبیعی
                  است منجر به محتوای اضافی این محتوا کمی است طولانی تر
                </CardText>
                <CardText>
                  <small className="text-muted">
                    آخرین به روز رسانی 3 دقیقه قبل
                  </small>
                </CardText>
              </CardBody>
            </Card>
          </Col>

          <Col lg={4}>
            <Card>
              <CardBody>
                <CardTitle tag="h4" className="mt-0">
                  عنوان کارت
                </CardTitle>
                <CardText>
                  این یک کارت گسترده تر با متن پشتیبانی در زیر به عنوان یک طبیعی
                  است منجر به محتوای اضافی این محتوا کمی است طولانی تر
                </CardText>
                <CardText>
                  <small className="text-muted">
                    آخرین به روز رسانی 3 دقیقه قبل
                  </small>
                </CardText>
              </CardBody>
              <img className="card-img img-fluid" src={img7} alt="Skote" />
            </Card>
          </Col>

          <Col lg={4}>
            <Card>
              <img className="card-img img-fluid" src={img6} alt="Skote" />
              <div className="card-img-overlay">
                <CardTitle tag="h4" className="text-white mt-0">
                  عنوان کارت
                </CardTitle>
                <CardText className="text-light">
                  این یک کارت گسترده تر با متن پشتیبانی در زیر به عنوان یک طبیعی
                  است منجر به محتوای اضافی این محتوا کمی است طولانی تر
                </CardText>
                <CardText>
                  <small className="text-white">
                    آخرین به روز رسانی 3 دقیقه قبل
                  </small>
                </CardText>
              </div>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default CardTitles;