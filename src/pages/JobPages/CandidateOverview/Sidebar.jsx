import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col } from 'reactstrap';

const Sidebar = () => {
    return (
      <React.Fragment>
        <Col lg={3}>
          <Card>
            <CardBody>
              <ul className="list-unstyled vstack gap-3 mb-0">
                <li>
                  <div className="d-flex">
                    <i className="bx bx-calendar font-size-18 text-primary"></i>
                    <div className="ms-3">
                      <h6 className="mb-1 fw-semibold">سابقه کاری:</h6>
                      <span className="text-muted">2+ سال</span>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="d-flex">
                    <i className="bx bx-money font-size-18 text-primary"></i>
                    <div className="ms-3">
                      <h6 className="mb-1 fw-semibold">حقوق جاری:</h6>
                      <span className="text-muted">تومان 3451</span>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="d-flex">
                    <i className="bx bx-money font-size-18 text-primary"></i>
                    <div className="ms-3">
                      <h6 className="mb-1 fw-semibold">حقوق مورد انتظار:</h6>
                      <span className="text-muted">تومان 4000+</span>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="d-flex">
                    <i className="bx bx-user font-size-18 text-primary"></i>
                    <div className="ms-3">
                      <h6 className="mb-1 fw-semibold">جنسیت:</h6>
                      مرد
                    </div>
                  </div>
                </li>
                <li>
                  <div className="d-flex">
                    <i className="mdi mdi-book-education font-size-18 text-primary"></i>
                    <div className="ms-3">
                      <h6 className="mb-1 fw-semibold">صلاحیت:</h6>
                      <span className="text-muted">کارشناسی ارشد</span>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="d-flex">
                    <i className="mdi mdi-google-translate font-size-18 text-primary"></i>
                    <div className="ms-3">
                      <h6 className="mb-1 fw-semibold">زبان ها:</h6>
                      <span className="text-muted">انگلیسی,فرانسوی</span>
                    </div>
                  </div>
                </li>
                <li className="hstack gap-2 mt-3">
                  <Link to="#!" className="btn btn-soft-primary w-100">
                    اکنون استخدام کنید
                  </Link>
                  <Link to="#!" className="btn btn-soft-danger w-100">
                    با ما تماس بگیرید
                  </Link>
                </li>
              </ul>
            </CardBody>
          </Card>
        </Col>
      </React.Fragment>
    );
}

export default Sidebar; 