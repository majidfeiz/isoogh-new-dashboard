import React from "react";
import { Card, CardBody, CardHeader, Col } from "reactstrap";

const QuoteCard = () => {
    return (
      <React.Fragment>
        <Col lg={4}>
          <Card>
            <CardHeader className="bg-transparent border-bottom">
              Quote
            </CardHeader>
            <CardBody>
              <blockquote className="card-blockquote mb-0">
                <p>
                  لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
                  استفاده از طراحان گرافیک است.
                </p>
                <footer className="blockquote-footer mt-0 font-size-12">
                  {" "}
                  شخصی معروف در
                  <cite title="Source Title"> عنوان منبع</cite>
                </footer>
              </blockquote>
            </CardBody>
          </Card>
        </Col>
      </React.Fragment>
    );
}

export default QuoteCard;