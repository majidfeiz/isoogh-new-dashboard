import React, { useState } from "react";
import { Card, CardBody, CardSubtitle, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from "reactstrap";

const SingleVariant = () => {
    const [singleBtn, setSingleBtn] = useState(false)
    const [singleBtn1, setSingleBtn1] = useState(false)
    const [btnPrimary1, setBtnPrimary1] = useState(false)
    const [btnSecondary1, setBtnSecondary1] = useState(false)
    const [btnSuccess1, setBtnSuccess1] = useState(false)
    const [btnInfo1, setBtnInfo1] = useState(false)
    const [btnWarning1, setBtnWarning1] = useState(false)
    const [btnDanger1, setBtnDanger1] = useState(false)

    return (
      <React.Fragment>
        <Row>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>کشویی تک دکمه</CardTitle>
                <p className="card-title-desc">
                  هر <code className="highlighter rouge">.btn</code> می تواند با
                  برخی تغییرات نشانه گذاری به یک ضامن کشویی تبدیل شود. در اینجا
                  این است که چگونه می توانید آنها را با هر یک از آنها کار کنید{" "}
                  <code className="highlighter rouge">&lt;button&gt;</code>{" "}
                  عناصر:
                </p>
                <Row>
                  <Col sm={6}>
                    <Dropdown
                      isOpen={singleBtn}
                      toggle={() => setSingleBtn(!singleBtn)}
                    >
                      <DropdownToggle className="btn btn-secondary" caret>
                        دکمه کشویی <i className="mdi mdi-chevron-down" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>اقدامات</DropdownItem>
                        <DropdownItem>اقدامات دیگر</DropdownItem>
                        <DropdownItem>چیز های دیگر در اینجا</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </Col>
                  <Col sm={6}>
                    <Dropdown
                      isOpen={singleBtn1}
                      toggle={() => setSingleBtn1(!singleBtn1)}
                      className="mt-4 mt-sm-0"
                    >
                      <DropdownToggle className="btn btn-secondary" caret>
                        لینک کشویی
                        <i className="mdi mdi-chevron-down" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>اقدامات</DropdownItem>
                        <DropdownItem>اقدامات دیگر</DropdownItem>
                        <DropdownItem>چیز های دیگر در اینجا</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>نوع</CardTitle>
                <CardSubtitle className="mb-4">
                  بهترین بخش این است که می توانید این کار را با هر نوع دکمه ای
                  نیز انجام دهید:
                </CardSubtitle>

                <div className="d-flex gap-2 flex-wrap">
                  <Dropdown
                    isOpen={btnPrimary1}
                    toggle={() => setBtnPrimary1(!btnPrimary1)}
                  >
                    <DropdownToggle tag="button" className="btn btn-primary">
                      اولیه <i className="mdi mdi-chevron-down" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem>چیز های دیگر در اینجا</DropdownItem>
                      <div className="dropdown-divider"></div>
                      <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <Dropdown
                    isOpen={btnSecondary1}
                    toggle={() => setBtnSecondary1(!btnSecondary1)}
                  >
                    <DropdownToggle tag="button" className="btn btn-secondary">
                      ثانویه <i className="mdi mdi-chevron-down" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem>چیز های دیگر در اینجا</DropdownItem>
                      <div className="dropdown-divider"></div>
                      <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <Dropdown
                    isOpen={btnSuccess1}
                    toggle={() => setBtnSuccess1(!btnSuccess1)}
                  >
                    <DropdownToggle tag="button" className="btn btn-success">
                      موفقیت <i className="mdi mdi-chevron-down" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem>چیز های دیگر در اینجا</DropdownItem>
                      <div className="dropdown-divider"></div>
                      <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <Dropdown
                    isOpen={btnInfo1}
                    toggle={() => setBtnInfo1(!btnInfo1)}
                  >
                    <DropdownToggle tag="button" className="btn btn-info">
                      اطلاعات <i className="mdi mdi-chevron-down" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem>چیز های دیگر در اینجا</DropdownItem>
                      <div className="dropdown-divider"></div>
                      <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <Dropdown
                    isOpen={btnWarning1}
                    toggle={() => setBtnWarning1(!btnWarning1)}
                  >
                    <DropdownToggle tag="button" className="btn btn-warning">
                      هشدار <i className="mdi mdi-chevron-down" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem>چیز های دیگر در اینجا</DropdownItem>
                      <div className="dropdown-divider"></div>
                      <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <Dropdown
                    isOpen={btnDanger1}
                    toggle={() => setBtnDanger1(!btnDanger1)}
                  >
                    <DropdownToggle tag="button" className="btn btn-danger">
                      خطر <i className="mdi mdi-chevron-down" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem>چیز های دیگر در اینجا</DropdownItem>
                      <div className="dropdown-divider"></div>
                      <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default SingleVariant;