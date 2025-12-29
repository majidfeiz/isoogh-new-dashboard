import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  Card,
  Col,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap"

import classnames from "classnames"

//import images
import small from "../../../assets/images/small/img-2.jpg"
import small2 from "../../../assets/images/small/img-6.jpg"

const BlogList = () => {
  const [activeTab, toggleTab] = useState("1");

  return (
    <React.Fragment>
      <Col xl={9} lg={8}>
        <Card>
          <ul
            className="nav nav-tabs nav-tabs-custom justify-content-center pt-2"
            role="tablist"
          >
            <NavItem>
              <NavLink
                to="#"
                className={classnames({
                  active: activeTab === "1",
                })}
                onClick={() => {
                  toggleTab("1");
                }}
              >
                همه پست ها
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                to="#"
                className={classnames({
                  active: activeTab === "2",
                })}
                onClick={() => {
                  toggleTab("2");
                }}
              >
                بایگانی
              </NavLink>
            </NavItem>
          </ul>

          <TabContent className="p-4" activeTab={activeTab}>
            <TabPane tabId="1">
              <div>
                <Row className="justify-content-center">
                  <Col xl={8}>
                    <div>
                      <Row className="align-items-center">
                        <Col xs={4}>
                          <div>
                            <h5 className="mb-0">شبکه وبلاگ</h5>
                          </div>
                        </Col>

                        <Col xs={8}>
                          <div className="float-end">
                            <ul className="nav nav-pills">
                              <NavItem>
                                <NavLink
                                  className="disabled"
                                  to="#"
                                  tabIndex="-1"
                                >
                                  نوع مشاهده :
                                </NavLink>
                              </NavItem>
                              <NavItem>
                                <Link
                                  className="nav-link active"
                                  to="/blog-list"
                                >
                                  <i className="mdi mdi-format-list-bulleted"></i>
                                </Link>
                              </NavItem>
                              <NavItem>
                                <Link to="/blog-grid" className="nav-link">
                                  <i className="mdi mdi-view-grid-outline"></i>
                                </Link>
                              </NavItem>
                            </ul>
                          </div>
                        </Col>
                      </Row>

                      <hr className="mb-4" />

                      <div>
                        <h5>
                          <Link to="/blog-details" className="text-dark">
                            روز زیبا با دوستان
                          </Link>
                        </h5>
                        <p className="text-muted">10 فروردین, 1402</p>

                        <div className="position-relative mb-3">
                          <img src={small} alt="" className="img-thumbnail" />
                        </div>

                        <ul className="list-inline">
                          <li className="list-inline-item mr-3">
                            <Link to="#" className="text-muted">
                              <i className="bx bx-purchase-tag-alt align-middle text-muted me-1"></i>{" "}
                              پروژه ها
                            </Link>
                          </li>
                          <li className="list-inline-item mr-3">
                            <Link to="#" className="text-muted">
                              <i className="bx bx-comment-dots align-middle text-muted me-1"></i>{" "}
                              12 نظرات
                            </Link>
                          </li>
                        </ul>
                        <p>
                          لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                          چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون
                          بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و
                          برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع
                          با هدف بهبود ابزارهای کاربردی می باشد
                        </p>

                        <div>
                          <Link to="#" className="text-primary">
                            ادامه مطلب<i className="mdi mdi-arrow-left"></i>
                          </Link>
                        </div>
                      </div>

                      <hr className="my-5" />

                      <div>
                        <h5>
                          <Link to="/blog-details" className="text-dark">
                            بحث گروهی درباره پروژه
                          </Link>
                        </h5>
                        <p className="text-muted">24 مهر, 1402</p>

                        <div className="position-relative mb-3">
                          <img src={small2} alt="" className="img-thumbnail" />

                          <div className="blog-play-icon">
                            <Link to="#" className="avatar-sm d-block mx-auto">
                              <span className="avatar-title rounded-circle font-size-18">
                                <i className="mdi mdi-play"></i>
                              </span>
                            </Link>
                          </div>
                        </div>

                        <ul className="list-inline">
                          <li className="list-inline-item mr-3">
                            <Link to="#" className="text-muted">
                              <i className="bx bx-purchase-tag-alt align-middle text-muted ms-1"></i>{" "}
                              توسعه
                            </Link>
                          </li>
                          <li className="list-inline-item mr-3">
                            <Link to="#" className="text-muted">
                              <i className="bx bx-comment-dots align-middle text-muted ms-1"></i>{" "}
                              08 نظرات
                            </Link>
                          </li>
                        </ul>

                        <p>
                          لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                          چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون
                          بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و
                          برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع
                          با هدف بهبود ابزارهای کاربردی می باشد
                        </p>

                        <div>
                          <Link to="#" className="text-primary">
                            ادامه مطلب<i className="mdi mdi-arrow-left"></i>
                          </Link>
                        </div>
                      </div>

                      <hr className="my-5" />

                      <div className="text-center">
                        <ul className="pagination justify-content-center pagination-rounded">
                          <li className="page-item disabled">
                            <Link to="#" className="page-link">
                              <i className="mdi mdi-chevron-left"></i>
                            </Link>
                          </li>
                          <li className="page-item">
                            <Link to="#" className="page-link">
                              1
                            </Link>
                          </li>
                          <li className="page-item active">
                            <Link to="#" className="page-link">
                              2
                            </Link>
                          </li>
                          <li className="page-item">
                            <Link to="#" className="page-link">
                              3
                            </Link>
                          </li>
                          <li className="page-item">
                            <Link to="#" className="page-link">
                              ...
                            </Link>
                          </li>
                          <li className="page-item">
                            <Link to="#" className="page-link">
                              10
                            </Link>
                          </li>
                          <li className="page-item">
                            <Link to="#" className="page-link">
                              <i className="mdi mdi-chevron-right"></i>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </TabPane>

            <TabPane tabId="2">
              <div>
                <Row className="justify-content-center">
                  <Col xl={8}>
                    <h5>بایگانی</h5>

                    <div className="mt-5">
                      <div className="d-flex flex-wrap">
                        <div className="me-2">
                          <h4>1402</h4>
                        </div>
                        <div className="ms-auto">
                          <span className="badge badge-soft-success rounded-pill float-end ms-1 font-size-12">
                            03
                          </span>
                        </div>
                      </div>
                      <hr className="mt-2" />

                      <div className="list-group list-group-flush">
                        <Link
                          to="/blog-details"
                          className="list-group-item text-muted"
                        >
                          <i className="mdi mdi-circle-medium me-1"></i> روز
                          زیبا با دوستان
                        </Link>

                        <Link
                          to="/blog-details"
                          className="list-group-item text-muted"
                        >
                          <i className="mdi mdi-circle-medium me-1"></i> کشیدن
                          طرح
                        </Link>

                        <Link
                          to="/blog-details"
                          className="list-group-item text-muted"
                        >
                          <i className="mdi mdi-circle-medium me-1"></i> بحث
                          گروهی درباره پروژه
                        </Link>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="d-flex flex-wrap">
                        <div className="me-2">
                          <h4>1402</h4>
                        </div>
                        <div className="ms-auto">
                          <span className="badge badge-soft-success badge-pill float-right ms-1 font-size-12">
                            06
                          </span>
                        </div>
                      </div>
                      <hr className="mt-2" />

                      <div className="list-group list-group-flush">
                        <Link
                          to="/blog-details"
                          className="list-group-item text-muted"
                        >
                          <i className="mdi mdi-circle-medium me-1"></i> قهوه با
                          دوستان
                        </Link>

                        <Link
                          to="/blog-details"
                          className="list-group-item text-muted"
                        >
                          <i className="mdi mdi-circle-medium me-1"></i> ارائه
                          پروؤه ها
                        </Link>

                        <Link
                          to="/blog-details"
                          className="list-group-item text-muted"
                        >
                          <i className="mdi mdi-circle-medium me-1"></i> رفتن به
                          خرید با دوستان
                        </Link>

                        <Link
                          to="/blog-details"
                          className="list-group-item text-muted"
                        >
                          <i className="mdi mdi-circle-medium me-1"></i> نوشتن
                          پلن های هفتگی
                        </Link>

                        <Link
                          to="/blog-details"
                          className="list-group-item text-muted"
                        >
                          <i className="mdi mdi-circle-medium me-1"></i> کشیدن
                          طرح
                        </Link>

                        <Link
                          to="/blog-details"
                          className="list-group-item text-muted"
                        >
                          <i className="mdi mdi-circle-medium me-1"></i> یحث
                          گروهی با دوستان
                        </Link>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="d-flex flex-wrap">
                        <div className="me-2">
                          <h4>1402</h4>
                        </div>
                        <div className="ms-auto">
                          <span className="badge badge-soft-success rounded-pill float-end ms-1 font-size-12">
                            03
                          </span>
                        </div>
                      </div>
                      <hr className="mt-2" />

                      <div className="list-group list-group-flush">
                        <Link
                          to="/blog-details"
                          className="list-group-item text-muted"
                        >
                          <i className="mdi mdi-circle-medium me-1"></i> روز
                          زیبا با دوستان
                        </Link>

                        <Link
                          to="/blog-details"
                          className="list-group-item text-muted"
                        >
                          <i className="mdi mdi-circle-medium me-1"></i>کشیدن
                          طرح
                        </Link>

                        <Link
                          to="/blog-details"
                          className="list-group-item text-muted"
                        >
                          <i className="mdi mdi-circle-medium me-1"></i> بحث
                          گروهی درباره پروؤه
                        </Link>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </TabPane>
          </TabContent>
        </Card>
      </Col>
    </React.Fragment>
  );
}

export default BlogList;