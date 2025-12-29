import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Button,
} from "reactstrap";
import { Link } from "react-router-dom";

//Import Countdown
import Countdown from "react-countdown";

const renderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a completed state
    return (
      <>
        <div className="coming-box">
          00
          <span>روزها</span>
        </div>
        <div className="coming-box">
          00
          <span>ساعت ها</span>
        </div>
        <div className="coming-box">
          00
          <span>دقیقه</span>
        </div>
        <div className="coming-box">
          00
          <span>ثانیه ها</span>
        </div>
      </>
    );
  } else {
    // Render a countdown
    return (
      <>
        <div className="coming-box">
          {days}
          <span>روزها</span>
        </div>
        <div className="coming-box">
          {hours}
          <span>ساعت ها</span>
        </div>
        <div className="coming-box">
          {minutes}
          <span>دقیقه ها</span>
        </div>
        <div className="coming-box">
          {seconds}
          <span>ثانیه ها</span>
        </div>
      </>
    );
  }
};

const Section = () => {
  return (
    <React.Fragment>
      <section className="section hero-section bg-ico-hero" id="home">
        <div className="bg-overlay bg-primary" />
        <Container>
          <Row className="align-items-center">
            <Col lg="5">
              <div className="text-white-50">
                <h1 className="text-white fw-semibold mb-3 hero-title">
                  Skote - لندینگ Ico  برای یک تجارت ارز دیجیتال
                </h1>
                <p className="font-size-14">
                  در واقع برای یک انگلیسی به همان سادگی غربی خواهد بود شخص، به
                  نظر می رسد مانند یک کمبریج شکاک ساده شده است
                </p>

                <div className="d-flex flex-wrap gap-2 mt-4">
                  <Link to="#" className="btn btn-success">
                    کاغ سفید را دریافت کنید
                  </Link>
                  <Link to="#" className="btn btn-light">
                    چطور کار میکند
                  </Link>
                </div>
              </div>
            </Col>
            <Col lg="5" md="8" sm="10" className="ms-lg-auto">
              <Card className="overflow-hidden mb-0 mt-5 mt-lg-0">
                <CardHeader className="text-center">
                  <h5 className="mb-0">زمان شمارش معکوس ICO</h5>
                </CardHeader>
                <CardBody>
                  <div className="text-center">
                    <h5>زمان باقی مانده به Ico:</h5>
                    <div className="mt-4">
                      <div className="counter-number ico-countdown">
                        <Countdown date="2022/10/31" renderer={renderer} />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button type="button" color="success" className="w-md">
                        توکن را دریافت کنید
                      </Button>
                    </div>

                    <div className="mt-5">
                      <h4 className="font-weight-semibold">1 ETH = 2235 SKT</h4>
                      <div className="clearfix mt-4">
                        <h5 className="float-end font-size-14">5234.43</h5>
                      </div>
                      <div className="progress p-1 progress-xl softcap-progress">
                        <div
                          className="progress-bar bg-info"
                          role="progressbar"
                          style={{ width: "15%" }}
                          aria-valuenow="15"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          <div className="progress-label">15 %</div>
                        </div>
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated"
                          role="progressbar"
                          style={{ width: "30%" }}
                          aria-valuenow="30"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          <div className="progress-label">30 %</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </React.Fragment>
  );
};

export default Section;
