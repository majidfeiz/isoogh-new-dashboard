import React, { useState } from "react";
import { Button, ButtonDropdown, Card, CardBody, CardSubtitle, CardTitle, Col, DropdownItem, DropdownMenu, DropdownToggle, Row } from "reactstrap";

const SplitSizing = () => {

    const [drp_primary1, setDrp_primary1] = useState(false)
    const [drp_secondary1, setDrp_secondary1] = useState(false)
    const [drp_success1, setDrp_success1] = useState(false)
    const [drp_info1, setDrp_info1] = useState(false)
    const [drp_warning1, setDrp_warning1] = useState(false)
    const [drp_danger1, setDrp_danger1] = useState(false)
    const [drp_secondary, setDrp_secondary] = useState(false)
    const [drp_secondary_lg, setDrp_secondary_lg] = useState(false)
    const [drp_secondary_sm, setDrp_secondary_sm] = useState(false)
    const [drp_secondary_sm1, setDrp_secondary_sm1] = useState(false)

    return (
      <React.Fragment>
        <Row>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>کشویی دکمه تقسیم</CardTitle>
                <CardSubtitle className="mb-3">
                  بهترین بخش این است که می توانید این کار را با هر نوع دکمه ای
                  نیز انجام دهید:
                </CardSubtitle>
                <div className="d-flex gap-2 flex-wrap">
                  <div className="btn-group">
                    <ButtonDropdown
                      isOpen={drp_primary1}
                      toggle={() => setDrp_primary1(!drp_primary1)}
                    >
                      <Button id="caret" color="primary">
                        اولیه
                      </Button>
                      <DropdownToggle caret color="primary">
                        <i className="mdi mdi-chevron-down" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>اقدامات</DropdownItem>
                        <DropdownItem>اقدامات دیگر</DropdownItem>
                        <DropdownItem>چیز های دیگر</DropdownItem>
                        <div className="dropdown-divider"></div>
                        <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>
                  </div>

                  <div className="btn-group">
                    <ButtonDropdown
                      isOpen={drp_secondary1}
                      toggle={() => setDrp_secondary1(!drp_secondary1)}
                    >
                      <Button id="caret" color="secondary">
                        ثانویه
                      </Button>
                      <DropdownToggle caret color="secondary">
                        <i className="mdi mdi-chevron-down" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>اقدامات</DropdownItem>
                        <DropdownItem>اقدامات دیگر</DropdownItem>
                        <DropdownItem>چیز های دیگر</DropdownItem>
                        <div className="dropdown-divider"></div>
                        <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>
                  </div>

                  <div className="btn-group">
                    <ButtonDropdown
                      isOpen={drp_success1}
                      toggle={() => setDrp_success1(!drp_success1)}
                    >
                      <Button id="caret" color="success">
                        موفقیت
                      </Button>
                      <DropdownToggle caret color="success">
                        <i className="mdi mdi-chevron-down" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>اقدامات</DropdownItem>
                        <DropdownItem>اقدامات دیگر</DropdownItem>
                        <DropdownItem>چیز های دیگر</DropdownItem>
                        <div className="dropdown-divider"></div>
                        <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>
                  </div>

                  <div className="btn-group">
                    <ButtonDropdown
                      isOpen={drp_info1}
                      toggle={() => setDrp_info1(!drp_info1)}
                    >
                      <Button id="caret" color="info">
                        اطلاعات
                      </Button>
                      <DropdownToggle caret color="info">
                        <i className="mdi mdi-chevron-down" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>اقدامات</DropdownItem>
                        <DropdownItem>اقدامات دیگر</DropdownItem>
                        <DropdownItem>چیز های دیگر</DropdownItem>
                        <div className="dropdown-divider"></div>
                        <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>
                  </div>

                  <div className="btn-group">
                    <ButtonDropdown
                      isOpen={drp_warning1}
                      toggle={() => setDrp_warning1(!drp_warning1)}
                    >
                      <Button id="caret" color="warning">
                        هشدار
                      </Button>
                      <DropdownToggle caret color="warning">
                        <i className="mdi mdi-chevron-down" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>اقدامات</DropdownItem>
                        <DropdownItem>اقدامات دیگر</DropdownItem>
                        <DropdownItem>چیز های دیگر</DropdownItem>
                        <div className="dropdown-divider"></div>
                        <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>
                  </div>

                  <div className="btn-group">
                    <ButtonDropdown
                      isOpen={drp_danger1}
                      toggle={() => setDrp_danger1(!drp_danger1)}
                    >
                      <Button id="caret" color="danger">
                        خطر
                      </Button>
                      <DropdownToggle caret color="danger">
                        <i className="mdi mdi-chevron-down" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>اقدامات</DropdownItem>
                        <DropdownItem>اقدامات دیگر</DropdownItem>
                        <DropdownItem>چیز های دیگر</DropdownItem>
                        <div className="dropdown-divider"></div>
                        <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>اندازه</CardTitle>
                <CardSubtitle className="mb-3">
                  {" "}
                  کشویی دکمه ها با دکمه های همه اندازه ها از جمله کار می کنند
                  دکمه های کشویی پیش فرض و تقسیم
                </CardSubtitle>
                <div className="btn-group mb-2">
                  <ButtonDropdown
                    isOpen={drp_secondary}
                    toggle={() => setDrp_secondary(!drp_secondary)}
                  >
                    <DropdownToggle caret color="primary" className=" btn-lg">
                      دکمه ی بزرگ &nbsp; <i className="mdi mdi-chevron-down" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem>چیز های دیگر</DropdownItem>
                      <div className="dropdown-divider"></div>
                      <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                </div>{" "}
                &nbsp;
                <div className="btn-group mb-2">
                  <ButtonDropdown
                    isOpen={drp_secondary_lg}
                    toggle={() => setDrp_secondary_lg(!drp_secondary_lg)}
                  >
                    <DropdownToggle
                      caret
                      color="secondary"
                      className="btn btn-secondary btn-lg"
                    >
                      دکمه ی بزرگ &nbsp;
                      <i className="mdi mdi-chevron-down" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem>چیز های دیگر در اینجا</DropdownItem>
                      <div className="dropdown-divider"></div>
                      <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                </div>{" "}
                &nbsp;
                <div className="btn-group mb-2">
                  <ButtonDropdown
                    isOpen={drp_secondary_sm}
                    toggle={() => setDrp_secondary_sm(!drp_secondary_sm)}
                  >
                    <DropdownToggle
                      caret
                      color="info"
                      className="btn btn-info btn-sm"
                    >
                      دکمه ی کوچک &nbsp; <i className="mdi mdi-chevron-down" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem>چیز های دیگر</DropdownItem>
                      <div className="dropdown-divider"></div>
                      <DropdownItem href="#">لینک های جداگانه</DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                </div>{" "}
                &nbsp;
                <div className="btn-group mb-2">
                  <ButtonDropdown
                    isOpen={drp_secondary_sm1}
                    toggle={() => setDrp_secondary_sm1(!drp_secondary_sm1)}
                  >
                    <Button className="btn btn-secondary btn-sm">
                      {" "}
                      دکمه ی کوچک &nbsp;
                    </Button>
                    <DropdownToggle
                      caret
                      color="secondary"
                      className="btn btn-secondary btn-sm"
                    >
                      <i className="mdi mdi-chevron-down" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem disabled>اقدامات</DropdownItem>
                      <DropdownItem>اقدامات دیگر</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>اقدامات دیگر</DropdownItem>
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

export default SplitSizing