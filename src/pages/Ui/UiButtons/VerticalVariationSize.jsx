import React, { useState } from "react";
import { Button, ButtonDropdown, Card, CardBody, CardTitle, Col, DropdownItem, DropdownMenu, DropdownToggle, Row } from "reactstrap";

const VerticalVariationSize = () => {

    const [drp_link, setDrp_link] = useState(false);
    return (
      <React.Fragment>
        <Row>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>سایز بندی</CardTitle>
                <p className="card-title-desc">
                  به جای اعمال کلاس های اندازه دکمه برای هر دکمه در a گروه، فقط
                  اضافه کنید{" "}
                  <code className="highlighter-rouge">.btn-group-*</code> به هر{" "}
                  <code className="highlighter-rouge">.btn-group</code>, از جمله
                  هر یک در هنگام تودرتو کردن چندین گروه
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <div className="btn-group btn-group-lg">
                    <Button type="button" color="primary">
                      چپ
                    </Button>
                    <Button type="button" color="primary">
                      وسط
                    </Button>
                    <Button type="button" color="primary">
                      راست
                    </Button>
                  </div>

                  <div className="btn-group btn-group-lg">
                    <Button type="button" color="outline-primary">
                      چپ
                    </Button>
                    <Button type="button" color="outline-primary">
                      وسط
                    </Button>
                    <Button type="button" color="outline-primary">
                      راست
                    </Button>
                  </div>
                </div>

                <br />

                <div className="d-flex flex-wrap gap-3">
                  <div className="btn-group">
                    <Button type="button" color="secondary">
                      چپ
                    </Button>
                    <Button type="button" color="secondary">
                      وسط
                    </Button>
                    <Button type="button" color="secondary">
                      راست
                    </Button>
                  </div>
                  <div className="btn-group">
                    <Button type="button" color="outline-secondary">
                      چپ
                    </Button>
                    <Button type="button" color="outline-secondary">
                      وسط
                    </Button>
                    <Button type="button" color="outline-secondary">
                      راست
                    </Button>
                  </div>
                </div>

                <br />

                <div className="d-flex flex-wrap gap-3">
                  <div
                    className="btn-group btn-group-sm"
                    role="group"
                    aria-label="Basic example"
                  >
                    <Button type="button" color="danger">
                      چپ
                    </Button>
                    <Button type="button" color="danger">
                      وسط
                    </Button>
                    <Button type="button" color="danger">
                      راست
                    </Button>
                  </div>

                  <div
                    className="btn-group btn-group-sm"
                    role="group"
                    aria-label="Basic example"
                  >
                    <Button type="button" color="outline-danger">
                      چپ
                    </Button>
                    <Button type="button" color="outline-danger">
                      وسط
                    </Button>
                    <Button type="button" color="outline-danger">
                      راست
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>تنوع عمودی</CardTitle>
                <p className="card-title-desc">
                  کاری کنید که مجموعه‌ای از دکمه‌ها به‌جای اینکه به‌صورت عمودی
                  روی هم چیده شوند به صورت افقی. منوی بازشو دکمه تقسیم در اینجا
                  پشتیبانی نمی شود
                </p>
                <div className="d-flex flex-wrap gap-3 align-items-center">
                  <div
                    className="btn-group-vertical"
                    role="group"
                    aria-label="Vertical button group"
                  >
                    <Button
                      type="button"
                      color="secondary"
                      className="btn btn-secondary"
                    >
                      دکمه
                    </Button>

                    <ButtonDropdown
                      isOpen={drp_link}
                      toggle={() => {
                        setDrp_link(!drp_link);
                      }}
                    >
                      <DropdownToggle caret color="secondary">
                        کشویی <i className="mdi mdi-chevron-down"></i>
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>لینک کشویی</DropdownItem>
                        <DropdownItem>لینک کشویی</DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>

                    <Button
                      color="secondary"
                      type="button"
                      className="btn btn-secondary"
                    >
                      دکمه
                    </Button>
                    <Button
                      color="secondary"
                      type="button"
                      className="btn btn-secondary"
                    >
                      دکمه
                    </Button>
                  </div>

                  <div className="btn-group-vertical">
                    <input
                      type="radio"
                      className="btn-check"
                      name="vbtn-radio"
                      id="vbtn-radio1"
                      autoComplete="off"
                      defaultChecked
                    />
                    <label
                      className="btn btn-outline-danger"
                      htmlFor="vbtn-radio1"
                    >
                      Radio 1
                    </label>
                    <input
                      type="radio"
                      className="btn-check"
                      name="vbtn-radio"
                      id="vbtn-radio2"
                      autoComplete="off"
                    />{" "}
                    <label
                      className="btn btn-outline-danger"
                      htmlFor="vbtn-radio2"
                    >
                      Radio 2
                    </label>
                    <input
                      type="radio"
                      className="btn-check"
                      name="vbtn-radio"
                      id="vbtn-radio3"
                      autoComplete="off"
                    />
                    <label
                      className="btn btn-outline-danger"
                      htmlFor="vbtn-radio3"
                    >
                      Radio 3
                    </label>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default VerticalVariationSize;