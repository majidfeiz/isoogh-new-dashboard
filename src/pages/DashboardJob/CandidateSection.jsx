import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';

//import images
import jobs from "../../assets/images/jobs.png";
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar1 from "../../assets/images/users/avatar-1.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";

//swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "../../../node_modules/swiper/swiper.scss";


const CandidateSection = () => {
  return (
    <React.Fragment>
      <Col lg={4}>
        <Card>
          <CardBody>
            <div className="d-flex">
              <div>
                <h4 className="card-title mb-3">
                  دوستان خود را به Skote دعوت کنید
                </h4>
                <p className="text-muted">
                  اتفاقات جالب و هیجان انگیز فرصت های شغلی جذاب و مهم . با
                  دعوت کردن دوستان خود فرصت های شگفت انگیز را به انها معرفی
                  کنید
                </p>
                <div>
                  <Link to="#" className="btn btn-primary btn-sm">
                    <i className="bx bx-user-plus align-middle"></i> دعوت کردن
                    دوستان
                  </Link>
                </div>
              </div>
              <div>
                <img src={jobs} alt="" height="130" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h4 className="card-title mb-3">کاندیدای محبوب</h4>

            <Swiper
              dir='rtl'
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={50}
              slidesPerView={1}
              navigation
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
            >
              <div className="carousel-inner">
                <SwiperSlide>
                  <div
                    className="carousel-item active"
                    data-bs-interval="3000"
                  >
                    <div className="bg-light p-3 d-flex mb-3 rounded">
                      <img
                        src={avatar4}
                        alt=""
                        className="avatar-sm rounded me-3"
                      />
                      <div className="flex-grow-1">
                        <h5 className="font-size-15 mb-2">
                          <a href="candidate-overview" className="text-body">
                            همتا قربانی
                          </a>{" "}
                          <span className="badge badge-soft-info">
                            فریلنسر
                          </span>
                        </h5>
                        <p className="mb-0 text-muted">
                          <i className="bx bx-map text-body align-middle"></i>{" "}
                          ایران
                        </p>
                      </div>
                      <div>
                        <UncontrolledDropdown direction='up'>
                          <DropdownToggle
                            className="btn btn-soft-primary"
                            type="button"
                            id="dropdownMenuButton11"
                          >
                            <i className="bx bx-dots-vertical-rounded"></i>
                          </DropdownToggle>
                          <DropdownMenu aria-labelledby="dropdownMenuButton11" end={true} >
                            <li>
                              <DropdownItem href="candidate-overview">
                                دیدن جزئیات
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem href="#">دانلود CV</DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                    <div className="bg-light p-3 d-flex">
                      <img
                        src={avatar2}
                        alt=""
                        className="avatar-sm rounded me-3"
                      />
                      <div className="flex-grow-1">
                        <h5 className="font-size-15 mb-2">
                          <a href="candidate-overview" className="text-body">
                            جاوید فراهانی
                          </a>{" "}
                          <span className="badge badge-soft-success">
                            تمام وقت
                          </span>
                        </h5>
                        <p className="mb-0 text-muted">
                          <i className="bx bx-map text-body align-middle"></i>{" "}
                          ایران
                        </p>
                      </div>
                      <div>
                        <UncontrolledDropdown direction='up'>
                          <DropdownToggle
                            className="btn btn-soft-primary"
                            type="button"
                            id="dropdownMenuButton11"
                          >
                            <i className="bx bx-dots-vertical-rounded"></i>
                          </DropdownToggle>
                          <DropdownMenu aria-labelledby="dropdownMenuButton11" end={+true}>
                            <li>
                              <DropdownItem href="candidate-overview">
                                دیدن جزئیات
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem href="#">دانلود CV</DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div
                    className="carousel-item active"
                    data-bs-interval="3000"
                  >
                    <div className="bg-light p-3 d-flex mb-3 rounded">
                      <img
                        src={avatar1}
                        alt=""
                        className="avatar-sm rounded me-3"
                      />
                      <div className="flex-grow-1">
                        <h5 className="font-size-15 mb-2">
                          <a href="candidate-overview" className="text-body">
                            رعنا یوسفی زاده
                          </a>{" "}
                          <span className="badge badge-soft-warning">
                            کارآموز
                          </span>
                        </h5>
                        <p className="mb-0 text-muted">
                          <i className="bx bx-map text-body align-middle"></i>{" "}
                          ایران
                        </p>
                      </div>
                      <div>
                        <UncontrolledDropdown direction='up'>
                          <DropdownToggle
                            className="btn btn-soft-primary"
                            type="button"
                            id="dropdownMenuButton11"
                          >
                            <i className="bx bx-dots-vertical-rounded"></i>
                          </DropdownToggle>
                          <DropdownMenu aria-labelledby="dropdownMenuButton11" end={+true}>
                            <li>
                              <DropdownItem href="candidate-overview">
                                دیدن جزئیات
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem href="#">دانلود CV</DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                    <div className="bg-light p-3 d-flex">
                      <img
                        src={avatar3}
                        alt=""
                        className="avatar-sm rounded me-3"
                      />
                      <div className="flex-grow-1">
                        <h5 className="font-size-15 mb-2">
                          <a href="candidate-overview" className="text-body">
                            طاها ندیم
                          </a>{" "}
                          <span className="badge badge-soft-info">
                            فریلنسر
                          </span>
                        </h5>
                        <p className="mb-0 text-muted">
                          <i className="bx bx-map text-body align-middle"></i>{" "}
                          ایران
                        </p>
                      </div>
                      <div>
                        <UncontrolledDropdown direction='up'>
                          <DropdownToggle
                            className="btn btn-soft-primary"
                            type="button"
                            id="dropdownMenuButton11"
                          >
                            <i className="bx bx-dots-vertical-rounded"></i>
                          </DropdownToggle>
                          <DropdownMenu aria-labelledby="dropdownMenuButton11" end={+true}>
                            <li>
                              <DropdownItem href="candidate-overview">
                                دیدن جزئیات
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem href="#">دانلود CV</DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div
                    className="carousel-item active"
                    data-bs-interval="3000"
                  >
                    <div className="bg-light p-3 d-flex mb-3 rounded">
                      <img
                        src={avatar4}
                        alt=""
                        className="avatar-sm rounded me-3"
                      />
                      <div className="flex-grow-1">
                        <h5 className="font-size-15 mb-2">
                          <a href="candidate-overview" className="text-body">
                            الناز عبدی
                          </a>{" "}
                          <span className="badge badge-soft-success">
                            تایمر کامل
                          </span>
                        </h5>
                        <p className="mb-0 text-muted">
                          <i className="bx bx-map text-body align-middle"></i>{" "}
                          ایران
                        </p>
                      </div>
                      <div>
                        <UncontrolledDropdown direction='up'>
                          <DropdownToggle
                            className="btn btn-soft-primary"
                            type="button"
                            id="dropdownMenuButton11"
                          >
                            <i className="bx bx-dots-vertical-rounded"></i>
                          </DropdownToggle>
                          <DropdownMenu aria-labelledby="dropdownMenuButton11" end={+true}>
                            <li>
                              <DropdownItem href="candidate-overview">
                                دیدن جزئیات
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem href="#">دانلود CV</DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                    <div className="bg-light p-3 d-flex">
                      <img
                        src={avatar2}
                        alt=""
                        className="avatar-sm rounded me-3"
                      />
                      <div className="flex-grow-1">
                        <h5 className="font-size-15 mb-2">
                          <a href="candidate-overview" className="text-body">
                            امیر تهرانی
                          </a>{" "}
                          <span className="badge badge-soft-danger">
                            پاره وقت
                          </span>
                        </h5>
                        <p className="mb-0 text-muted">
                          <i className="bx bx-map text-body align-middle"></i>{" "}
                          ایران
                        </p>
                      </div>
                      <div>
                        <UncontrolledDropdown direction='up'>
                          <DropdownToggle
                            className="btn btn-soft-primary"
                            type="button"
                            id="dropdownMenuButton11"
                          >
                            <i className="bx bx-dots-vertical-rounded"></i>
                          </DropdownToggle>
                          <DropdownMenu aria-labelledby="dropdownMenuButton11" end={+true}>
                            <li>
                              <DropdownItem href="candidate-overview">
                                دیدن جزئیات
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem href="#">دانلود CV</DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              </div>
            </Swiper>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
}

export default CandidateSection;