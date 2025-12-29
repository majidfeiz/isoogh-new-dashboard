import React from "react"
import { Row, Col, Card, CardBody, CardTitle } from "reactstrap"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

//swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from "swiper/modules";
import "../../../node_modules/swiper/swiper.scss";

const PagesTimeline = () => { 
  const statuses = [
    {
      id: 1,
      stausTitle: "سفارش داده شده",
      iconClass: "bx-copy-alt",
      description: "زبان مشترک جدید ساده تر و منظم تر از زبان موجود خواهد بود",
    },
    {
      id: 2,
      stausTitle: "بسته بندی شده",
      iconClass: "bx-package",
      description: "برای رسیدن به این هدف، داشتن دستور زبان یکسان ضروری است",
    },
    {
      id: 3,
      stausTitle: "ارسال شد",
      iconClass: "bx-car",
      description: "در واقع به همان سادگی Occidental خواهد بود",
    },
    {
      id: 4,
      stausTitle: "تحویل داده شده",
      iconClass: "bx-badge-check",
      description: "برای یک فرد انگلیسی، به نظر می رسد انگلیسی ساده شده است",
    },
  ];

  //meta title
  document.title = "Timeline | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="ابزارهای مفید" breadcrumbItem="جدول زمانی" />

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">جدول زمانی افقی</CardTitle>

                  <div className="hori-timeline">
                    <Swiper
                      slidesPerView={1}
                      // spaceBetween={10}
                      navigation
                      pagination={{
                        clickable: true,
                      }}
                      breakpoints={{
                        678: {
                          slidesPerView: 2,
                        },
                        992: {
                          slidesPerView: 3,
                        },
                        1400: {
                          slidesPerView: 4,
                        },
                      }}
                      loop={true}
                      modules={[Pagination, Navigation]}
                      className="owl-carousel owl-theme  navs-carousel events"
                      id="timeline-carousel"
                    >
                      <SwiperSlide
                        className="item event-list"
                        style={{ display: "inline-table" }}
                      >
                        <div>
                          <div className="event-date">
                            <div className="text-primary mb-1">12 فروردین</div>
                            <h5 className="mb-4">اولین رویداد</h5>
                          </div>
                          <div className="event-down-icon">
                            <i className="bx bx-down-arrow-circle h1 text-primary down-arrow-icon" />
                          </div>

                          <div className="mt-3 px-3">
                            <p className="text-muted">
                              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                              صنعت چاپ و با استفاده از طراحان گرافیک است
                            </p>
                          </div>
                        </div>
                      </SwiperSlide>

                      <SwiperSlide
                        className="item event-list"
                        style={{ display: "inline-table" }}
                      >
                        <div>
                          <div className="event-date">
                            <div className="text-primary mb-1">06 مهر</div>
                            <h5 className="mb-4">دومین رویداد</h5>
                          </div>
                          <div className="event-down-icon">
                            <i className="bx bx-down-arrow-circle h1 text-primary down-arrow-icon" />
                          </div>

                          <div className="mt-3 px-3">
                            <p className="text-muted">
                              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                              صنعت چاپ و با استفاده از طراحان گرافیک است
                            </p>
                          </div>
                        </div>
                      </SwiperSlide>

                      <SwiperSlide
                        className="item event-list active"
                        style={{ display: "inline-table" }}
                      >
                        <div>
                          <div className="event-date">
                            <div className="text-primary mb-1">25 آبان</div>
                            <h5 className="mb-4">سومین رویداد</h5>
                          </div>
                          <div className="event-down-icon">
                            <i className="bx bx-down-arrow-circle h1 text-primary down-arrow-icon" />
                          </div>

                          <div className="mt-3 px-3">
                            <p className="text-muted">
                              Fلورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                              صنعت چاپ و با استفاده از طراحان گرافیک است
                            </p>
                          </div>
                        </div>
                      </SwiperSlide>

                      <SwiperSlide
                        className="item event-list active"
                        style={{ display: "inline-table" }}
                      >
                        <div>
                          <div className="event-date">
                            <div className="text-primary mb-1">04 آذر</div>
                            <h5 className="mb-4">چهارمین رویداد</h5>
                          </div>
                          <div className="event-down-icon">
                            <i className="bx bx-down-arrow-circle h1 text-primary down-arrow-icon" />
                          </div>

                          <div className="mt-3 px-3">
                            <p className="text-muted">
                              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                              صنعت چاپ و با استفاده از طراحان گرافیک است
                            </p>
                          </div>
                        </div>
                      </SwiperSlide>

                      <SwiperSlide
                        className="item event-list"
                        style={{ display: "inline-table" }}
                      >
                        <div>
                          <div className="event-date">
                            <div className="text-primary mb-1">19 دی</div>
                            <h5 className="mb-4">ششمین رویداد</h5>
                          </div>
                          <div className="event-down-icon">
                            <i className="bx bx-down-arrow-circle h1 text-primary down-arrow-icon" />
                          </div>

                          <div className="mt-3 px-3">
                            <p className="text-muted">
                              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                              صنعت چاپ و با استفاده از طراحان گرافیک است
                            </p>
                          </div>
                        </div>
                      </SwiperSlide>

                      <SwiperSlide
                        className="item event-list"
                        style={{ display: "inline-table" }}
                      >
                        <div>
                          <div className="event-date">
                            <div className="text-primary mb-1">21 بهمن</div>
                            <h5 className="mb-4">هفتمین رویداد</h5>
                          </div>
                          <div className="event-down-icon">
                            <i className="bx bx-down-arrow-circle h1 text-primary down-arrow-icon" />
                          </div>

                          <div className="mt-3 px-3">
                            <p className="text-muted">
                              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                              صنعت چاپ و با استفاده از طراحان گرافیک است
                            </p>
                          </div>
                        </div>
                      </SwiperSlide>
                    </Swiper>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <CardTitle className="mb-5">جدول زمانی عمودی</CardTitle>
                  <div>
                    <ul className="verti-timeline list-unstyled">
                      {/* Render Horizontal Timeline Events */}
                      {statuses.map((status, key) => (
                        <li key={key} className="event-list">
                          <div className="event-timeline-dot">
                            <i
                              className={
                                status.id === 3
                                  ? "bx bx-left-arrow-circle bx-fade-right"
                                  : "bx bx-left-arrow-circle"
                              }
                            />
                          </div>
                          <div className="d-flex">
                            <div className="me-3">
                              <i
                                className={
                                  "bx " + status.iconClass + " h2 text-primary"
                                }
                              />
                            </div>
                            <div className="flex-grow-1">
                              <div>
                                <h5>{status.stausTitle}</h5>
                                <p className="text-muted">
                                  {status.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
}

export default PagesTimeline
