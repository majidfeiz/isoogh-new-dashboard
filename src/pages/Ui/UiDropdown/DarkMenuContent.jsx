import React from "react";
import { Card, CardBody, CardTitle, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, Label, Row, UncontrolledDropdown } from "reactstrap";

const DarkMenuContent = () => {
    return (
      <React.Fragment>
        <Row>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle className="card-title">محتوای منو</CardTitle>
                <p className="card-title-desc">
                  نمونه ای از منوی کشویی سرصفحه ها، متن، محتوای فرم ها
                </p>

                <div className="d-flex flex-wrap gap-2">
                  <UncontrolledDropdown>
                    <DropdownToggle color="primary" type="button">
                      سر تیتر<i className="mdi mdi-chevron-down"></i>
                    </DropdownToggle>
                    <DropdownMenu>
                      <div className="dropdown-header noti-title">
                        <h5 className="font-size-13 text-muted text-truncate mn-0">
                          خوش آمدی سارا
                        </h5>
                      </div>
                      <DropdownItem href="#">اقدامات</DropdownItem>
                      <DropdownItem href="#">اقدامات دیگر</DropdownItem>
                      <DropdownItem href="#">
                        چیز های دیگر در اینجا
                      </DropdownItem>
                      <div className="dropdown-divider"></div>
                      <DropdownItem href="#">لینک جدا شده</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>

                  <UncontrolledDropdown>
                    <DropdownToggle type="button" className="btn btn-success">
                      متن<i className="mdi mdi-chevron-down"></i>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-md p-3">
                      <p>
                        چند متن مثالی که در داخل آن جریان آزاد دارد فهرست کشویی
                      </p>
                      <p className="mb-0">و این متن نمونه بیشتری است</p>
                    </DropdownMenu>
                  </UncontrolledDropdown>

                  <UncontrolledDropdown>
                    <DropdownToggle type="button" className="btn btn-light">
                      فرم <i className="mdi mdi-chevron-down"></i>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-md p-4">
                      <Form>
                        <div className="mb-2">
                          <Label
                            className="form-label"
                            htmlFor="exampleDropdownFormEmail"
                          >
                            آدرس ایمیل
                          </Label>
                          <Input
                            type="email"
                            className="form-control"
                            id="exampleDropdownFormEmail"
                            placeholder="email@example.com"
                          />
                        </div>
                        <div className="mb-2">
                          <Label
                            className="form-label"
                            htmlFor="exampleDropdownFormPassword"
                          >
                            رمز عبور
                          </Label>
                          <Input
                            type="password"
                            className="form-control"
                            id="exampleDropdownFormPassword"
                            placeholder="رمز عبور"
                          />
                        </div>
                        <div className="mb-2">
                          <div className="form-check custom-checkbox">
                            <Input
                              type="checkbox"
                              className="form-check-input"
                              id="rememberdropdownCheck"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="rememberdropdownCheck"
                            >
                              مرا به خاطر بسپار
                            </Label>
                          </div>
                        </div>
                        <button type="submit" className="btn btn-primary">
                          ورود
                        </button>
                      </Form>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>منوی کشویی تاریک</CardTitle>
                <p className="card-title-desc">
                  برای مطابقت با نوار ناوبری تاریک یا سفارشی، از منوهای کشویی
                  تیره تر استفاده کنید با اضافه کردن{" "}
                  <code>.dropdown-menu-dark</code> به یک شکل دهید
                  <code>.dropdown-menu</code> موجود است. هیچ تغییری لازم نیست به
                  آیتم های کشویی
                </p>

                <UncontrolledDropdown>
                  <DropdownToggle type="button" className="btn btn-secondary">
                    منو راست چین شده است{" "}
                    <i className="mdi mdi-chevron-down"></i>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu-dark">
                    <DropdownItem href="#">اقدامات</DropdownItem>
                    <DropdownItem href="#">اقدامات دیگر</DropdownItem>
                    <DropdownItem href="#">چیز های دیگر در اینجا</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default DarkMenuContent;