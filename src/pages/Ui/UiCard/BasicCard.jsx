import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardImg, CardSubtitle, CardText, CardTitle, Col, Row } from "reactstrap";

// IMage
import img1 from "../../../assets/images/small/img-1.jpg";
import img2 from "../../../assets/images/small/img-2.jpg";
import img3 from "../../../assets/images/small/img-3.jpg";
import img4 from "../../../assets/images/small/img-4.jpg";

const BasicCard = () => {
    return (
      <React.Fragment>
        <Row>
          <Col md={6} xl={3}>
            <Card>
              <CardImg top className="img-fluid" src={img1} alt="Skote" />
              <CardBody>
                <CardTitle className="mt-0">عنوان کارت</CardTitle>
                <CardText>
                  چند متن مثال سریع برای ساختن عنوان کارت و ساخت بخش عمده ای از
                  کارت
                </CardText>
                <Link to="#" className="btn btn-primary">
                  دکمه
                </Link>
              </CardBody>
            </Card>
          </Col>
          <Col md={6} xl={3}>
            <Card>
              <CardImg top className="img-fluid" src={img2} alt="Skote" />
              <CardBody>
                <CardTitle className="mt-0">عنوان کارت</CardTitle>
                <CardText>
                  چند نمونه متن کوتاه برای ساختن عنوان کارت و آرایش بخش عمده ای
                  از کارت
                </CardText>
              </CardBody>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">بخش اول کارت</li>
                <li className="list-group-item">بخش دوم کارت</li>
              </ul>
              <CardBody>
                <Link to="#" className="card-link">
                   لینک کارت
                </Link>
                <Link to="#" className="card-link">
                   لینک دیگر
                </Link>
              </CardBody>
            </Card>
          </Col>

          <Col md={6} xl={3}>
            <Card>
              <CardImg top className="img-fluid" src={img3} alt="Skote" />
              <CardBody>
                <CardText>
                  چند نمونه متن کوتاه برای ساختن عنوان کارت و آرایش بخش عمده ای
                  از کارت
                </CardText>
              </CardBody>
            </Card>
          </Col>
          <Col md={6} xl={3}>
            <Card>
              <CardBody>
                <CardTitle>عنوان کارت</CardTitle>
                <CardSubtitle className="font-14 text-muted">
                  زیرنویس کارت پشتیبانی
                </CardSubtitle>
              </CardBody>
              <CardImg className="img-fluid" src={img4} alt="Skote" />
              <CardBody>
                <CardText>
                  چند نمونه متن کوتاه برای ساختن عنوان کارت و آرایش بخش عمده ای
                  از کارت
                </CardText>
                <Link to="#" className="card-link">
                  لینک کارت
                </Link>
                <Link to="#" className="card-link">
                  لینک دیگر
                </Link>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default BasicCard;