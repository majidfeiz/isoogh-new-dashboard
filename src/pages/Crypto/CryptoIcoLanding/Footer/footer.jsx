import React from "react"
import { Container, Row, Col } from "reactstrap"
import { Link } from "react-router-dom"

//Import Components
import FooterLink from "./footer-link"

const Features = () => {
  const footerLinks = [
    {
      title: "شرکت",
      links: [
        { title: "درباره ما", link: "#" },
        { title: "امکانات", link: "#" },
        { title: "تیم", link: "#" },
        { title: "خبر ها", link: "#" },
        { title: "سوالات متداول", link: "#" },
      ],
    },
    {
      title: "منابع",
      links: [
        { title: "کاغذ سفید", link: "#" },
        { title: "فروش توکن", link: "#" },
        { title: "سیاست حفظ حریم خصوصی", link: "#" },
        { title: "نیم و مقررات", link: "#" },
      ],
    },
    {
      title: "لینک ها",
      links: [
        { title: "توکن ها", link: "#" },
        { title: "نقشه راه", link: "#" },
        { title: "سوالات متداول", link: "#" },
      ],
    },
  ];

  return (
    <React.Fragment>
      <footer className="landing-footer">
        <Container>
          <Row>
            {footerLinks.map((footerLink, key) => (
              <Col lg="3" sm="6" key={key}>
                <div className="mb-4 mb-lg-0">
                  <h5 className="mb-3 footer-list-title">{footerLink.title}</h5>
                  <ul className="list-unstyled footer-list-menu">
                    {footerLink.links.map((Flink, key) => (
                      <li key={key}>
                        <Link to={Flink.link}>{Flink.title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>
            ))}

            <Col lg="3" sm="6">
              <div className="mb-4 mb-lg-0">
                <h5 className="mb-3 footer-list-title">آخرین خبر ها</h5>
                <div className="blog-post">
                  <Link to="#" className="post">
                    <div className="badge badge-soft-success font-size-11 mb-3">
                      ارز دیجیتال
                    </div>
                    <h5 className="post-title">
                      افزایش قیمت ارز های دیجیتال در این هفته
                    </h5>
                    <p className="mb-0">
                      <i className="bx bx-calendar me-1" /> 04 آبان, 1402
                    </p>
                  </Link>
                  <Link to="#" className="post">
                    <div className="badge badge-soft-success font-size-11 mb-3">
                      ارز دیجیتال
                    </div>
                    <h5 className="post-title">امکانات کیف پول خود را بروز کنید</h5>
                    <p className="mb-0">
                      <i className="bx bx-calendar me-1" /> 12 آبان, 1402
                    </p>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>

          <hr className="footer-border my-5" />

          <FooterLink />
        </Container>
      </footer>
    </React.Fragment>
  );
}

export default Features
