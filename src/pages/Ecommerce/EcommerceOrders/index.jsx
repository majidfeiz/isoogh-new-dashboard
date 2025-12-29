


import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { isEmpty } from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";
import TableContainer from "../../../components/Common/TableContainer";
import * as Yup from "yup";
import { useFormik } from "formik";
import Spinners from "../../../components/Common/Spinner";

//import components
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import DeleteModal from "../../../components/Common/DeleteModal";

import {
  getOrders as onGetOrders,
  addNewOrder as onAddNewOrder,
  updateOrder as onUpdateOrder,
  deleteOrder as onDeleteOrder,
} from "/src/store/actions";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import EcommerceOrdersModal from "./EcommerceOrdersModal";

import { Button, Col, Row, UncontrolledTooltip, Modal, ModalHeader, ModalBody, Form, Input, FormFeedback, Label, Card, CardBody, FormGroup, Badge } from "reactstrap";
import { ToastContainer } from "react-toastify";
import moment from "moment";

//Import Flatepicker
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";

const EcommerceOrder = () => {
  //meta title
  document.title = "سفارشات | Skote - قالب مدیریتی و داشبورد Vite React ";

  const [modal, setModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [order, setOrder] = useState(null);

  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      orderId: (order && order.orderId) || "",
      billingName: (order && order.billingName) || "",
      orderDate: (order && order.orderDate) || "",
      total: (order && order.total) || "",
      paymentStatus: (order && order.paymentStatus) || "پرداخت شده",
      badgeClass: (order && order.badgeClass) || "success",
      paymentMethod: (order && order.paymentMethod) || "Mastercard",
    },
    validationSchema: Yup.object({
      orderId: Yup.string()
        .matches(/[0-9\.\-\s+\/()]+/, "لطفا شناسه سفارش معتبر را وارد کنید")
        .required("لطفا شناسه سفارش خود را وارد کنید"),
      billingName: Yup.string().required("لطفا نام صورتحساب خود را وارد کنید"),
      orderDate: Yup.string().required("لطفا تاریخ سفارش خود را وارد کنید"),
      total: Yup.string()
        .matches(/[0-9\.\-\s+\/()]+/, "لطفا مقدار معتبر را وارد کنید")
        .required("مقدار کل"),
      paymentStatus: Yup.string().required(
        "لطفا وضعیت پرداخت خود را وارد کنید"
      ),
      badgeClass: Yup.string().required("لطفاً کلاس نشان خود را وارد کنید"),
      paymentMethod: Yup.string().required("لطفا روش پرداخت خود را وارد کنید"),
    }),
    onSubmit: (values) => {
      if (isEdit) {
        const updateOrder = {
          id: order ? order.id : 0,
          orderId: values.orderId,
          billingName: values.billingName,
          orderDate: values.orderDate,
          total: values.total,
          paymentStatus: values.paymentStatus,
          paymentMethod: values.paymentMethod,
          badgeClass: values.badgeClass,
        };
        // update order
        dispatch(onUpdateOrder(updateOrder));
        validation.resetForm();
      } else {
        const newOrder = {
          id: Math.floor(Math.random() * (30 - 20)) + 20,
          orderId: values["orderId"],
          billingName: values["billingName"],
          orderDate: values["orderDate"],
          total: values["total"],
          paymentStatus: values["paymentStatus"],
          paymentMethod: values["paymentMethod"],
          badgeClass: values["badgeClass"],
        };
        // save new order
        dispatch(onAddNewOrder(newOrder));
        validation.resetForm();
      }
      toggle();
    },
  });
  const [transaction, setTransaction] = useState("")

  const toggleViewModal = () => setModal1(!modal1);

  const dispatch = useDispatch();

  const EcommerceOrderProperties = createSelector(
    (state) => state.ecommerce,
    (Ecommerce) => ({
      orders: Ecommerce.orders,
      loading: Ecommerce.loading
    })
  );

  const {
    orders, loading
  } = useSelector(EcommerceOrderProperties);

  const [isLoading, setLoading] = useState(loading)

  useEffect(() => {
    if (orders && !orders.length) {
      dispatch(onGetOrders());
    }
  }, [dispatch, orders]);

  useEffect(() => {
    setOrder(orders);
  }, [orders]);

  useEffect(() => {
    if (!isEmpty(orders) && !!isEdit) {
      setOrder(orders);
      setIsEdit(false);
    }
  }, [orders]);

  const toggle = () => {
    if (modal) {
      setModal(false);
      setOrder(null);
    } else {
      setModal(true);
    }
  };

  const handleOrderClick = (arg) => {
    const order = arg;
    setOrder({
      id: order.id,
      orderId: order.orderId,
      billingName: order.billingName,
      orderDate: order.orderDate,
      total: order.total,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      badgeClass: order.badgeClass,
    });

    setIsEdit(true);

    toggle();
  };

  //delete order
  const [deleteModal, setDeleteModal] = useState(false);

  const onClickDelete = (order) => {
    setOrder(order);
    setDeleteModal(true);
  };

  const handleDeleteOrder = () => {
    if (order && order.id) {
      dispatch(onDeleteOrder(order.id));
      setDeleteModal(false);
      setOrder("");
    }
  };
  const handleOrderClicks = () => {
    setOrder("");
    setIsEdit(false);
    toggle();
  };

  const columns = useMemo(
    () => [
      {
        header: () => {
          return (
            <FormGroup check className="font-size-16">
              <Label check>
                <Input type="checkbox" id="checkAll" />
              </Label>
            </FormGroup>
          );
        },
        accessorKey: "id",
        cell: () => (
          <FormGroup check className="font-size-16">
            <Label check>
              <Input type="checkbox" id="checkAll" />
            </Label>
          </FormGroup>
        ),
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "شماره سفارش",
        accessorKey: "orderId",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          return (
            <Link to="#" className="text-body fw-bold">
              {cellProps.row.original.orderId}
            </Link>
          );
        },
      },
      {
        header: "نام صورتحساب",
        accessorKey: "billingName",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "تاریخ",
        accessorKey: "orderDate",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "مجموع",
        accessorKey: "total",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          return ` ${cellProps.row.original.total}`;
        },
      },
      {
        header: "وضعیت پرداخت",
        accessorKey: "paymentStatus",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          return (
            <Badge
              className={
                "font-size-12 badge-soft-" +
                (cellProps.row.original.paymentStatus === "پرداخت شده"
                  ? "success"
                  : "danger" &&
                    cellProps.row.original.paymentStatus === "Refund"
                  ? "warning"
                  : "danger")
              }
            >
              {cellProps.row.original.paymentStatus}
            </Badge>
          );
        },
      },
      {
        header: "روش پرداخت",
        accessorKey: "paymentMethod",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          return (
            <span>
              <i
                className={
                  cellProps.row.original.paymentMethod === "پی پال"
                    ? "fab fa-cc-paypal me-1"
                    : "" || cellProps.row.original.paymentMethod === "COD"
                    ? "fab fas fa-money-bill-alt me-1"
                    : "" || cellProps.row.original.paymentMethod === "مسترکارت"
                    ? "fab fa-cc-mastercard me-1"
                    : "" || cellProps.row.original.paymentMethod === "ویزاکارت"
                    ? "fab fa-cc-visa me-1"
                    : ""
                }
              />{" "}
              {cellProps.row.original.paymentMethod}
            </span>
          );
        },
      },
      {
        header: "دیدن جزئیات",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cellProps) => {
          return (
            <Button
              type="button"
              color="primary"
              className="btn-sm btn-rounded"
              onClick={() => {
                const orderData = cellProps.row.original;
                toggleViewModal(orderData);
                setTransaction(cellProps.row.original);
              }}
            >
              دیدن جزئیات
            </Button>
          );
        },
      },
      {
        header: "اقدامات",
        accessorKey: "action",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cellProps) => {
          return (
            <div className="d-flex gap-3">
              <Link
                to="#"
                className="text-success"
                onClick={() => {
                  const orderData = cellProps.row.original;
                  handleOrderClick(orderData);
                }}
              >
                <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
                <UncontrolledTooltip placement="top" target="edittooltip">
                  ویرایش
                </UncontrolledTooltip>
              </Link>
              <Link
                to="#"
                className="text-danger"
                onClick={() => {
                  const orderData = cellProps.row.original;
                  onClickDelete(orderData);
                }}
              >
                <i className="mdi mdi-delete font-size-18" id="deletetooltip" />
                <UncontrolledTooltip placement="top" target="deletetooltip">
                  حذف
                </UncontrolledTooltip>
              </Link>
            </div>
          );
        },
      },
    ],
    [handleOrderClick, toggleViewModal]
  );

  return (
    <React.Fragment>
      <EcommerceOrdersModal
        isOpen={modal1}
        toggle={toggleViewModal}
        transaction={transaction}
      />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteOrder}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="تجارت الکترونیک" breadcrumbItem="سفارشات" />
          <Row>
            {isLoading ? (
              <Spinners setLoading={setLoading} />
            ) : (
              <Col xs="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={orders || []}
                      isGlobalFilter={true}
                      isAddButton={true}
                      isCustomPageSize={true}
                      handleUserClick={handleOrderClicks}
                      isPagination={true}
                      SearchPlaceholder="26 ردیف..."
                      buttonClass="btn btn-success btn-rounded waves-effect waves-light mb-2 me-2 addOrder-modal"
                      buttonName="افزودن سفارش جدید"
                      tableClass="align-middle table-nowrap dt-responsive nowrap w-100 table-check dataTable no-footer dtr-inline"
                      theadClass="table-light"
                      pagination="pagination"
                      paginationWrapper="dataTables_paginate paging_simple_numbers pagination-rounded"
                    />
                  </CardBody>
                </Card>
              </Col>
            )}
          </Row>
          <Modal isOpen={modal} toggle={toggle}>
            <ModalHeader toggle={toggle} tag="h4">
              {!!isEdit ? "ویرایش سفارش" : "افزودن سفارش"}
            </ModalHeader>
            <ModalBody>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  validation.handleSubmit();
                  return false;
                }}
              >
                <Row>
                  <Col className="col-12">
                    <div className="mb-3">
                      <Label>شماره سفارش</Label>
                      <Input
                        name="orderId"
                        type="text"
                        placeholder="درج شناسه سفارش"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.orderId || ""}
                        invalid={
                          validation.touched.orderId &&
                          validation.errors.orderId
                            ? true
                            : false
                        }
                      />
                      {validation.touched.orderId &&
                      validation.errors.orderId ? (
                        <FormFeedback type="invalid">
                          {validation.errors.orderId}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label>نام صورتحساب</Label>
                      <Input
                        name="billingName"
                        type="text"
                        placeholder="درج نام صورتحساب"
                        validate={{
                          ضروری: { value: true },
                        }}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.billingName || ""}
                        invalid={
                          validation.touched.billingName &&
                          validation.errors.billingName
                            ? true
                            : false
                        }
                      />
                      {validation.touched.billingName &&
                      validation.errors.billingName ? (
                        <FormFeedback type="invalid">
                          {validation.errors.billingName}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label>تاریخ سفارش</Label>
                      <Flatpickr
                        className="form-control d-block"
                        name="orderDate"
                        placeholder="انتخاب زمان"
                        options={{
                          dateFormat: "d M, Y",
                        }}
                        onChange={(date) =>
                          validation.setFieldValue(
                            "orderDate",
                            moment(date[0]).format("DD MMMM, YYYY")
                          )
                        }
                        value={validation.values.orderDate}
                      />
                      {validation.touched.orderDate &&
                      validation.errors.orderDate ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors.orderDate}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label>مجموع</Label>
                      <Input
                        name="total"
                        type="text"
                        placeholder="درج کل مبلغ"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.total || ""}
                        invalid={
                          validation.touched.total && validation.errors.total
                            ? true
                            : false
                        }
                      />
                      {validation.touched.total && validation.errors.total ? (
                        <FormFeedback type="invalid">
                          {validation.errors.total}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label>وضعیت پرداخت</Label>
                      <Input
                        name="paymentStatus"
                        type="select"
                        className="form-select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.paymentStatus || ""}
                      >
                        <option>پرداخت شده</option>
                        <option>شارژ مجدد</option>
                        <option>بازپرداخت</option>
                      </Input>
                      {validation.touched.paymentStatus &&
                      validation.errors.paymentStatus ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors.paymentStatus}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label>کلاس نشان</Label>
                      <Input
                        name="badgeClass"
                        type="select"
                        className="form-select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.badgeClass || ""}
                      >
                        <option>موفقیت</option>
                        <option>خطر</option>
                        <option>هشدار</option>
                      </Input>
                      {validation.touched.badgeClass &&
                      validation.errors.badgeClass ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors.badgeClass}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label>روش پرداخت</Label>
                      <Input
                        name="paymentMethod"
                        type="select"
                        className="form-select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.paymentMethod || ""}
                      >
                        <option>مسترکارت</option>
                        <option>ویزاکارت</option>
                        <option>پی پال</option>
                        <option>COD</option>
                      </Input>
                      {validation.touched.paymentMethod &&
                      validation.errors.paymentMethod ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors.paymentMethod}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="text-end">
                      <Button
                        color="success"
                        type="submit"
                        className="save-user"
                      >
                        ذخیره
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </ModalBody>
          </Modal>
        </div>
      </div>
      <ToastContainer />
    </React.Fragment>
  );
}
EcommerceOrder.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default EcommerceOrder;
