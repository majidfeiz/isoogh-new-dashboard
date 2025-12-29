import React from "react";
import { Card, CardBody, CardText, CardTitle, Col, Row } from "reactstrap";
// img
import img4 from "../../../assets/images/small/img-4.jpg";
import img5 from "../../../assets/images/small/img-5.jpg";
import img6 from "../../../assets/images/small/img-6.jpg";

const CardGroups = () => {
    return (
      <React.Fragment>
        <Row>
          <Col xs={12}>
            <h4 className="my-3">گروه های کارت</h4>
            <div className="card-deck-wrapper">
              <div className="card-group">
                <Card className="mb-4">
                  <img
                    className="card-img-top img-fluid"
                    src={img4}
                    alt="Skote"
                  />
                  <CardBody>
                    <CardTitle tag="h4" className="mt-0">
                      عنوان کارت
                    </CardTitle>
                    <CardText>
                      این یک کارت طولانی‌تر با متن پشتیبانی در زیر است هدایت
                      طبیعی به محتوای اضافی این محتوا یک است کمی طولانی تر
                    </CardText>
                    <CardText>
                      <small className="text-muted">
                        آخرین به روز رسانی 3 دقیقه قبل
                      </small>
                    </CardText>
                  </CardBody>
                </Card>
                <Card className="mb-4">
                  <img
                    className="card-img-top img-fluid"
                    src={img5}
                    alt="Skote"
                  />
                  <CardBody>
                    <CardTitle tag="h4" className="mt-0">
                      عنوان کارت
                    </CardTitle>
                    <CardText>
                      این کارت دارای متن پشتیبانی در زیر به عنوان ورودی طبیعی
                      است به محتوای اضافی
                    </CardText>
                    <CardText>
                      <small className="text-muted">
                        آخرین به روز رسانی 3 دقیقه قبل
                      </small>
                    </CardText>
                  </CardBody>
                </Card>
                <Card className="mb-4">
                  <img
                    className="card-img-top img-fluid"
                    src={img6}
                    alt="Skote"
                  />
                  <CardBody>
                    <CardTitle tag="h4" className="mt-0">
                      عنوان کارت
                    </CardTitle>
                    <CardText>
                      این یک کارت عریض‌تر با متن پشتیبانی در زیر است هدایت طبیعی
                      به محتوای اضافی این کارت دارای حتی محتوای طولانی تر از
                      اولی که ارتفاع برابر را نشان می دهد عمل
                    </CardText>
                    <CardText>
                      <small className="text-muted">
                        آخرین به روز رسانی 3 دقیقه قبل
                      </small>
                    </CardText>
                  </CardBody>
                </Card>
              </div>
            </div>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default CardGroups;