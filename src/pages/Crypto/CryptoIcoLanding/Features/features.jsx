import React from "react";
import { Container, Row, Col } from "reactstrap";

//Import Components
import FeatureBox from "./feature-box";

//Import images
import feature1 from "../../../../assets/images/crypto/features-img/img-1.png";
import feature2 from "../../../../assets/images/crypto/features-img/img-2.png";

const Features = () => {
  const features1 = [
    { id: 1, desc: "افزایش قیمت ارز های دیجیتال " },
    { id: 2, desc: "پروسه احراز هویت برای تایید کاربر" },
  ];
  const features2 = [
    { id: 1, desc: "با اموزش های حرفه ای همیشه پر سود باشید" },
    { id: 2, desc: "هنوز برای ورود به دنیای رمز ارز ها مردد هستید ؟" },
  ];

  return (
    <React.Fragment>
      <section className="section" id="features">
        <Container>
          <Row>
            <Col lg="12">
              <div className="text-center mb-5">
                <div className="small-title">امکانات</div>
                <h4>ویژگی های کلیدی محصول</h4>
              </div>
            </Col>
          </Row>

          <Row className="align-items-center pt-4">
            <Col md="6" sm="8">
              <div>
                <img
                  src={feature1}
                  alt=""
                  className="img-fluid mx-auto d-block"
                />
              </div>
            </Col>
            <Col md="5" className="ms-auto">
              {/* featurebox */}
              <FeatureBox
                num="01"
                title="امانت دادن"
                features={features1}
                desc="اگر چند زبان با هم ادغام شوند، گرامر زبان حاصل ساده تر و منظم تر از زبان فردی است، ساده تر و منظم تر از زبان موجود خواهد بود."
              />
            </Col>
          </Row>

          <Row className="align-items-center mt-5 pt-md-5">
            <Col md="5">
              {/* featurebox */}
              <FeatureBox
                num="02"
                title="کیف پول"
                features={features2}
                desc="به همین سادگی خواهد بود. در واقع، آن را غربی خواهد بود. برای یک فرد انگلیسی، به عنوان یک دوست کمبریج شکاک، انگلیسی ساده شده به نظر می رسد"
              />
            </Col>
            <Col md="6" sm="8" className="ms-md-auto">
              <div className="mt-4 me-md-0">
                <img
                  src={feature2}
                  alt=""
                  className="img-fluid mx-auto d-block"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </React.Fragment>
  );
};

export default Features;
