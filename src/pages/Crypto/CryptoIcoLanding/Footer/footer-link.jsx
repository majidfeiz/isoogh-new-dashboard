import React from "react"
import { Row, Col } from "reactstrap"

//Import Images
import logolight from "../../../../assets/images/logo-light.png"

const FooterLink = () => {
  return (
    <React.Fragment>
      <Row>
        <Col lg="6">
          <div className="mb-4">
            <img src={logolight} alt="" height="20" />
          </div>

          <p className="mb-2">
            {new Date().getFullYear()} © اسکات. طراحی و توسعه توسط فاطمه کاظمی زاده
          </p>
          <p>
            در واقع به همان سادگی غربی خواهد بود، برای یک انگلیسی خواهد بود به
            نظر می رسد به عنوان یک فرد شکاک، انگلیسی ساده شده است
          </p>
        </Col>
      </Row>
    </React.Fragment>
  );
}

export default FooterLink
