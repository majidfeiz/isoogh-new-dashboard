import React, { useState } from "react"
import { Container, Row, Col } from "reactstrap"

//swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "../../../../../node_modules/swiper/swiper.scss";

const RoadMap = () => {

  return (
    <React.Fragment>
      <section className="section bg-white" id="roadmap">
        <Container>
          <Row>
            <Col lg="12">
              <div className="text-center mb-5">
                <div className="small-title">خط زمانی</div>
                <h4>نقشه راه ما</h4>
              </div>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col lg="12">
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
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  modules={[Pagination, Navigation, Autoplay]}
                  className="owl-carousel owl-theme events navs-carousel"
                  id="timeline-carousel"
                >
                  <SwiperSlide className="item event-list">
                    <div>
                      <div className="event-date">
                        <div className="text-primary mb-1">دسامبر 1402</div>
                        <h5 className="mb-4">ایده پلتفرم ICO</h5>
                      </div>
                      <div className="event-down-icon">
                        <i className="bx bx-down-arrow-circle h1 text-primary down-arrow-icon"></i>
                      </div>

                      <div className="mt-3 px-3">
                        <p className="text-muted">
                          در واقع شما ایده های فوق العاده ای را در اینجا خواهید
                          یافت
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide className="item event-list">
                    <div>
                      <div className="event-date">
                        <div className="text-primary mb-1">آبان, 1402</div>
                        <h5 className="mb-4">تحقیق در مورد پروژه</h5>
                      </div>
                      <div className="event-down-icon">
                        <i className="bx bx-down-arrow-circle h1 text-primary down-arrow-icon"></i>
                      </div>

                      <div className="mt-3 px-3">
                        <p className="text-muted">
                          تمامی پروژه ها مورد نقد و بررسی کارشناسان قرار میگیرند
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide className="item event-list active">
                    <div>
                      <div className="event-date">
                        <div className="text-primary mb-1">آذر , 1402</div>
                        <h5 className="mb-4">طراحی ICO و توکن</h5>
                      </div>
                      <div className="event-down-icon">
                        <i className="bx bx-down-arrow-circle h1 text-primary down-arrow-icon"></i>
                      </div>

                      <div className="mt-3 px-3">
                        <p className="text-muted">
                          تیم طراحی و تولید ما بهترین ها هستند
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide className="item event-list">
                    <div>
                      <div className="event-date">
                        <div className="text-primary mb-1">آذر, 1402</div>
                        <h5 className="mb-4">پلتفرم راه اندازی ICO</h5>
                      </div>
                      <div className="event-down-icon">
                        <i className="bx bx-down-arrow-circle h1 text-primary down-arrow-icon"></i>
                      </div>

                      <div className="mt-3 px-3">
                        <p className="text-muted">
                          زبان مشترک جدید ساده تر از موجود خواهد بود
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide className="item event-list">
                    <div>
                      <div className="event-date">
                        <div className="text-primary mb-1">دی, 1402</div>
                        <h5 className="mb-4">فروش توکن دور 1</h5>
                      </div>
                      <div className="event-down-icon">
                        <i className="bx bx-down-arrow-circle h1 text-primary down-arrow-icon"></i>
                      </div>

                      <div className="mt-3 px-3">
                        <p className="text-muted">
                          در واقع به همان سادگی غربی خواهد بود 
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide className="item event-list">
                    <div>
                      <div className="event-date">
                        <div className="text-primary mb-1">دی, 1402</div>
                        <h5 className="mb-4">فروش توکن دور 2</h5>
                      </div>
                      <div className="event-down-icon">
                        <i className="bx bx-down-arrow-circle h1 text-primary down-arrow-icon"></i>
                      </div>

                      <div className="mt-3 px-3">
                        <p className="text-muted">
                          ساده ترین راه برای فروش توکن ها پلتفرم  ماست
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                </Swiper>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </React.Fragment>
  );
}

export default RoadMap
