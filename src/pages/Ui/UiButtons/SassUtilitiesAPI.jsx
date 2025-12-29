import React from "react";
import { Card, CardBody, Col, Row } from "reactstrap";

const SassUtilitiesAPI = () => {
    return (
      <React.Fragment>
        <Row>
          <Col xl={12}>
            <Card>
              <CardBody>
                <h4 className="card-title">Sass utilities API</h4>
                <p className="card-title-desc">
                  علاوه بر <code>.focus ring</code>، چندین ابزار{" "}
                  <code>.focus ring *</code> برای اصلاح پیش‌فرض‌های کلاس کمکی
                  داریم. رنگ را با هر یک از{" "}
                  <a href="https://getbootstrap.com/docs/5.3/customize/color/#theme colors">
                    رنگ‌های تم
                  </a>{" "}
                  ما تغییر دهید. توجه داشته باشید که با توجه به پشتیبانی از حالت
                  رنگ فعلی، انواع روشن و تیره ممکن است در همه رنگ‌های پس‌زمینه
                  قابل مشاهده نباشند
                </p>
                <Row>
                  <Col xl={6}>
                    <p>
                      <a
                        href="#!"
                        className="d-inline-flex focus-ring focus-ring-primary py-1 px-2 text-decoration-none border rounded-2"
                      >
                        فوکوس اصلی
                      </a>
                    </p>
                    <p>
                      <a
                        href="#!"
                        className="d-inline-flex focus-ring focus-ring-secondary py-1 px-2 text-decoration-none border rounded-2"
                      >
                        فوکوس ثانویه
                      </a>
                    </p>
                    <p>
                      <a
                        href="#!"
                        className="d-inline-flex focus-ring focus-ring-success py-1 px-2 text-decoration-none border rounded-2"
                      >
                        فوکوس موفقیت
                      </a>
                    </p>
                    <p>
                      <a
                        href="#!"
                        className="d-inline-flex focus-ring focus-ring-danger py-1 px-2 text-decoration-none border rounded-2"
                      >
                        فوکوس خطر
                      </a>
                    </p>
                  </Col>
                  <Col xl={6}>
                    <p>
                      <a
                        href="#!"
                        className="d-inline-flex focus-ring focus-ring-warning py-1 px-2 text-decoration-none border rounded-2"
                      >
                        فوکوس هشدار
                      </a>
                    </p>
                    <p>
                      <a
                        href="#!"
                        className="d-inline-flex focus-ring focus-ring-info py-1 px-2 text-decoration-none border rounded-2"
                      >
                        فوکوس اطلاعات
                      </a>
                    </p>
                    <p>
                      <a
                        href="#!"
                        className="d-inline-flex focus-ring focus-ring-light py-1 px-2 text-decoration-none border rounded-2"
                      >
                        فوکوس روشن
                      </a>
                    </p>
                    <p>
                      <a
                        href="#!"
                        className="d-inline-flex focus-ring focus-ring-dark py-1 px-2 text-decoration-none border rounded-2"
                      >
                        فوکوس تاریک
                      </a>
                    </p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default SassUtilitiesAPI;