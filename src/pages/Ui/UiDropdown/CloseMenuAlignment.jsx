import React from "react";
import { Card, CardBody, CardTitle, Col, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown } from "reactstrap";

const CloseMenuAlignment = () => {
    return (
      <React.Fragment>
        <Row>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>ترازبندی منو</CardTitle>
                <p className="card-title-desc">
                  افزودن{" "}
                  <code className="highlighter-rouge">.dropdown-menu-end</code>{" "}
                  به <code className="highlighter-rouge">.dropdown-menu</code>{" "}
                  به منوی کشویی را به سمت راست تراز کنید
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <UncontrolledDropdown>
                    <DropdownToggle type="button" className="btn btn-secondary">
                      مثال منوی تراز راست{" "}
                      <i className="mdi mdi-chevron-down"></i>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem href="#">اقدامات</DropdownItem>
                      <DropdownItem href="#">اقدامات دیگر</DropdownItem>
                      <DropdownItem href="#">
                        چیز های دیگر در اینجا
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>

                  <UncontrolledDropdown>
                    <DropdownToggle type="button" className="btn btn-secondary">
                      Left-aligned اما در صورت بزرگ بودن صفحه نمایش به راست تراز
                      می شود <i className="mdi mdi-chevron-down"></i>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-lg-end">
                      <DropdownItem href="#">اقدامات</DropdownItem>
                      <DropdownItem href="#">اقدامات دیگر</DropdownItem>
                      <DropdownItem href="#">
                        چیز های دیگر در اینجا
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>

                  <UncontrolledDropdown>
                    <DropdownToggle type="button" className="btn btn-secondary">
                      Right-aligned اما وقتی صفحه بزرگ باشد، تراز شود{" "}
                      <i className="mdi mdi-chevron-down"></i>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-lg-start">
                      <DropdownItem href="#">اقدامات</DropdownItem>
                      <DropdownItem href="#">اقدامات دیگر</DropdownItem>
                      <DropdownItem href="#">
                        چیز های دیگر در اینجا
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle className="card-title">بسته شدن خودکار</CardTitle>
                <p className="card-title-desc">
                  به طور پیش فرض، با کلیک کردن در داخل، منوی کشویی بسته می شود
                  یا خارج از منوی کشویی. می توانید از استفاده کنید گزینه{" "}
                  <code>autoClose</code> برای تغییر این رفتار کشویی
                </p>

                <div className="d-flex gap-2 flex-wrap">
                  <UncontrolledDropdown>
                    <DropdownToggle
                      className="btn btn-secondary"
                      type="button"
                      id="defaultDropdown"
                    >
                      کشویی پیش فرض <i className="mdi mdi-chevron-down"></i>
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem href="#">آیتم منو</DropdownItem>
                      <DropdownItem href="#">آیتم منو</DropdownItem>
                      <DropdownItem href="#">آیتم منو</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>

                  <UncontrolledDropdown>
                    <DropdownToggle
                      className="btn btn-secondary"
                      type="button"
                      id="dropdownMenuClickableOutside"
                    >
                      قابل کلیک در خارج <i className="mdi mdi-chevron-down"></i>
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem href="#">آیتم منو</DropdownItem>
                      <DropdownItem href="#">آیتم منو</DropdownItem>
                      <DropdownItem href="#">آیتم منو</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>

                  <UncontrolledDropdown>
                    <DropdownToggle
                      className="btn btn-secondary"
                      type="button"
                      id="dropdownMenuClickableInside"
                    >
                      قابل کلیک در داخل <i className="mdi mdi-chevron-down"></i>
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem href="#">آیتم منو</DropdownItem>
                      <DropdownItem href="#">آیتم منو</DropdownItem>
                      <DropdownItem href="#">آیتم منو</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>

                  <UncontrolledDropdown>
                    <DropdownToggle
                      className="btn btn-secondary"
                      type="button"
                      id="dropdownMenuClickable"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="false"
                      aria-expanded="false"
                    >
                      بستن دستی <i className="mdi mdi-chevron-down"></i>
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem href="#">آیتم منو</DropdownItem>
                      <DropdownItem href="#">آیتم منو</DropdownItem>
                      <DropdownItem href="#">آیتم منو</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default CloseMenuAlignment;