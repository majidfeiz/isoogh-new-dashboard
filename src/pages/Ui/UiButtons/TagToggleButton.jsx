import React from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardBody, CardTitle, Col, Row } from "reactstrap";

const TagToggleButton = () => {
    return (
      <React.Fragment>
        <Row>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>برچسب های دکمه</CardTitle>
                <p className="card-title-desc">
                  <code className="highlighter rouge">.btn</code>
                  کلاس ها برای استفاده با طراحی شده اند
                  <code className="highlighter rouge">&lt;button&gt;</code> عنصر
                  با این حال، می توانید از این کلاس ها در نیز استفاده کنید
                  <code className="highlighter rouge">
                    &lt;لینک&gt;
                  </code> یا{" "}
                  <code className="highlighter rouge">&lt;input&gt;</code> عناصر
                  (اگرچه برخی از مرورگرها ممکن است کمی متفاوت اعمال شوند تفسیر)
                </p>

                <div className="d-flex flex-wrap gap-2">
                  <Link className="btn btn-primary " to="#" role="button">
                    لینک
                  </Link>
                  <Button
                    color="success"
                    className="btn btn-success "
                    type="submit"
                  >
                    دکمه
                  </Button>
                  <input className="btn btn-info" type="button" value="Input" />
                  <input
                    className="btn btn-danger"
                    type="submit"
                    value="Submit"
                  />
                  <input
                    className="btn btn-warning"
                    type="reset"
                    value="Reset"
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>تغییر وضعیت</CardTitle>
                <p className="card-title-desc">
                  افزودن{" "}
                  <code className="highlighter-rouge">
                    data-toggle=&quot;button&ldquo;
                  </code>
                  برای تغییر دادن یک دکمه{" "}
                  <code className="highlighter rouge">فعال</code>
                  حالت. اگر از قبل دکمه ای را تغییر می دهید، باید به صورت دستی
                  آن را اضافه کنید کلاس{" "}
                  <code className="highlighter rouge">.active</code>
                  <strong>و</strong>{" "}
                  <code className="highlighter rouge">
                    aria pressed=&quot;درست&ldquo;
                  </code>{" "}
                  به
                  <code className="highlighter rouge">&lt;button&gt;</code>
                </p>

                <div className="d-flex flex-wrap gap-2">
                  <Button
                    color="primary"
                    className="btn btn-primary "
                    data-toggle="button"
                    aria-pressed="false"
                  >
                    تک وضعیت
                  </Button>
                  <Button type="button" color="primary" className="active">
                    دکمه جابجایی فعال
                  </Button>
                  <Button type="button" color="primary" disabled>
                    دکمه جابجایی غیرفعال شد
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default TagToggleButton;