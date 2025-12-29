import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardText, CardTitle, Col } from "reactstrap";

const CardFeatured = ({ isFooter, tag }) => {
    return (
      <React.Fragment>
        <Col lg={4}>
          <Card>
            {tag ? (
              <h5 className="card-header bg-transparent border-bottom text-uppercase">
                ویژه
              </h5>
            ) : (
              <div className="card-header bg-transparent border-bottom text-uppercase">
                ویژه
              </div>
            )}
            <CardBody>
              <CardTitle tag="h4" className="mt-0">
                درمان عنوان ویژه
              </CardTitle>
              <CardText>
                با متن پشتیبان زیر به عنوان یک راهنما طبیعی به موارد اضافی محتوا
              </CardText>
              <Link to="#!" className="btn btn-primary">
                برو یه جایی
              </Link>
            </CardBody>
            {isFooter && (
              <div className="card-footer bg-transparent border-top text-muted">
                2 روز قبل
              </div>
            )}
          </Card>
        </Col>
      </React.Fragment>
    );
}

export default CardFeatured;