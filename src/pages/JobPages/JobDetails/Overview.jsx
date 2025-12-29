import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col } from 'reactstrap';

//import images
import adobephotoshop from "../../../assets/images/companies/adobe-photoshop.svg";

const Overview = () => {
    return (
      <React.Fragment>
        <Col xl={3}>
          <Card>
            <CardBody>
              <h5 className="fw-semibold">بررسی اجمالی</h5>

              <div className="table-responsive">
                <table className="table">
                  <tbody>
                    <tr>
                      <th scope="col">عنوان شغل</th>
                      <td scope="col">Magento توسعه دهنده ی</td>
                    </tr>
                    <tr>
                      <th scope="row">سابفه کاری:</th>
                      <td>0-2 Years</td>
                    </tr>
                    <tr>
                      <th scope="row">جای خالی</th>
                      <td>12</td>
                    </tr>
                    <tr>
                      <th scope="row">نوع کار</th>
                      <td>
                        <span className="badge badge-soft-success">
                          تمام وقت
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">وضعیت</th>
                      <td>
                        <span className="badge badge-soft-info">جدید</span>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">تاریخ ارسال</th>
                      <td>25 تیر, 1402</td>
                    </tr>
                    <tr>
                      <th scope="row">تاریخ پایان</th>
                      <td>13 مهر, 1402</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="hstack gap-2">
                <button className="btn btn-soft-primary w-100">
                  اکنون درخواست دهید
                </button>
                <button className="btn btn-soft-danger w-100">
                  با ما تماس بگیرید
                </button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="text-center">
                <img
                  src={adobephotoshop}
                  alt=""
                  height="50"
                  className="mx-auto d-block"
                />
                <h5 className="mt-3 mb-1">نام تجاری قالب</h5>
                <p className="text-muted mb-0">از مهر 1402</p>
              </div>

              <ul className="list-unstyled mt-4">
                <li>
                  <div className="d-flex">
                    <i className="bx bx-phone text-primary fs-4"></i>
                    <div className="ms-3">
                      <h6 className="fs-14 mb-2">شماره</h6>
                      <p className="text-muted fs-14 mb-0">+0932323444</p>
                    </div>
                  </div>
                </li>
                <li className="mt-3">
                  <div className="d-flex">
                    <i className="bx bx-mail-send text-primary fs-4"></i>
                    <div className="ms-3">
                      <h6 className="fs-14 mb-2">ایمیل</h6>
                      <p className="text-muted fs-14 mb-0">
                        themesbrand@gmail.com
                      </p>
                    </div>
                  </div>
                </li>
                <li className="mt-3">
                  <div className="d-flex">
                    <i className="bx bx-globe text-primary fs-4"></i>
                    <div className="ms-3">
                      <h6 className="fs-14 mb-2">وبسایت</h6>
                      <p className="text-muted fs-14 text-break mb-0">
                        www.themesbrand.com
                      </p>
                    </div>
                  </div>
                </li>
                <li className="mt-3">
                  <div className="d-flex">
                    <i className="bx bx-map text-primary fs-4"></i>
                    <div className="ms-3">
                      <h6 className="fs-14 mb-2">موقعیت مکانی</h6>
                      <p className="text-muted fs-14 mb-0">
                        ایران تهران
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
              <div className="mt-4">
                <Link
                  to="#"
                  className="btn btn-soft-primary btn-hover w-100 rounded"
                >
                  <i className="mdi mdi-eye"></i> مشاهده پروفایل
                </Link>
              </div>
            </CardBody>
          </Card>
        </Col>
      </React.Fragment>
    );
}

export default Overview;