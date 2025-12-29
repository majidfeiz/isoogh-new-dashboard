import React from "react"
import { Row, Col, Card, CardBody, CardTitle } from "reactstrap"
import { Link } from "react-router-dom"

const SocialSource = () => {
  const socials = [
    {
      title: "فیس بوک",
      bgColor: "bg-primary",
      iconClass: "mdi-facebook",
      description: "125",
    },
    {
      title: "توییتر",
      bgColor: "bg-info",
      iconClass: "mdi-twitter",
      description: "112",
    },
    {
      title: "اینستاگرام",
      bgColor: "bg-pink",
      iconClass: "mdi-instagram",
      description: "104",
    },
  ]

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <CardTitle className="mb-4">منبع اجتماعی</CardTitle>
          <div className="text-center">
            <div className="avatar-sm mx-auto mb-4">
              <span className="avatar-title rounded-circle bg-primary bg-primary-subtle font-size-24">
                <i className="mdi mdi-facebook text-primary"></i>
              </span>
            </div>
            <p className="font-16 text-muted mb-2"></p>
            <h5>
              <Link to="#" className="text-dark">
                فیس بوک - <span className="text-muted font-16">125 فروش</span>{" "}
              </Link>
            </h5>
            <p className="text-muted">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
              استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله
              در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی است
  
            </p>
            <Link to="#" className="text-primary font-16">
              بیشتر بدانید <i className="mdi mdi-chevron-left"></i>
            </Link>
          </div>
          <Row className="mt-4">
            {socials.map((social, key) => (
              <Col xs="4" key={"_li_" + key}>
                <div className="social-source text-center mt-3">
                  <div className="avatar-xs mx-auto mb-3">
                    <span
                      className={
                        "avatar-title rounded-circle " +
                        social.bgColor +
                        " font-size-16"
                      }
                    >
                      <i
                        className={"mdi " + social.iconClass + " text-white"}
                      ></i>
                    </span>
                  </div>
                  <h5 className="font-size-15">{social.title}</h5>
                  <p className="text-muted mb-0">{social.description} فروش</p>
                </div>
              </Col>
            ))}
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
}

export default SocialSource
