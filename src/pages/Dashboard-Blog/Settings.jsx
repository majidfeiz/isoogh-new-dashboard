import React from "react"
import { Link } from "react-router-dom"
import {
  Card,
  CardBody,
  Col,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "reactstrap"

import avatar from "../../assets/images/users/avatar-1.jpg"

const Settings = () => {
  return (
    <React.Fragment>
      <Col xl={4}>
        <Card>
          <CardBody>
            <div className="d-flex">
              <div className="flex-shrink-0 me-3">
                <img
                  src={avatar}
                  alt=""
                  className="avatar-sm rounded-circle img-thumbnail"
                />
              </div>
              <div className="flex-grow-1">
                <div className="d-flex">
                  <div className="flex-grow-1">
                    <div className="text-muted">
                      <h5 className="mb-1">سارا توسلی</h5>
                      <p className="mb-0">UI / UX طراح</p>
                    </div>
                  </div>

                  <UncontrolledDropdown className="flex-shrink-0 ms-2">
                    <DropdownToggle
                      className="btn btn-light btn-sm"
                      color="#eff2f7"
                      type="button"
                    >
                      <i className="bx bxs-cog align-middle me-1"></i> تنظیمات
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <Link className="dropdown-item" to="#">
                        اقدامات
                      </Link>
                      <Link className="dropdown-item" to="#">
                        اقدامات دیگر
                      </Link>
                      <Link className="dropdown-item" to="#">
                        موارد دیگر
                      </Link>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </div>

                <hr />

                <Row>
                  <Col xs={4}>
                    <div>
                      <p className="text-muted text-truncate mb-2">کل پست</p>
                      <h5 className="mb-0">32</h5>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div>
                      <p className="text-muted text-truncate mb-2">
                        دنبال کردن ها
                      </p>
                      <h5 className="mb-0">10k</h5>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="d-flex flex-wrap">
              <h5 className="card-title mb-3 me-2">دنبال کردن ها</h5>

              <UncontrolledDropdown className="ms-auto">
                <DropdownToggle
                  tag="a"
                  href="#"
                  className="text-muted font-size-16"
                  color="white"
                  type="button"
                >
                  <i className="mdi mdi-dots-horizontal"></i>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <Link className="dropdown-item" to="#">
                    اقدامات
                  </Link>
                  <Link className="dropdown-item" to="#">
                    اقدامات دیگر
                  </Link>
                  <Link className="dropdown-item" to="#">
                    موارد دیگر
                  </Link>
                  <div className="dropdown-divider"></div>
                  <Link className="dropdown-item" to="#">
                    لینک های جداگانه
                  </Link>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>

            <div className="d-flex flex-wrap">
              <div>
                <p className="text-muted mb-1">مجموع دنبال کردن ها</p>
                <h4 className="mb-3">10,512</h4>
                <p className="text-success mb-0">
                  <span>
                    0.6 % <i className="mdi mdi-arrow-top-right ms-1"></i>
                  </span>
                </p>
              </div>
              <div className="ms-auto align-self-end">
                <i className="bx bx-group display-4 text-light"></i>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="text-center">
              <div className="avatar-md mx-auto mb-4">
                <div className="avatar-title bg-light rounded-circle text-primary h1">
                  <i className="mdi mdi-email-open"></i>
                </div>
              </div>

              <Row className="justify-content-center">
                <Col xl={10}>
                  <h4 className="text-primary"> دنبال کردن!</h4>
                  <p className="text-muted font-size-14 mb-4">
                    برای به روز ماندن در نامه جدید ما عضو و اعلان دریافت
                    کنید
                  </p>

                  <div className="input-group bg-light rounded">
                    <input
                      type="email"
                      className="form-control bg-transparent border-0"
                      placeholder="ایمیل خود را وارد کنید"
                      aria-label="Recipient's username"
                      aria-describedby="button-addon2"
                    />
                    <div className="input-group-append">
                      <button
                        className="btn btn-primary rounded"
                        type="button"
                        id="button-addon2"
                      >
                        <i className="bx bxs-paper-plane"></i>
                      </button>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
}

export default Settings
