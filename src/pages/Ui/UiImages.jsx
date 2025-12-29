import React from "react";

import img2 from "../../assets/images/small/img-2.jpg";
import img3 from "../../assets/images/small/img-3.jpg";
import img4 from "../../assets/images/small/img-4.jpg";

import {
  Col,
  Row,
  Card,
  CardBody,
  CardTitle,
   Container,
} from "reactstrap";
import avatar1 from "../../assets/images/users/avatar-1.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../assets/images/users/avatar-5.jpg";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const UiImages = () => {

  //meta title
  document.title = "Images | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="المنت های UI" breadcrumbItem="تصاویر" />

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">تصویر گرد و دایره</CardTitle>
                  <p className="card-title-desc">
                    از className استفاده کنید
                    <code>.rounded</code> و <code>.rounded-circle</code>.
                  </p>

                  <Row>
                    <Col md={6}>
                      <img
                        className="rounded me-2"
                        alt="200x200"
                        width="200"
                        src={img4}
                        data-holder-rendered="true"
                      />
                    </Col>
                    <Col md={6}>
                      <div className="mt-4 mt-md-0">
                        <img
                          className="rounded-circle avatar-xl"
                          alt="200x200"
                          src={avatar4}
                          data-holder-rendered="true"
                        />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <CardTitle className="h4">ریز عکسها</CardTitle>
                  <p className="card-title-desc">
                    علاوه بر ابزارهای شعاع مرزی ما، می توانید استفاده کنید
                    <code className="highlighter-rouge">.img-thumbnail</code> به
                    به یک تصویر ظاهری گرد 1 پیکسلی بدهید
                  </p>

                  <Row>
                    <Col md={6}>
                      <img
                        className="img-thumbnail"
                        alt="200x200"
                        width="200"
                        src={img3}
                        data-holder-rendered="true"
                      />
                    </Col>
                    <Col md={6}>
                      <div className="mt-4 mt-md-0">
                        <img
                          className="img-thumbnail rounded-circle avatar-xl"
                          alt="200x200"
                          src={avatar3}
                          data-holder-rendered="true"
                        />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">تصاویر واکنش گرا</CardTitle>
                  <p className="card-title-desc">
                    تصاویر در بوت استرپ با استفاده از آن به صورت واکنشگرا ساخته
                    می شوند{" "}
                    <code className="highlighter-rouge">.img-fluid</code>.{" "}
                    <code className="highlighter-rouge">max-width: 100%;</code>{" "}
                    و <code className="highlighter-rouge">height: auto;</code>{" "}
                    روی تصویر اعمال می شوند تا با والد مقیاس شود عنصر
                  </p>

                  <div className="">
                    <img
                      src={img2}
                      className="img-fluid"
                      alt="Responsive image"
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <CardTitle className="h4 mb-4">اندازه های تصویر</CardTitle>
                  <Row>
                    <Col md={6}>
                      <Row>
                        <Col lg={4}>
                          <div>
                            <img
                              src={avatar3}
                              alt=""
                              className="rounded avatar-sm"
                            />
                            <p className="mt-2 mb-lg-0">
                              <code>.avatar-sm</code>
                            </p>
                          </div>
                        </Col>
                        <Col lg={4}>
                          <div>
                            <img
                              src={avatar4}
                              alt=""
                              className="rounded avatar-md"
                            />
                            <p className="mt-2  mb-lg-0">
                              <code>.avatar-md</code>
                            </p>
                          </div>
                        </Col>
                        <Col lg={4}>
                          <div>
                            <img
                              src={avatar5}
                              alt=""
                              className="rounded avatar-lg"
                            />
                            <p className="mt-2 mb-lg-0">
                              <code>.avatar-lg</code>
                            </p>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                    <Col md={6}>
                      <Row>
                        <Col lg={4}>
                          <div>
                            <img
                              src={avatar3}
                              alt=""
                              className="rounded-circle avatar-sm"
                            />
                            <p className="mt-2 mb-lg-0">
                              <code>.avatar-sm</code>
                            </p>
                          </div>
                        </Col>
                        <Col lg={4}>
                          <div>
                            <img
                              src={avatar4}
                              alt=""
                              className="rounded-circle avatar-md"
                            />
                            <p className="mt-2  mb-lg-0">
                              <code>.avatar-md</code>
                            </p>
                          </div>
                        </Col>
                        <Col lg={4}>
                          <div>
                            <img
                              src={avatar5}
                              alt=""
                              className="rounded-circle avatar-lg"
                            />
                            <p className="mt-2 mb-lg-0">
                              <code>.avatar-lg</code>
                            </p>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col className="col-12">
              <Card>
                <CardBody>
                  <CardTitle className="h4">شی رسانه</CardTitle>
                  <p className="card-title-desc">
                    تصاویر یا رسانه های دیگر را می توان در بالا، وسط یا تراز کرد
                    پایین پیش فرض تراز بالایی است
                  </p>

                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <img
                        className="rounded avatar-sm"
                        src={avatar3}
                        alt="Generic placeholder image"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h5>رسانه با تراز بالا</h5>
                      <p className="mb-0">
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                        چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون
                        بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و
                        برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با
                        هدف بهبود ابزارهای کاربردی می باشد
                      </p>
                    </div>
                  </div>

                  <hr />
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <img
                        className="rounded avatar-sm"
                        src={avatar5}
                        alt="Generic placeholder image"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h5>رسانه تراز شده در مرکز</h5>
                      <p className="mb-0">
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                        چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون
                        بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و
                        برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با
                        هدف بهبود ابزارهای کاربردی می باشد
                      </p>
                    </div>
                  </div>

                  <hr />

                  <div className="d-flex align-items-end">
                    <div className="flex-shrink-0 me-3">
                      <img
                        className="rounded avatar-sm"
                        src={avatar1}
                        alt="Generic placeholder image"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h5>رسانه با تراز پایین</h5>
                      <p className="mb-0">
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                        چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون
                        بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و
                        برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با
                        هدف بهبود ابزارهای کاربردی می باشد
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default UiImages;
