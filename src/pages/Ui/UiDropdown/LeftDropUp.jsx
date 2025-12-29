import React, { useState } from "react";
import { Button, ButtonDropdown, Card, CardBody, CardSubtitle, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown } from "reactstrap";

const LeftDropUp = () => {

    const [drop_up1, setDropUp1] = useState(false)
    const [drp_up11, setDrp_up11] = useState(false)
    const [info_dropUp1, setInfo_dropUp1] = useState(false)
    const [inoDrp_up11, setInfoDrp_up11] = useState(false)
    const [info_dropUp111, setInfo_dropUp111] = useState(false)

    return (
      <React.Fragment>
        <Row>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>باز شدن به سمت بالا</CardTitle>
                <CardSubtitle className="mb-3">
                  با افزودن، منوهای کشویی بالای عناصر را فعال کنید{" "}
                  <code className="highlighter-rouge">.dropup</code> به عنصر
                  والد
                </CardSubtitle>
                <div className="d-flex gap-2 flex-wrap">
                  <Dropdown
                    className="dropup"
                    isOpen={drop_up1}
                    direction="up"
                    toggle={() => setDropUp1(!drop_up1)}
                  >
                    <DropdownToggle className="btn btn-info">
                      باز شدن
                      <i className="mdi mdi-chevron-up" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem>چیز های دیگر در اینجا</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  &nbsp;
                  <ButtonDropdown
                    direction="up"
                    isOpen={drp_up11}
                    toggle={() => setDrp_up11(!drp_up11)}
                  >
                    <Button id="caret" color="info">
                      جداگانه باز شدن
                    </Button>
                    <DropdownToggle caret color="info">
                      <i className="mdi mdi-chevron-up" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem>چیز های دیگر در اینجا</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>لینک های جداگانه</DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>باز شدن به سمت چپ</CardTitle>
                <CardSubtitle className="mb-3">
                  با افزودن، منوهای کشویی را در سمت راست عناصر فعال کنید{" "}
                  <code>.dropleft</code>به عنصر والد
                </CardSubtitle>

                <div className="d-flex gap-2 flex-wrap">
                  <Dropdown
                    isOpen={info_dropUp111}
                    direction="left"
                    className="btn-group dropstart"
                    toggle={() => setInfo_dropUp111(!info_dropUp111)}
                  >
                    <DropdownToggle className="btn btn-info">
                      <i className="mdi mdi-chevron-left" /> باز شدن
                    </DropdownToggle>
                    <DropdownMenu data-popper-placement="left-start">
                      <DropdownItem header>سر تیتر</DropdownItem>
                      <DropdownItem disabled>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <UncontrolledDropdown className="btn-group">
                    <div className="btn-group dropstart">
                      <DropdownToggle
                        type="button"
                        className="btn btn-info waves-effect waves-light dropdown-toggle-split"
                      >
                        <i className="mdi mdi-chevron-left"></i>
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem href="#">اقدامات</DropdownItem>
                        <DropdownItem href="#">اقدامات دیگر</DropdownItem>
                        <DropdownItem href="#">
                          چیز های دیگر در اینجا
                        </DropdownItem>
                      </DropdownMenu>
                    </div>

                    <button
                      type="button"
                      className="btn btn-info waves-effect waves-light"
                    >
                      باز شدن جداگانه
                    </button>
                  </UncontrolledDropdown>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>باز شدن به سمت راست</CardTitle>
                <CardSubtitle className="mb-3">
                  با افزودن، منوهای کشویی را در سمت راست عناصر فعال کنید{" "}
                  <code>.dropright</code> به عنصر والد
                </CardSubtitle>

                <div className="d-flex gap-2 flex-wrap">
                  <Dropdown
                    isOpen={info_dropUp1}
                    direction="right"
                    className="btn-group dropend"
                    toggle={() => setInfo_dropUp1(!info_dropUp1)}
                  >
                    <DropdownToggle className="btn btn-info" caret>
                      باز شدن <i className="mdi mdi-chevron-left" />
                    </DropdownToggle>
                    <DropdownMenu data-popper-placement="right-start">
                      <DropdownItem>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem>چیز های دیگر در اینجا</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <ButtonDropdown
                    direction="right"
                    isOpen={inoDrp_up11}
                    className="btn-group dropend"
                    toggle={() => setInfoDrp_up11(!inoDrp_up11)}
                  >
                    <Button id="caret" color="info">
                      باز شدن جداگانه
                    </Button>
                    <DropdownToggle
                      caret
                      color="info"
                      className="dropdown-toggle-split"
                    >
                      <i className="mdi mdi-chevron-left" />
                    </DropdownToggle>
                    <DropdownMenu data-popper-placement="right-start">
                      <DropdownItem>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem>چیز های دیگر در اینجا</DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default LeftDropUp;