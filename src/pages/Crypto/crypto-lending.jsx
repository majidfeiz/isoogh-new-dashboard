import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  CardBody,
  Table,
} from "reactstrap";
import { Link } from "react-router-dom";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const CryptoLending = props => {

  //meta title
  document.title = "Lending | Skote - قالب مدیریتی و داشبورد Vite React ";

  const [assets] = useState([
    {
      icon: "mdi mdi-bitcoin",
      color: "warning",
      title: "BTC",
      investRate: "1.2601",
      investPrice: "6225.74",
      price: "7525.47",
      loansRate: "0.1512",
      loansPrice: "742.32",
      totalRate: "4.2562",
      totalPrice: "6425.42",
    },
    {
      icon: "mdi mdi-ethereum",
      color: "primary",
      title: "ETH",
      investRate: "0.0814",
      investPrice: "3256.29",
      price: "4235.78",
      loansRate: "0.0253",
      loansPrice: "675.04",
      totalRate: "0.0921",
      totalPrice: "4536.24",
    },
    {
      icon: "mdi mdi-litecoin",
      color: "info",
      title: "LTC",
      investRate: "0.0682",
      investPrice: "2936.14",
      price: "3726.06",
      loansRate: "0.0234",
      loansPrice: "523.17",
      totalRate: "0.0823",
      totalPrice: "3254.23",
    },
    {
      icon: "mdi mdi-bitcoin",
      color: "warning",
      title: "BTC",
      investRate: "1.2601",
      investPrice: "6225.74",
      price: "7525.47",
      loansRate: "0.1512",
      loansPrice: "742.32",
      totalRate: "4.2562",
      totalPrice: "6425.42",
    },
    {
      icon: "mdi mdi-ethereum",
      color: "primary",
      title: "ETH",
      investRate: "0.0814",
      investPrice: "3256.29",
      price: "4235.78",
      loansRate: "0.0253",
      loansPrice: "675.04",
      totalRate: "0.0921",
      totalPrice: "4536.24",
    },
  ]);

  const [isMenu, setIsMenu] = useState(false);

  const toggleMenu = () => {
    setIsMenu(!isMenu);
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumb */}
          <Breadcrumbs title="کریپتو" breadcrumbItem="امانت دادن" />

          <Row>
            <Col xl="4">
              <Card>
                <CardBody className="border-bottom">
                  <Dropdown
                    isOpen={isMenu}
                    toggle={toggleMenu}
                    className="float-end ms-2"
                  >
                    <DropdownToggle tag="a" className="text-muted">
                      <i className="mdi mdi-dots-horizontal font-size-18" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem href="#">اقدامات</DropdownItem>
                      <DropdownItem href="#">اقدامات دیگر</DropdownItem>
                      <DropdownItem href="#">چیز های دیگر</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <div>
                    <div className="mb-4 me-3">
                      <i className="mdi mdi-account-circle text-primary h1" />
                    </div>

                    <div>
                      <h5>سارا توسلی</h5>
                      <p className="text-muted mb-1">sara@abc.com</p>
                      <p className="text-muted mb-0">شماره شناسایی: #SK0234</p>
                    </div>
                  </div>
                </CardBody>
                <CardBody className="border-bottom">
                  <div>
                    <Row>
                      <Col sm="6">
                        <div>
                          <p className="text-muted mb-2">موجودی موجود</p>
                          <h5>تومان 9148.00</h5>
                        </div>
                      </Col>
                      <Col sm="6">
                        <div className="text-sm-end mt-4 mt-sm-0">
                          <p className="text-muted mb-2">از ماه گذشته</p>
                          <h5>
                            + تومان 215.53{" "}
                            <span className="badge bg-success ms-1 align-bottom">
                              + 1.3 %
                            </span>
                          </h5>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h4 className="card-title mb-4">چطور کار میکند</h4>

                  <div>
                    <ul className="verti-timeline list-unstyled">
                      <li className="event-list">
                        <div className="event-timeline-dot">
                          <i className="bx bx-left-arrow-circle" />
                        </div>
                        <div className="d-flex">
                          <div className="me-3">
                            <i className="bx bx-user-plus h2 text-primary" />
                          </div>
                          <div className="flex-grow-1">
                            <div>
                              <h5 className="font-size-14">ثبت حساب</h5>
                              <p className="text-muted">
                                زبان مشترک جدید ساده تر و ساده تر خواهد بود منظم
                                نسبت به موجود
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li className="event-list">
                        <div className="event-timeline-dot">
                          <i className="bx bx-left-arrow-circle" />
                        </div>
                        <div className="d-flex">
                          <div className="me-3">
                            <i className="bx bx-copy-alt h2 text-primary" />
                          </div>
                          <div className="flex-grow-1">
                            <div>
                              <h5 className="font-size-14">
                                سپرده را انتخاب کنید
                              </h5>
                              <p className="text-muted">
                                برای دستیابی به این امر، داشتن آن ضروری خواهد
                                بود دستور زبان یکنواخت
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>

                      <li className="event-list">
                        <div className="event-timeline-dot">
                          <i className="bx bx-left-arrow-circle" />
                        </div>
                        <div className="d-flex">
                          <div className="me-3">
                            <i className="bx bx-cloud-download h2 text-primary" />
                          </div>
                          <div className="flex-grow-1">
                            <div>
                              <h5 className="font-size-14">کسب درآمد</h5>
                              <p className="text-muted">
                                زبان مشترک جدید ساده تر و ساده تر خواهد بود منظم
                                نسبت به موجود
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl="8">
              <Card>
                <CardBody>
                  <h4 className="card-title">سپرده ها</h4>

                  <Row>
                    <Col lg="4">
                      <div className="border p-3 rounded mt-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="avatar-xs me-3">
                            <span className="avatar-title rounded-circle bg-warning-subtle text-warning font-size-18">
                              <i className="mdi mdi-bitcoin" />
                            </span>
                          </div>
                          <h5 className="font-size-14 mb-0">بیت کوین</h5>
                        </div>

                        <Row>
                          <div className="col-lg-6">
                            <div className="text-muted mt-3">
                              <p>بازده سالانه</p>
                              <h4>4.05 %</h4>
                              <p className="mb-0">0.00745 BTC</p>
                            </div>
                          </div>

                          <div className="col-lg-6 align-self-end">
                            <div className="float-end mt-3">
                              <Link to="#" className="btn btn-primary">
                                انتخاب
                              </Link>
                            </div>
                          </div>
                        </Row>
                      </div>
                    </Col>
                    <Col lg="4">
                      <div className="border p-3 rounded mt-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="avatar-xs me-3">
                            <span className="avatar-title rounded-circle bg-primary text-primary bg-primary-subtle font-size-18">
                              <i className="mdi mdi-ethereum" />
                            </span>
                          </div>
                          <h5 className="font-size-14 mb-0">اتریوم</h5>
                        </div>

                        <Row>
                          <div className="col-lg-6">
                            <div className="text-muted mt-3">
                              <p>بازده سالانه</p>
                              <h4>5.08 %</h4>
                              <p className="mb-0">0.0056 ETH</p>
                            </div>
                          </div>

                          <div className="col-lg-6 align-self-end">
                            <div className="float-end mt-3">
                              <Link to="#" className="btn btn-primary">
                                انتخاب
                              </Link>
                            </div>
                          </div>
                        </Row>
                      </div>
                    </Col>
                    <Col lg="4">
                      <div className="border p-3 rounded mt-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="avatar-xs me-3">
                            <span className="avatar-title rounded-circle bg-info-subtle text-info font-size-18">
                              <i className="mdi mdi-litecoin" />
                            </span>
                          </div>
                          <h5 className="font-size-14 mb-0">لابت کوین</h5>
                        </div>

                        <Row>
                          <div className="col-lg-6">
                            <div className="text-muted mt-3">
                              <p>باده سالانه</p>
                              <h4>4.12 %</h4>
                              <p className="mb-0">0.00245 LTC</p>
                            </div>
                          </div>

                          <div className="col-lg-6 align-self-end">
                            <div className="float-end mt-3">
                              <Link to="#" className="btn btn-primary">
                                انتخاب
                              </Link>
                            </div>
                          </div>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <h4 className="card-title mb-4">دارایی های من</h4>

                  <div className="table-responsive">
                    <Table className="table table-nowrap align-middle mb-0">
                      <thead>
                        <tr>
                          <th scope="col">رمز</th>
                          <th scope="col">قیمت</th>
                          <th scope="col">سرمایه گذاری</th>
                          <th scope="col">وام</th>
                          <th scope="col" colSpan="2">
                            مجموع
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {assets.map((asset, key) => (
                          <tr key={key}>
                            <th scope="row">
                              <div className="d-flex align-items-center">
                                <div className="avatar-xs me-3">
                                  <span
                                    className={
                                      "avatar-title rounded-circle bg-" +
                                      asset.color +
                                      "-subtle text-" +
                                      asset.color +
                                      " font-size-18"
                                    }
                                  >
                                    <i className={asset.icon} />
                                  </span>
                                </div>
                                <span>{asset.title}</span>
                              </div>
                            </th>
                            <td>
                              <div className="text-muted">تومان {asset.price}</div>
                            </td>
                            <td>
                              <h5 className="font-size-14 mb-1">
                                {asset.investRate}
                              </h5>
                              <div className="text-muted">
                                تومان{asset.investPrice}
                              </div>
                            </td>
                            <td>
                              <h5 className="font-size-14 mb-1">
                                {asset.loansRate}
                              </h5>
                              <div className="text-muted">
                                تومان{asset.loansPrice}
                              </div>
                            </td>
                            <td>
                              <h5 className="font-size-14 mb-1">
                                {asset.totalRate}
                              </h5>
                              <div className="text-muted">
                                تومان{asset.totalPrice}
                              </div>
                            </td>
                            <td style={{ width: "120px" }}>
                              <Link
                                to="#"
                                className="btn btn-primary btn-sm w-xs"
                              >
                                مشاهده
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
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

export default CryptoLending;
