import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col, Row } from 'reactstrap';

//import images
import img1 from "../../../assets/images/companies/img-1.png";
import img4 from "../../../assets/images/companies/img-4.png";
import img5 from "../../../assets/images/companies/img-5.png";
import avatar1 from "../../../assets/images/users/avatar-1.jpg";
import avatar2 from "../../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../../assets/images/users/avatar-5.jpg";

const AboutUs = () => {
    return (
      <React.Fragment>
        <Col lg={9}>
          <Card>
            <CardBody>
              <h5 className="mb-3">درباره ما</h5>
              <p className="text-muted">
                بسیار خوب فکر شده و ارتباطات مفصل. نقاط عطف، ضرب الاجل ها و کار
                سریع را مشخص کنید. صبر. صبر بی نهایت بدون میانبر حتی اگر مشتری
                بی توجه باشد. چند نمونه متن کوتاه برای ساخت بر روی عنوان کارت و
                حجم دادن به محتوای کارت Moltin پلتفرمی را در اختیار شما قرار می
                دهد
              </p>
              <p className="text-muted mb-4">
                به عنوان توسعه محصول بسیار ماهر و موفق و متخصص طراحی با بیش از 4
                سال تجربه من دروغ است در مفهوم سازی، طراحی و اصلاح موفق محصولات
                مصرفی مخصوص طراحی داخلی و خانه اثاثیه
              </p>

              <h5 className="mb-3">تحصیلات</h5>
              <ul className="verti-timeline list-unstyled">
                <li className="event-list">
                  <div className="event-timeline-dot">
                    <i className="bx bx-left-arrow-circle"></i>
                  </div>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <div>
                        <h6 className="font-size-14 mb-1">
                          BCA - لیسانس برنامه های کاربردی کامپیوتر
                        </h6>
                        <p className="text-muted">
                          دانشگاه بین المللی - (1401-1402)
                        </p>

                        <p className="text-muted mb-0">
                          انواع مختلفی از معابر موجود وجود دارد، اما اکثریت
                          تغییر به نوعی. به عنوان یک بسیار توسعه و طراحی محصول
                          ماهر و موفق متخصص با بیش از 4 سال تجربه من
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="event-list">
                  <div className="event-timeline-dot">
                    <i className="bx bx-left-arrow-circle"></i>
                  </div>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <div>
                        <h6 className="font-size-14 mb-1">
                          MCA - کارشناسی ارشد برنامه های کامپیوتری
                        </h6>
                        <p className="text-muted">
                          دانشگاه بین المللی (1400 1401)
                        </p>

                        <p className="text-muted mb-0">
                          انواع مختلفی از معابر موجود وجود دارد، اما اکثریت
                          تغییر به نوعی. به عنوان یک بسیار توسعه و طراحی محصول
                          ماهر و موفق متخصص با بیش از 4 سال تجربه من
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="event-list">
                  <div className="event-timeline-dot">
                    <i className="bx bx-left-arrow-circle"></i>
                  </div>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <div>
                        <h6 className="font-size-14 mb-1">
                          طراحی ارتباط تصویری
                        </h6>
                        <p className="text-muted">
                          دانشگاه بین المللی - (1399-1400)
                        </p>

                        <p className="text-muted mb-0">
                          انواع مختلفی از معابر موجود وجود دارد، اما اکثریت
                          تغییر به نوعی. به عنوان یک بسیار توسعه و طراحی محصول
                          ماهر و موفق متخصص با بیش از 4 سال تجربه من
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </CardBody>
          </Card>
          <Row>
            <Col lg={12}>
              <h5 className="mb-3">پروؤه ها</h5>
            </Col>
            <Col xl={4}>
              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-4">
                      <div className="avatar-md">
                        <span className="avatar-title rounded-circle bg-light text-danger font-size-16">
                          <img src={img1} alt="" height="30" />
                        </span>
                      </div>
                    </div>

                    <div className="flex-grow-1 overflow-hidden">
                      <h5 className="text-truncate font-size-15">
                        <Link to="#" className="text-dark">
                          طراحی ادمین جدید
                        </Link>
                      </h5>
                      <p className="text-muted mb-4">
                        به سادگی Occidental خواهد بود
                      </p>
                      <div className="avatar-group">
                        <div className="avatar-group-item">
                          <Link to="#" className="d-inline-block">
                            <img
                              src={avatar4}
                              alt=""
                              className="rounded-circle avatar-xs"
                            />
                          </Link>
                        </div>
                        <div className="avatar-group-item">
                          <Link to="#" className="d-inline-block">
                            <img
                              src={avatar5}
                              alt=""
                              className="rounded-circle avatar-xs"
                            />
                          </Link>
                        </div>
                        <div className="avatar-group-item">
                          <Link to="#" className="d-inline-block">
                            <div className="avatar-xs">
                              <span className="avatar-title rounded-circle bg-success text-white font-size-16">
                                A
                              </span>
                            </div>
                          </Link>
                        </div>
                        <div className="avatar-group-item">
                          <Link to="#" className="d-inline-block">
                            <img
                              src={avatar2}
                              alt=""
                              className="rounded-circle avatar-xs"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
                <div className="px-4 py-3 border-top">
                  <ul className="list-inline mb-0">
                    <li className="list-inline-item me-3">
                      <span className="badge bg-success">تکمیل شده</span>
                    </li>{" "}
                    <li className="list-inline-item me-3">
                      <i className="bx bx-calendar me-1"></i> 15 مهر, 22
                    </li>{" "}
                    <li className="list-inline-item me-3">
                      <i className="bx bx-comment-dots me-1"></i> 214
                    </li>
                  </ul>
                </div>
              </Card>
            </Col>
            <Col xl={4}>
              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-4">
                      <div className="avatar-md">
                        <span className="avatar-title rounded-circle bg-light text-danger font-size-16">
                          <img src={img4} alt="" height="30" />
                        </span>
                      </div>
                    </div>

                    <div className="flex-grow-1 overflow-hidden">
                      <h5 className="text-truncate font-size-15">
                        <Link to="#" className="text-dark">
                          رابط کاربری لندینگ برنامه
                        </Link>
                      </h5>
                      <p className="text-muted mb-4">
                        برای رسیدن به آن ضروری خواهد بود
                      </p>
                      <div className="avatar-group">
                        <div className="avatar-group-item">
                          <Link to="#" className="d-inline-block">
                            <div className="avatar-xs">
                              <span className="avatar-title rounded-circle bg-pink text-white font-size-16">
                                L
                              </span>
                            </div>
                          </Link>
                        </div>
                        <div className="avatar-group-item">
                          <Link to="#" className="d-inline-block">
                            <img
                              src={avatar2}
                              alt=""
                              className="rounded-circle avatar-xs"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
                <div className="px-4 py-3 border-top">
                  <ul className="list-inline mb-0">
                    <li className="list-inline-item me-3">
                      <span className="badge bg-success">تکمیل شده</span>
                    </li>{" "}
                    <li className="list-inline-item me-3">
                      <i className="bx bx-calendar me-1"></i> 11 آبان, 22
                    </li>{" "}
                    <li className="list-inline-item me-3">
                      <i className="bx bx-comment-dots me-1"></i> 185
                    </li>
                  </ul>
                </div>
              </Card>
            </Col>
            <Col xl={4}>
              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-4">
                      <div className="avatar-md">
                        <span className="avatar-title rounded-circle bg-light text-danger font-size-16">
                          <img src={img5} alt="" height="30" />
                        </span>
                      </div>
                    </div>

                    <div className="flex-grow-1 overflow-hidden">
                      <h5 className="text-truncate font-size-15">
                        <Link to="#" className="text-dark">
                          رابط کاربری داشبورد Skote
                        </Link>
                      </h5>
                      <p className="text-muted mb-4">وجود مجزا یک افسانه است</p>
                      <div className="avatar-group">
                        <div className="avatar-group-item">
                          <Link to="#" className="d-inline-block">
                            <img
                              src={avatar1}
                              alt=""
                              className="rounded-circle avatar-xs"
                            />
                          </Link>
                        </div>
                        <div className="avatar-group-item">
                          <Link to="#" className="d-inline-block">
                            <img
                              src={avatar3}
                              alt=""
                              className="rounded-circle avatar-xs"
                            />
                          </Link>
                        </div>
                        <div className="avatar-group-item">
                          <Link to="#" className="d-inline-block">
                            <div className="avatar-xs">
                              <span className="avatar-title rounded-circle bg-danger text-white font-size-16">
                                3+
                              </span>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
                <div className="px-4 py-3 border-top">
                  <ul className="list-inline mb-0">
                    <li className="list-inline-item me-3">
                      <span className="badge bg-success">تکمیل شده</span>
                    </li>{" "}
                    <li className="list-inline-item me-3">
                      <i className="bx bx-calendar me-1"></i> 13 آذر, 22
                    </li>{" "}
                    <li className="list-inline-item me-3">
                      <i className="bx bx-comment-dots me-1"></i> 194
                    </li>
                  </ul>
                </div>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody className="border-bottom">
                  <h5 className="mb-3">رسانه های اجتماعی</h5>
                  <div className="hstack gap-2">
                    <Link to="#!" className="btn btn-soft-primary">
                      <i className="bx bxl-facebook align-middle me-1"></i>{" "}
                      Facebook{" "}
                    </Link>
                    <Link to="#!" className="btn btn-soft-info">
                      <i className="bx bxl-twitter align-middle me-1"></i>{" "}
                      توییتر
                    </Link>
                    <Link to="#!" className="btn btn-soft-pink">
                      <i className="bx bxl-instagram align-middle me-1"></i>{" "}
                      اینستاگرام
                    </Link>
                    <Link to="#!" className="btn btn-soft-success">
                      <i className="bx bxl-whatsapp align-middle me-1"></i>{" "}
                      واتساب
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </React.Fragment>
    );
}

export default AboutUs;