import React from "react";
import { Card, CardBody, CardHeader, CardText, CardTitle, Col } from "reactstrap";

const CardColor = ({ color, className }) => {
    return (
      <React.Fragment>
        <Col lg={4}>
          <Card color={color?.toLowerCase()} className={className}>
            <CardBody>
              <h5
                className={`mb-4 ${
                  color === "Dark" ? "text-light" : "text-white"
                }`}
              >
                <i className="mdi mdi-bullseye-arrow me-3" />کارت با نام کلاس {color} 
              </h5>
              <CardText>
                چند متن مثال سریع برای ساختن عنوان کارت و ساخت بخش عمده ای از
                کارت
              </CardText>
            </CardBody>
          </Card>
        </Col>
      </React.Fragment>
    );
}

const CardColorOutline = ({ border }) => {
    return (
      <React.Fragment>
        <Col lg={4}>
          <Card color={border?.toLowerCase()} outline className="border">
            <CardHeader className="bg-transparent">
              <h5 className={"my-0 text-" + border}>
                <i className="mdi mdi-bullseye-arrow me-3" />
                {border} طرح کلی کارت
              </h5>
            </CardHeader>
            <CardBody>
              <CardTitle tag="h5">عنوان کارت</CardTitle>
              <CardText>
                چند نمونه متن کوتاه برای ساختن عنوان کارت و آرایش بخش عمده ای از
                کارت
              </CardText>
            </CardBody>
          </Card>
        </Col>
      </React.Fragment>
    );
}


export { CardColor, CardColorOutline };

