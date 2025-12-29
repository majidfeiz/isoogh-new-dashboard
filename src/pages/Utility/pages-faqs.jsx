import React, { useState } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const PagesFaqs = () => {

  //meta title
  document.title = "FAQs | Skote - قالب مدیریتی و داشبورد Vite React ";
  
  const [activeTab, setactiveTab] = useState("1");

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="ابزارهای مفید" breadcrumbItem="سوالات متداول" />

          <div className="checkout-tabs">
            <Row>
              <Col lg="2">
                <Nav className="flex-column" pills>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "1" })}
                      onClick={() => {
                        setactiveTab("1");
                      }}
                    >
                      <i className="bx bx-question-mark d-block check-nav-icon mt-4 mb-2" />
                      <p className="font-weight-bold mb-4">General Questions</p>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "2" })}
                      onClick={() => {
                        setactiveTab("2");
                      }}
                    >
                      <i className="bx bx-check-shield d-block check-nav-icon mt-4 mb-2" />
                      <p className="font-weight-bold mb-4">
                        سیاست حفظ حریم خصوصی
                      </p>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "3" })}
                      onClick={() => {
                        setactiveTab("3");
                      }}
                    >
                      <i className="bx bx-support d-block check-nav-icon mt-4 mb-2" />
                      <p className="font-weight-bold mb-4">پشتیبانی</p>
                    </NavLink>
                  </NavItem>
                </Nav>
              </Col>
              <Col lg="10">
                <Card>
                  <CardBody>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId="1">
                        <CardTitle className="mb-5">سوالات عمومی</CardTitle>
                        <div className="faq-box d-flex mb-4">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">لورم ایپسوم چیست؟</h5>
                            <p className="text-muted">
                              زبان مشترک جدید ساده تر و ساده تر خواهد بود منظم
                              از زبان های اروپایی موجود است. آی تی به سادگی غربی
                              خواهد بود
                            </p>
                          </div>
                        </div>
                        <div className="faq-box d-flex mb-4">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">از کجا آمده است؟</h5>
                            <p className="text-muted">
                              همه می دانند که چرا یک زبان مشترک جدید می تواند
                              مطلوب باشد، می توان از پرداخت گران امتناع کرد
                              مترجمان
                            </p>
                          </div>
                        </div>
                        <div className="faq-box d-flex mb-4">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">
                              از کجا می توانم تهیه کنم؟
                            </h5>
                            <p className="text-muted">
                              اگر چندین زبان با هم ترکیب شوند، دستور زبان زبان
                              حاصل ساده تر و منظم تر از زبان های فردی
                            </p>
                          </div>
                        </div>
                        <div className="faq-box d-flex mb-4">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">
                              چرا از آن استفاده می کنیم؟
                            </h5>
                            <p className="text-muted">
                              وجود جداگانه آنها یک افسانه است. برای علم، موسیقی،
                              ورزش، و غیره، اروپا از همان استفاده می کند واژگان
                            </p>
                          </div>
                        </div>
                        <div className="d-flex faq-box">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">
                              از کجا می توانم تهیه کنم؟
                            </h5>
                            <p className="text-muted">
                              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                              صنعت چاپ و با استفاده از طراحان گرافیک است
                            </p>
                          </div>
                        </div>
                      </TabPane>
                      <TabPane tabId="2">
                        <CardTitle className="mb-5">
                          سیاست حفظ حریم خصوصی
                        </CardTitle>

                        <div className="faq-box d-flex mb-4">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">از کجا آمده است؟</h5>
                            <p className="text-muted">
                              همه می دانند که چرا یک زبان مشترک جدید می تواند
                              مطلوب باشد، می توان از پرداخت گران امتناع کرد
                              مترجمان
                            </p>
                          </div>
                        </div>
                        <div className="faq-box d-flex mb-4">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">
                              از کجا می توانم تهیه کنم؟
                            </h5>
                            <p className="text-muted">
                              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                              صنعت چاپ و با استفاده از طراحان گرافیک است
                            </p>
                          </div>
                        </div>
                        <div className="faq-box d-flex mb-4">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">لورم ایپسوم چیست؟</h5>
                            <p className="text-muted">
                              زبان مشترک جدید ساده تر و ساده تر خواهد بود منظم
                              از زبان های اروپایی موجود است. آی تی به سادگی غربی
                              خواهد بود
                            </p>
                          </div>
                        </div>
                        <div className="faq-box d-flex mb-4">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">
                              چرا از آن استفاده می کنیم؟
                            </h5>
                            <p className="text-muted">
                              وجود جداگانه آنها یک افسانه است. برای علم، موسیقی،
                              ورزش، و غیره، اروپا از همان استفاده می کند واژگان
                            </p>
                          </div>
                        </div>
                        <div className="d-flex faq-box">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">
                              از کجا می توانم تهیه کنم؟
                            </h5>
                            <p className="text-muted">
                              اگر چندین زبان با هم ترکیب شوند، دستور زبان زبان
                              حاصل ساده تر و منظم تر از زبان های فردی
                            </p>
                          </div>
                        </div>
                      </TabPane>
                      <TabPane tabId="3">
                        <CardTitle className="mb-5">پشتیبانی</CardTitle>

                        <div className="faq-box d-flex mb-4">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">
                              از کجا می توانم تهیه کنم؟
                            </h5>
                            <p className="text-muted">
                              اگر چندین زبان با هم ترکیب شوند، دستور زبان زبان
                              حاصل ساده تر و منظم تر از زبان های فردی
                            </p>
                          </div>
                        </div>
                        <div className="faq-box d-flex mb-4">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">از کجا آمده است؟</h5>
                            <p className="text-muted">
                              همه می دانند که چرا یک زبان مشترک جدید می تواند
                              مطلوب باشد، می توان از پرداخت گران امتناع کرد
                              مترجمان
                            </p>
                          </div>
                        </div>

                        <div className="faq-box d-flex mb-4">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">
                              از کجا می توانم تهیه کنم؟
                            </h5>
                            <p className="text-muted">
                              وجود جداگانه آنها یک افسانه است. برای علم، موسیقی،
                              ورزش، و غیره، اروپا از همان استفاده می کند واژگان
                            </p>
                          </div>
                        </div>
                        <div className="faq-box d-flex mb-4">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">
                              از کجا می توانم تهیه کنم؟
                            </h5>
                            <p className="text-muted">
                              اگر چندین زبان با هم ترکیب شوند، دستور زبان زبان
                              حاصل ساده تر و منظم تر از زبان های فردی
                            </p>
                          </div>
                        </div>

                        <div className="d-flex faq-box">
                          <div className="flex-shrink-0 me-3 faq-icon">
                            <i className="bx bx-help-circle font-size-20 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="font-size-15">لورم ایپسوم چیست؟</h5>
                            <p className="text-muted">
                              زبان مشترک جدید ساده تر و ساده تر خواهد بود منظم
                              از زبان های اروپایی موجود است. آی تی به سادگی غربی
                              خواهد بود
                            </p>
                          </div>
                        </div>
                      </TabPane>
                    </TabContent>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PagesFaqs;
