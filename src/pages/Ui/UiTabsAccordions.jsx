import React, { useState } from "react";
import {
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Collapse,
  Container,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  UncontrolledAccordion,
  UncontrolledCollapse,
} from "reactstrap";

import { Link } from "react-router-dom";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

import classnames from "classnames";

const UiTabsAccordions = () => {
  //meta title
  document.title = "Tabs & Accordions | Skote - قالب مدیریتی و داشبورد Vite React ";

  const [activeTab, setActiveTab] = useState("1");
  const [activeTab1, setActiveTab1] = useState("5");
  const [verticalActiveTab, setVerticalActiveTab] = useState("1");
  const [customActiveTab, setCustomActiveTab] = useState("1");

  const [col5, setCol5] = useState(true);
  const [col6, setCol6] = useState(true);
  const [col7, setCol7] = useState(true);

  const t_col5 = () => {
    setCol5(!col5);
  };

  const t_col6 = () => {
    setCol6(!col6);
  };

  const t_col7 = () => {
    setCol7(!col7);
  };

  const t_col8 = () => {
    setCol6(!col6);
    setCol7(!col7);
  };


  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const toggle1 = (tab) => {
    if (activeTab1 !== tab) {
      setActiveTab1(tab);
    }
  };

  const toggleVertical = (tab) => {
    if (verticalActiveTab !== tab) {
      setVerticalActiveTab(tab);
    }
  };

  const toggleCustom = (tab) => {
    if (customActiveTab !== tab) {
      setCustomActiveTab(tab);
    }
  };


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="المنت های UI" breadcrumbItem="زبانه و آکاردئون" />

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">برگه های پیش فرض</CardTitle>
                  <p className="card-title-desc">
                    از افزونه جاوا اسکریپت زبانه استفاده کنید—آن را به صورت
                    جداگانه یا اضافه کنید از طریق کامپایل شده{" "}
                    <code className="highlighter-rouge">bootstrap.js</code>{" "}
                    فایل—برای گسترش برگه‌ها و قرص‌های ناوبری ما برای ایجاد صفحات
                    جدولی محتوای محلی، حتی از طریق منوهای کشویی
                  </p>

                  <Nav tabs>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => {
                          toggle("1");
                        }}
                      >
                        <span className="d-block d-sm-none">
                          <i className="fas fa-home"></i>
                        </span>
                        <span className="d-none d-sm-block">صفحه اصلی</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => {
                          toggle("2");
                        }}
                      >
                        <span className="d-block d-sm-none">
                          <i className="far fa-user"></i>
                        </span>
                        <span className="d-none d-sm-block">پروفایل</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab === "3" })}
                        onClick={() => {
                          toggle("3");
                        }}
                      >
                        <span className="d-block d-sm-none">
                          <i className="far fa-envelope"></i>
                        </span>
                        <span className="d-none d-sm-block">پیام</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab === "4" })}
                        onClick={() => {
                          toggle("4");
                        }}
                      >
                        <span className="d-block d-sm-none">
                          <i className="fas fa-cog"></i>
                        </span>
                        <span className="d-none d-sm-block">تنظیمات</span>
                      </NavLink>
                    </NavItem>
                  </Nav>

                  <TabContent activeTab={activeTab} className="p-3 text-muted">
                    <TabPane tabId="1">
                      <Row>
                        <Col sm="12">
                          <CardText className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد
                          </CardText>
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId="2">
                      <Row>
                        <Col sm="12">
                          <CardText className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد
                          </CardText>
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId="3">
                      <Row>
                        <Col sm="12">
                          <CardText className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد
                          </CardText>
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId="4">
                      <Row>
                        <Col sm="12">
                          <CardText className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد
                          </CardText>
                        </Col>
                      </Row>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">ترازبندی زبانه ها</CardTitle>
                  <p className="card-title-desc">
                    از افزونه جاوا اسکریپت زبانه استفاده کنید—آن را به صورت
                    جداگانه یا اضافه کنید از طریق کامپایل شده{" "}
                    <code className="highlighter-rouge">bootstrap.js</code>{" "}
                    فایل—برای گسترش برگه‌ها و قرص‌های ناوبری ما برای ایجاد صفحات
                    جدولی محتوای محلی، حتی از طریق منوهای کشویی
                  </p>

                  <Nav pills className="navtab-bg nav-justified">
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab1 === "5" })}
                        onClick={() => {
                          toggle1("5");
                        }}
                      >
                        <span className="d-block d-sm-none">
                          <i className="fas fa-home"></i>
                        </span>
                        <span className="d-none d-sm-block">صفحه ی اصلی</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab1 === "6" })}
                        onClick={() => {
                          toggle1("6");
                        }}
                      >
                        <span className="d-block d-sm-none">
                          <i className="far fa-user"></i>
                        </span>
                        <span className="d-none d-sm-block">پروفایل</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab1 === "7" })}
                        onClick={() => {
                          toggle1("7");
                        }}
                      >
                        <span className="d-block d-sm-none">
                          <i className="far fa-envelope"></i>
                        </span>
                        <span className="d-none d-sm-block">پیام</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({ active: activeTab1 === "8" })}
                        onClick={() => {
                          toggle1("8");
                        }}
                      >
                        <span className="d-block d-sm-none">
                          <i className="fas fa-cog"></i>
                        </span>
                        <span className="d-none d-sm-block">تنظیمات</span>
                      </NavLink>
                    </NavItem>
                  </Nav>

                  <TabContent activeTab={activeTab1} className="p-3 text-muted">
                    <TabPane tabId="5">
                      <Row>
                        <Col sm="12">
                          <CardText className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </CardText>
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId="6">
                      <Row>
                        <Col sm="12">
                          <CardText className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </CardText>
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId="7">
                      <Row>
                        <Col sm="12">
                          <CardText className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </CardText>
                        </Col>
                      </Row>
                    </TabPane>

                    <TabPane tabId="8">
                      <Row>
                        <Col sm="12">
                          <CardText className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </CardText>
                        </Col>
                      </Row>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">زبانه‌های ناوبری عمودی</CardTitle>
                  <p className="card-title-desc">
                    نمونه ای از برگه های مسیریابی عمودی
                  </p>
                  <Row>
                    <Col md="3">
                      <Nav pills className="flex-column">
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              "mb-2": true,
                              active: verticalActiveTab === "1",
                            })}
                            onClick={() => {
                              toggleVertical("1");
                            }}
                          >
                            صفحه اصلی
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              "mb-2": true,
                              active: verticalActiveTab === "2",
                            })}
                            onClick={() => {
                              toggleVertical("2");
                            }}
                          >
                            پروفایل
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              "mb-2": true,
                              active: verticalActiveTab === "3",
                            })}
                            onClick={() => {
                              toggleVertical("3");
                            }}
                          >
                            پیام
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            style={{ cursor: "pointer" }}
                            className={classnames({
                              active: verticalActiveTab === "4",
                            })}
                            onClick={() => {
                              toggleVertical("4");
                            }}
                          >
                            تنظیمات
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </Col>
                    <Col md="9">
                      <TabContent
                        activeTab={verticalActiveTab}
                        className="text-muted mt-4 mt-md-0"
                      >
                        <TabPane tabId="1">
                          <p>
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </p>
                          <p>
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </p>
                        </TabPane>
                        <TabPane tabId="2">
                          <p>
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </p>
                          <p className="mb-0">
                            {" "}
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </p>
                        </TabPane>
                        <TabPane tabId="3">
                          <p>
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </p>
                          <p className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </p>
                        </TabPane>

                        <TabPane tabId="4">
                          <p>
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </p>
                          <p className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </p>
                        </TabPane>
                      </TabContent>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">برگه های سفارشی</CardTitle>
                  <p className="card-title-desc">نمونه ای از تب های سفارشی</p>

                  <Nav tabs className="nav-tabs-custom nav-justified">
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({
                          active: customActiveTab === "1",
                        })}
                        onClick={() => {
                          toggleCustom("1");
                        }}
                      >
                        <span className="d-block d-sm-none">
                          <i className="fas fa-home"></i>
                        </span>
                        <span className="d-none d-sm-block">صفحه ی اصلی</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({
                          active: customActiveTab === "2",
                        })}
                        onClick={() => {
                          toggleCustom("2");
                        }}
                      >
                        <span className="d-block d-sm-none">
                          <i className="far fa-user"></i>
                        </span>
                        <span className="d-none d-sm-block">پروفایل</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({
                          active: customActiveTab === "3",
                        })}
                        onClick={() => {
                          toggleCustom("3");
                        }}
                      >
                        <span className="d-block d-sm-none">
                          <i className="far fa-envelope"></i>
                        </span>
                        <span className="d-none d-sm-block">پیام</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({
                          active: customActiveTab === "4",
                        })}
                        onClick={() => {
                          toggleCustom("4");
                        }}
                      >
                        <span className="d-block d-sm-none">
                          <i className="fas fa-cog"></i>
                        </span>
                        <span className="d-none d-sm-block">تنظیمات</span>
                      </NavLink>
                    </NavItem>
                  </Nav>

                  <TabContent
                    activeTab={customActiveTab}
                    className="p-3 text-muted"
                  >
                    <TabPane tabId="1">
                      <Row>
                        <Col sm="12">
                          <CardText className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </CardText>
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId="2">
                      <Row>
                        <Col sm="12">
                          <CardText className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </CardText>
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId="3">
                      <Row>
                        <Col sm="12">
                          <CardText className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </CardText>
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId="4">
                      <Row>
                        <Col sm="12">
                          <CardText className="mb-0">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و
                            آینده شناخت فراوان جامعه و متخصصان را می طلبد
                          </CardText>
                        </Col>
                      </Row>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Card>
              <CardBody>
                <h4 className="card-title">آکاردئون</h4>
                <Row>
                  <Col xl={6}>
                    <div className="mt-4">
                      <h5 className="font-size-14">مثال ها</h5>
                      <p className="card-title-desc">
                        روی آکاردئون های زیر کلیک کنید تا آن را بزرگ یا کوچک
                        کنید محتوای آکاردئون
                      </p>

                      <UncontrolledAccordion defaultOpen="1">
                        <AccordionItem>
                          <AccordionHeader targetId="1">
                            آکاردئون مورد شماره 1
                          </AccordionHeader>
                          <AccordionBody accordionId="1">
                            <div className="text-muted">
                              <strong className="text-body-emphasis">
                                این اولین مورد است
                              </strong>{" "}
                              به طور پیش فرض پنهان است، تا زمانی که افزونه جمع
                              شود کلاس های مناسبی را که برای استایل استفاده می
                              کنیم اضافه می کند هر عنصر این کلاس ها به طور کلی
                              کنترل می کنند ظاهر، و همچنین نشان دادن و پنهان شدن
                              از طریق انتقال CSS شما می توانید هر یک از این را
                              با CSS سفارشی یا نادیده گرفتن متغیرهای پیش فرض ما.
                              همچنین شایان ذکر است که تقریباً هر کدام HTML می
                              تواند در <code>.بدنه آکاردئونی</code>، هرچند
                              انتقال سرریز را محدود می کند
                            </div>
                          </AccordionBody>
                        </AccordionItem>
                        <AccordionItem>
                          <AccordionHeader targetId="2">
                            آکاردئون مورد شماره 2
                          </AccordionHeader>
                          <AccordionBody accordionId="2">
                            <div className="accordion-body">
                              <div className="text-muted">
                                <strong className="text-body-emphasis">
                                  این دومین مورد است
                                </strong>{" "}
                                به طور پیش فرض پنهان است، تا زمانی که سقوط کند
                                افزونه کلاس های مناسبی را که ما استفاده می کنیم
                                اضافه می کند برای سبک دادن به هر عنصر این کلاس
                                ها کنترل می کنند ظاهر کلی، و همچنین نشان دادن و
                                مخفی شدن از طریق انتقال CSS شما می توانید هر
                                کدام را اصلاح کنید از این با CSS سفارشی یا
                                نادیده گرفتن ما متغیرهای پیش فرض همچنین شایان
                                ذکر است که تقریباً هر HTML می تواند در{" "}
                                <code>.بدنه آکاردئونی</code>، هرچند انتقال سرریز
                                را محدود می کند
                              </div>
                            </div>
                          </AccordionBody>
                        </AccordionItem>
                        <AccordionItem>
                          <AccordionHeader targetId="3" className="fw-medium">
                            آکاردئون مورد شماره 3
                          </AccordionHeader>
                          <AccordionBody accordionId="3">
                            <div className="text-muted">
                              <strong className="text-body-emphasis">
                                این سومین مورد است
                              </strong>{" "}
                              به طور پیش فرض پنهان است، تا زمانی که افزونه جمع
                              شود کلاس های مناسبی را که برای استایل استفاده می
                              کنیم اضافه می کند هر عنصر این کلاس ها به طور کلی
                              کنترل می کنند ظاهر، و همچنین نشان دادن و پنهان شدن
                              از طریق انتقال CSS شما می توانید هر یک از این را
                              با CSS سفارشی یا نادیده گرفتن متغیرهای پیش فرض ما.
                              همچنین شایان ذکر است که تقریباً هر کدام HTML می
                              تواند در <code>.بدنه آکاردئونی</code>، هرچند
                              انتقال سرریز را محدود می کند
                            </div>
                          </AccordionBody>
                        </AccordionItem>
                      </UncontrolledAccordion>
                    </div>
                  </Col>
                  <Col xl={6}>
                    <div className="mt-4">
                      <h4 className="font-size-14">فلاش</h4>
                      <p className="card-title-desc">
                        اضافه کردن <code>.accordion-flush</code> برای حذف پیش
                        فرض <code>background-color</code>، برخی حاشیه‌ها و برخی
                        دیگر گوشه های گرد برای ارائه لبه به لبه آکاردئون ها ظرف
                        والدین آنها
                      </p>

                      <UncontrolledAccordion defaultOpen="1" flush>
                        <AccordionItem>
                          <AccordionHeader targetId="1">
                            آکاردئون مورد شماره 4
                          </AccordionHeader>
                          <AccordionBody accordionId="1">
                            <div className="text-muted">
                              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                              صنعت چاپ و با استفاده از طراحان گرافیک است.
                              چاپگرها و متون بلکه روزنامه و مجله در ستون و
                              سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی
                              مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای
                              کاربردی می باشد. کتابهای زیادی در شصت و سه درصد
                              گذشته، حال و آینده شناخت فراوان جامعه و متخصصان را
                              می طلبد
                            </div>
                          </AccordionBody>
                        </AccordionItem>
                        <AccordionItem>
                          <AccordionHeader targetId="2">
                            آکاردئون مورد شماره 5
                          </AccordionHeader>
                          <AccordionBody accordionId="2">
                            <div className="accordion-body">
                              <div className="text-muted">
                                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                                صنعت چاپ و با استفاده از طراحان گرافیک است.
                                چاپگرها و متون بلکه روزنامه و مجله در ستون و
                                سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی
                                مورد نیاز و کاربردهای متنوع با هدف بهبود
                                ابزارهای کاربردی می باشد. کتابهای زیادی در شصت و
                                سه درصد گذشته، حال و آینده شناخت فراوان جامعه و
                                متخصصان را می طلبد
                              </div>
                            </div>
                          </AccordionBody>
                        </AccordionItem>
                        <AccordionItem>
                          <AccordionHeader targetId="3">
                            آکاردئون مورد شماره 6
                          </AccordionHeader>
                          <AccordionBody accordionId="3">
                            <div className="text-muted">
                              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                              صنعت چاپ و با استفاده از طراحان گرافیک است.
                              چاپگرها و متون بلکه روزنامه و مجله در ستون و
                              سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی
                              مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای
                              کاربردی می باشد. کتابهای زیادی در شصت و سه درصد
                              گذشته، حال و آینده شناخت فراوان جامعه و متخصصان را
                              می طلبد
                            </div>
                          </AccordionBody>
                        </AccordionItem>
                      </UncontrolledAccordion>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Row>

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <CardTitle className="h4 mb-0">سقوط </CardTitle>
                  <Row>
                    <Col xl="6">
                      <div className="mt-4">
                        <h5 className="font-size-14">مثال</h5>
                        <p className="card-title-desc">
                          می توانید از یک لینک با استفاده از{" "}
                          <code className="highlighter-rouge">href</code> ویژگی
                          یا دکمه ای با{" "}
                          <code className="highlighter rouge">هدف داده</code>{" "}
                          صفت. در هر دو مورد،{" "}
                          <code className="highlighter rouge">
                            {""}
                            data toggle=&quot;collapse&ldquo;
                          </code>{" "}
                          مورد نیاز است
                        </p>

                        <div className="d-flex gap-2 flex-wrap mb-3">
                          <Link
                            to="#"
                            onClick={t_col5}
                            style={{ cursor: "pointer" }}
                            className="btn btn-primary mo-mb-2"
                          >
                            لینک با href{" "}
                          </Link>
                          <button
                            onClick={t_col5}
                            className="btn btn-primary mo-mb-2"
                            type="button"
                            style={{ cursor: "pointer" }}
                          >
                            دکمه با داده هدف
                          </button>
                        </div>
                        <Collapse isOpen={col5}>
                          <Card className="border">
                            <CardBody>
                              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                              صنعت چاپ و با استفاده از طراحان گرافیک است.
                              چاپگرها و متون بلکه روزنامه و مجله در ستون و
                              سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی
                              مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای
                              کاربردی می باشد. کتابهای زیادی در شصت و سه درصد
                              گذشته، حال و آینده شناخت فراوان جامعه و متخصصان را
                              می طلبد
                            </CardBody>
                          </Card>
                        </Collapse>
                      </div>
                    </Col>
                    <Col xl="6">
                      <div className="mt-4">
                        <h5 className="font-size-14">اهداف متعدد</h5>
                        <p className="card-title-desc">
                          یک <code>&lt;button&gt;</code> یا{" "}
                          <code>&lt;a&gt;</code> می تواند چندین مورد را نشان
                          داده و پنهان کند عناصر با ارجاع آنها با یک انتخابگر در
                          آن <code>href</code> یا <code>data bs target</code>{" "}
                          صفت
                        </p>

                        <div className="d-flex gap-2 flex-wrap mb-3">
                          <Link
                            to="#"
                            onClick={t_col6}
                            style={{ cursor: "pointer" }}
                            className="btn btn-primary"
                          >
                            اولین عنصر را تغییر دهید
                          </Link>
                          <button
                            onClick={t_col7}
                            className="btn btn-primary"
                            type="button"
                            style={{ cursor: "pointer" }}
                          >
                            عنصر دوم را تغییر دهید
                          </button>

                          <button
                            onClick={t_col8}
                            className="btn btn-primary"
                            type="button"
                            style={{ cursor: "pointer" }}
                          >
                            هر دو عنصر را تغییر دهید
                          </button>
                        </div>
                        <div className="row">
                          <div className="col">
                            <Collapse isOpen={col6}>
                              <Card>
                                <CardBody className="border shadow-none text-muted mb-0">
                                  لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم
                                  از صنعت چاپ و با استفاده از طراحان گرافیک است.
                                  چاپگرها و متون بلکه روزنامه و مجله در ستون و
                                  سطرآنچنان که لازم است و برای شرایط فعلی
                                  تکنولوژی مورد نیاز و کاربردهای متنوع با هدف
                                  بهبود ابزارهای کاربردی می باشد. کتابهای زیادی
                                  در شصت و سه درصد گذشته، حال و آینده شناخت
                                  فراوان جامعه و متخصصان را می طلبد
                                </CardBody>
                              </Card>
                            </Collapse>
                          </div>
                          <div className="col">
                            <Collapse isOpen={col7}>
                              <Card>
                                <CardBody className="border shadow-none text-muted mb-0">
                                  لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم
                                  از صنعت چاپ و با استفاده از طراحان گرافیک است.
                                  چاپگرها و متون بلکه روزنامه و مجله در ستون و
                                  سطرآنچنان که لازم است و برای شرایط فعلی
                                  تکنولوژی مورد نیاز و کاربردهای متنوع با هدف
                                  بهبود ابزارهای کاربردی می باشد. کتابهای زیادی
                                  در شصت و سه درصد گذشته، حال و آینده شناخت
                                  فراوان جامعه و متخصصان را می طلبد
                                </CardBody>
                              </Card>
                            </Collapse>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle>فروپاشی افقی</CardTitle>
                  <p className="card-title-desc">
                    افزونه collapse از جمع شدن افقی نیز پشتیبانی می کند. اضافه
                    کردن کلاس اصلاح کننده <code>.collapse-horizontal</code> به
                    انتقال <code>عرض</code> به جای <code>ارتفاع</code> و یک{" "}
                    <code>عرض</code> روی آن تنظیم کنید عنصر کودک فوری
                  </p>

                  <p>
                    <button
                      className="btn btn-primary"
                      id="collapseWidthExample"
                      type="button"
                    >
                      کوچک کردن عرض را تغییر دهید
                    </button>
                  </p>
                  <div style={{ minHeight: "110px" }}>
                    <UncontrolledCollapse
                      horizontal
                      toggler="collapseWidthExample"
                      id="collapseWidthExample"
                    >
                      <Card
                        className="border shadow-none card-body text-muted mb-0"
                        style={{ width: "300px" }}
                      >
                        این مقداری از محتوای نگهدارنده مکان برای یک افقی است
                        سقوط - فروپاشی. به‌طور پیش‌فرض پنهان است و چه زمانی نشان
                        داده می‌شود باعث شد
                      </Card>
                    </UncontrolledCollapse>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default UiTabsAccordions;
