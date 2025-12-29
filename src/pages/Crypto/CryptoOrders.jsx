import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Badge, Button, Card, CardBody, Col, Container, Form, FormGroup, Label, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { connect } from "react-redux";
import withRouter from "../../components/Common/withRouter";

import TableContainer from "../../components/Common/TableContainer";

// flatpickr
import "flatpickr/dist/themes/material_blue.css";
import FlatPickr from "react-flatpickr";

import "/src/assets/scss/datatables.scss";

//Import Breadcrumb
import Breadcrumbs from "/src/components/Common/Breadcrumb";
import { getCryptoOrders } from "/src/store/crypto/actions";
import { handleSearchData } from "../../components/Common/searchFile";
import Spinners from "../../components/Common/Spinner";

const CryptoOrders = (props) => {
  //meta title
  document.title = "سفارشات | Skote - قالب مدیریتی و داشبورد Vite React ";

  const { orders, onGetOrders, loading } = props;
  const [cryptoOrder, setCryptoOrder] = useState()
  const [activeTab, setActiveTab] = useState("1");
  const [startDate, setStartDate] = useState(new Date('04-03-2020'));
  const [isLoading, setLoading] = useState(loading)

  useEffect(() => {
    onGetOrders();
  }, [onGetOrders]);

  useEffect(() => {
    setCryptoOrder(orders)
  }, [orders])

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  // search 
  const handleSelect = (ele) => {
    let search = ele.target.value;
    if (search === "All") {
      setCryptoOrder(orders)
    } else {
      handleSearchData({ setState: setCryptoOrder, data: orders, item: search })
    }
  };


  const columns = useMemo(
    () => [
      {
        header: "تاریخ",
        accessorKey: "pdate",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "نوع",
        accessorKey: "type",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "سکه",
        accessorKey: "coin",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "ارزش",
        accessorKey: "value",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "ارزش به تومان",
        accessorKey: "valueInUsd",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "وضعیت",
        accessorKey: "status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          switch (cellProps.row.original.status) {
            case "تکمیل شده":
              return (
                <Badge className="bg-success font-size-10">کامل شده</Badge>
              );
            case "در انتظار":
              return (
                <Badge className="bg-warning font-size-10">پرداخت شده</Badge>
              );
            case "ناموفق":
              return <Badge className="bg-danger font-size-10">ناموفق</Badge>;
          }
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumb */}
          <Breadcrumbs title="کریپتو" breadcrumbItem="سفارشات" />

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <h4 className="card-title mb-3">سفارشات</h4>
                  {isLoading ? (
                    <Spinners setLoading={setLoading} />
                  ) : (
                    <>
                      <ul
                        className="nav nav-tabs nav-tabs-custom"
                        role="tablist"
                      >
                        <NavItem>
                          <NavLink
                            className={classnames({
                              active: activeTab === "1",
                            })}
                            onClick={() => {
                              toggleTab("1");
                            }}
                          >
                            همه سفارشات
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={classnames({
                              active: activeTab === "2",
                            })}
                            onClick={() => {
                              toggleTab("2");
                            }}
                          >
                            در حال پردازش
                          </NavLink>
                        </NavItem>
                      </ul>

                      <TabContent activeTab={activeTab} className="p-3">
                        <TabPane tabId="1" id="all-order">
                          <Form>
                            <Row className="mb-4">
                              <div className="col-xl col-sm-6">
                                <FormGroup className="mb-0">
                                  <Label>تاریخ :</Label>
                                  <FlatPickr
                                    className="form-control"
                                    name="joiningDate"
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    placeholder="انتخاب زمان"
                                    options={{
                                      dateFormat: "d M, Y",
                                    }}
                                  />
                                </FormGroup>
                              </div>

                              <Col sm={6} className="col-xl">
                                <FormGroup className="mb-3">
                                  <Label className="form-label">سکه</Label>
                                  <select
                                    className="form-control select2-search-disable"
                                    onChange={(e) => handleSelect(e)}
                                  >
                                    <option defaultValue="all">همه </option>
                                    <option value="Bitcoin">بیت کوین</option>
                                    <option value="Ethereum">اتریوم</option>
                                    <option value="Litecoin">لایت کوین</option>
                                  </select>
                                </FormGroup>
                              </Col>

                              <Col sm={6} className="col-xl">
                                <FormGroup className="mb-3">
                                  <Label className="form-label">نوع</Label>
                                  <select
                                    className="form-control select2-search-disable"
                                    onChange={(e) => handleSelect(e)}
                                  >
                                    <option defaultValue="all">همه </option>
                                    <option value="Buy">خرید </option>
                                    <option value="Sell">فروش</option>
                                  </select>
                                </FormGroup>
                              </Col>

                              <Col sm={6} className="col-xl">
                                <FormGroup className="mb-3">
                                  <Label className="form-label">وضعیت</Label>
                                  <select
                                    className="form-control select2-search-disable"
                                    onChange={(e) => handleSelect(e)}
                                  >
                                    <option defaultValue="all">همه </option>
                                    <option value="Completed">کامل شده</option>
                                    <option value="Pending">انتظار</option>
                                  </select>
                                </FormGroup>
                              </Col>

                              <div className="col-xl col-sm-6 align-self-end">
                                <div className="mb-3">
                                  <Button
                                    type="button"
                                    color="primary"
                                    className="w-md"
                                  >
                                    فیلتر
                                  </Button>
                                </div>
                              </div>
                            </Row>
                          </Form>

                          <TableContainer
                            columns={columns}
                            data={cryptoOrder || []}
                            isCustomPageSize={true}
                            isPagination={true}
                            isGlobalFilter={true}
                            SearchPlaceholder="24 ردیف.."
                            paginationWrapper="dataTables_paginate paging_simple_numbers"
                            pagination="pagination"
                            tableClass="table-hover table-nowrap datatable dt-responsive nowrap dataTable no-footer dtr-inline"
                          />
                        </TabPane>
                        <TabPane tabId="2" id="processing">
                          <div>
                            <TableContainer
                              columns={columns}
                              data={cryptoOrder || []}
                              isCustomPageSize={true}
                              isPagination={true}
                              isGlobalFilter={true}
                              pagination="pagination"
                              SearchPlaceholder="جستجو .."
                              paginationWrapper="dataTables_paginate paging_simple_numbers"
                              tableClass="table-hover table-nowrap datatable dt-responsive nowrap dataTable no-footer dtr-inline"
                            />
                          </div>
                        </TabPane>
                      </TabContent>
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

CryptoOrders.propTypes = {
  orders: PropTypes.array,
  onGetOrders: PropTypes.func,
};

const mapStateToProps = ({ crypto }) => ({
  orders: crypto.orders,
  loading: crypto.loading
});

const mapDispatchToProps = (dispatch) => ({
  onGetOrders: () => dispatch(getCryptoOrders()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CryptoOrders));
