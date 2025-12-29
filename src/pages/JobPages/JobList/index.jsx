import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isEmpty } from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";
import TableContainer from "../../../components/Common/TableContainer";
import * as Yup from "yup";
import { useFormik } from "formik";

import Breadcrumbs from "../../../components/Common/Breadcrumb";
import DeleteModal from "../../../components/Common/DeleteModal";

import {
  getJobList as onGetJobList,
  addNewJobList as onAddNewJobList,
  updateJobList as onUpdateJobList,
  deleteJobList as onDeleteJobList,
} from "/src/store/actions";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";

import { Col, Row, UncontrolledTooltip, Modal, ModalHeader, ModalBody, Form, Input, FormFeedback, Label, Card, CardBody, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge } from "reactstrap";
import Spinners from "../../../components/Common/Spinner";
import { ToastContainer } from "react-toastify";

const JobList = () => {
  //meta title
  document.title = "Jobs List | Skote - قالب مدیریتی و داشبورد Vite React ";

  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [job, setJob] = useState(null);

  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      jobId: (job && job.jobId) || "",
      jobTitle: (job && job.jobTitle) || "",
      companyName: (job && job.companyName) || "",
      location: (job && job.location) || "",
      experience: (job && job.experience) || "",
      position: (job && job.position) || "",
      type: (job && job.type) || "Full Time",
      status: (job && job.status) || "Active",
    },
    validationSchema: Yup.object({
      jobId: Yup.string()
        .required("لطفا شناسه شغلی معتبر را وارد کنید")
        .required("لطفا شناسه شغلی خود را وارد کنید"),
      jobTitle: Yup.string().required("لطفا عنوان شغلی خود را وارد کنید"),
      companyName: Yup.string().required("لطفا نام شرکت خود را وارد کنید"),
      location: Yup.string().required("لطفا مکان خود را وارد کنید"),
      experience: Yup.string().required("لطفا سابقه کاری خود را وارد کنید"),
      position: Yup.string().required("لطفا موقعیت خود را وارد کنید"),
      type: Yup.string().required("لطفا نوع خود را وارد کنید"),
      status: Yup.string().required("لطفا وضعیت خود را وارد کنید"),
    }),
    onSubmit: (values) => {
      if (isEdit) {
        const updateJobList = {
          id: job ? job.id : 0,
          jobId: values.jobId,
          jobTitle: values.jobTitle,
          companyName: values.companyName,
          location: values.location,
          experience: values.experience,
          position: values.position,
          type: values.type,
          postedDate: "02 اردیبهشت 1401",
          lastDate: "25 خرداد 1401",
          status: values.status,
        };
        // update Job
        dispatch(onUpdateJobList(updateJobList));
        validation.resetForm();
      } else {
        const newJobList = {
          id: Math.floor(Math.random() * (30 - 20)) + 20,
          jobId: values["jobId"],
          jobTitle: values["jobTitle"],
          companyName: values["companyName"],
          location: values["location"],
          experience: values["experience"],
          position: values["position"],
          type: values["type"],
          postedDate: "02 June 2021",
          lastDate: "25 June 2021",
          status: values["status"],
        };
        // save new Job
        dispatch(onAddNewJobList(newJobList));
        validation.resetForm();
      }
      toggle();
    },
  });

  const dispatch = useDispatch();

  const JobsJobsProperties = createSelector(
    (state) => state.JobReducer,
    (jobReducer) => ({
      jobs: jobReducer.jobs,
      loading: jobReducer.loading
    })
  );

  const { jobs, loading } = useSelector(JobsJobsProperties);
  const [isLoading, setLoading] = useState(loading)

  useEffect(() => {
    if (jobs && !jobs.length) {
      dispatch(onGetJobList());
    }
  }, [dispatch, jobs]);

  useEffect(() => {
    if (!isEmpty(jobs) && !!isEdit) {
      setIsEdit(false);
    }
  }, [jobs]);

  const toggle = () => {
    if (modal) {
      setModal(false);
      setJob(null);
    } else {
      setModal(true);
    }
  };

  const handleJobClick = (arg) => {
    const job = arg;
    setJob({
      id: job.id,
      jobId: job.jobId,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      location: job.location,
      experience: job.experience,
      position: job.position,
      type: job.type,
      status: job.status,
    });

    setIsEdit(true);

    toggle();
  };

  //delete Job
  const [deleteModal, setDeleteModal] = useState(false);

  const onClickDelete = (job) => {
    setJob(job);
    setDeleteModal(true);
  };

  const handleDeletejob = () => {
    if (job && job.id) {
      dispatch(onDeleteJobList(job.id));
      setDeleteModal(false);
      setJob("")
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "No",
        accessorKey: "id",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          return (
            <Link to="#" className="text-body fw-bold">
              {cellProps.row.original.id}
            </Link>
          );
        },
      },
      {
        header: "نام شغل",
        accessorKey: "jobTitle",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "نام شرکت",
        accessorKey: "companyName",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "مکان",
        enableColumnFilter: false,
        enableSorting: true,
        accessorKey: "location",
      },
      {
        header: "سابقه کاری",
        enableColumnFilter: false,
        enableSorting: true,
        accessorKey: "experience",
      },
      {
        header: "",
        enableColumnFilter: false,
        enableSorting: true,
        accessorKey: "موقعیت",
      },
      {
        header: "Type",
        accessorKey: "type",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          switch (cellProps.row.original.type) {
            case "Full Time":
              return <span className="badge badge-soft-success">تمام وقت</span>;
            case "Part Time":
              return <span className="badge badge-soft-danger">پاره وقت</span>;
            case "Freelance":
              return <span className="badge badge-soft-info">فریلنسر</span>;
            default:
              return <span className="badge badge-soft-warning">کارآموزی</span>;
          }
        },
      },
      {
        header: "تاریخ ارسال",
        enableColumnFilter: false,
        enableSorting: true,
        accessorKey: "postedDate",
      },
      {
        header: "آخرین تاریخ",
        enableColumnFilter: false,
        enableSorting: true,
        accessorKey: "lastDate",
      },
      {
        header: "وضعیت",
        accessorKey: "status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          switch (cellProps.row.original.status) {
            case "فعال":
              return <Badge className="bg-success">فعال</Badge>;
            case "جدید":
              return <Badge className="bg-info">جدید</Badge>;
            case "بستن":
              return <Badge className="bg-danger">بستن</Badge>;
          }
        },
      },
      {
        header: "اقدامات",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          return (
            <ul className="list-unstyled hstack gap-1 mb-0">
              <li data-bs-toggle="tooltip" data-bs-placement="top" title="View">
                <Link
                  to="/job-details"
                  className="btn btn-sm btn-soft-primary"
                  id={`viewtooltip-${cellProps.row.original.id}`}
                >
                  <i className="mdi mdi-eye-outline" />
                </Link>
              </li>
              <UncontrolledTooltip
                placement="top"
                target={`viewtooltip-${cellProps.row.original.id}`}
              >
                مشاهده
              </UncontrolledTooltip>

              <li>
                <Link
                  to="#"
                  className="btn btn-sm btn-soft-info"
                  onClick={() => {
                    const jobData = cellProps.row.original;
                    handleJobClick(jobData);
                  }}
                  id={`edittooltip-${cellProps.row.original.id}`}
                >
                  <i className="mdi mdi-pencil-outline" />
                  <UncontrolledTooltip
                    placement="top"
                    target={`edittooltip-${cellProps.row.original.id}`}
                  >
                    ویرایش
                  </UncontrolledTooltip>
                </Link>
              </li>

              <li>
                <Link
                  to="#"
                  className="btn btn-sm btn-soft-danger"
                  onClick={() => {
                    const jobData = cellProps.row.original;
                    onClickDelete(jobData);
                  }}
                  id={`deletetooltip-${cellProps.row.original.id}`}
                >
                  <i className="mdi mdi-delete-outline" />
                  <UncontrolledTooltip
                    placement="top"
                    target={`deletetooltip-${cellProps.row.original.id}`}
                  >
                    حذف
                  </UncontrolledTooltip>
                </Link>
              </li>
            </ul>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeletejob}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="مشاغل" breadcrumbItem="لیست مشاغل" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody className="border-bottom">
                    <div className="d-flex align-items-center">
                      <h5 className="mb-0 card-title flex-grow-1">
                        لیست مشاغل
                      </h5>
                      <div className="flex-shrink-0">
                        <Link
                          to="#!"
                          onClick={() => setModal(true)}
                          className="btn btn-primary me-1"
                        >
                          اضافه کردن شغل جدید
                        </Link>
                        <Link to="#!" className="btn btn-light me-1">
                          <i className="mdi mdi-refresh"></i>
                        </Link>
                        <UncontrolledDropdown className="dropdown d-inline-block me-1">
                          <DropdownToggle
                            type="menu"
                            className="btn btn-success"
                            id="dropdownMenuButton1"
                          >
                            <i className="mdi mdi-dots-vertical"></i>
                          </DropdownToggle>
                          <DropdownMenu className="dropdown-menu-end">
                            <li>
                              <DropdownItem href="#">اقدامات</DropdownItem>
                            </li>
                            <li>
                              <DropdownItem href="#">اقدامات دیگر</DropdownItem>
                            </li>
                            <li>
                              <DropdownItem href="#">چیز های دیگر</DropdownItem>
                            </li>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </CardBody>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={jobs || []}
                      isCustomPageSize={true}
                      isGlobalFilter={true}
                      isJobListGlobalFilter={true}
                      isPagination={true}
                      SearchPlaceholder="جستجو برای ..."
                      tableClass="align-middle table-nowrap dt-responsive nowrap w-100 table-check dataTable no-footer dtr-inline mt-4 border-top"
                      pagination="pagination"
                      paginationWrapper="dataTables_paginate paging_simple_numbers pagination-rounded"
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
          <Modal isOpen={modal} toggle={toggle}>
            <ModalHeader toggle={toggle} tag="h4">
              {!!isEdit ? "ویرایش شغل" : "افزودن شغل"}
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
                      <Label className="form-label"> شناسه شغل</Label>
                      <Input
                        name="jobId"
                        type="text"
                        placeholder="شناسه شغل را وارد کنید"
                        validate={{
                          required: { value: true },
                        }}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.jobId || ""}
                        invalid={
                          validation.touched.jobId && validation.errors.jobId
                            ? true
                            : false
                        }
                      />
                      {validation.touched.jobId && validation.errors.jobId ? (
                        <FormFeedback type="invalid">
                          {validation.errors.jobId}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">نام شغل</Label>
                      <Input
                        name="jobTitle"
                        type="text"
                        placeholder="نام شغل را وارد کنید"
                        validate={{
                          required: { value: true },
                        }}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.jobTitle || ""}
                        invalid={
                          validation.touched.jobTitle &&
                          validation.errors.jobTitle
                            ? true
                            : false
                        }
                      />
                      {validation.touched.jobTitle &&
                      validation.errors.jobTitle ? (
                        <FormFeedback type="invalid">
                          {validation.errors.jobTitle}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">نام شرکت</Label>
                      <Input
                        name="companyName"
                        type="text"
                        placeholder="نام شرکت"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.companyName || ""}
                        invalid={
                          validation.touched.companyName &&
                          validation.errors.companyName
                            ? true
                            : false
                        }
                      />
                      {validation.touched.companyName &&
                      validation.errors.companyName ? (
                        <FormFeedback type="invalid">
                          {validation.errors.companyName}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">مکان</Label>
                      <Input
                        name="location"
                        type="text"
                        placeholder="موقعیت مکانی را وارد کنید"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.location || ""}
                        invalid={
                          validation.touched.location &&
                          validation.errors.location
                            ? true
                            : false
                        }
                      />
                      {validation.touched.location &&
                      validation.errors.location ? (
                        <FormFeedback type="invalid">
                          {validation.errors.location}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">سابقه کار</Label>
                      <Input
                        name="experience"
                        type="text"
                        placeholder="سابقه ی کاری خود را وارد کنید"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.experience || ""}
                        invalid={
                          validation.touched.experience &&
                          validation.errors.experience
                            ? true
                            : false
                        }
                      />
                      {validation.touched.experience &&
                      validation.errors.experience ? (
                        <FormFeedback type="invalid">
                          {validation.errors.experience}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">موقعیت</Label>
                      <Input
                        name="position"
                        type="text"
                        placeholder="موقعیت را وارد کنید"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.position || ""}
                        invalid={
                          validation.touched.position &&
                          validation.errors.position
                            ? true
                            : false
                        }
                      />
                      {validation.touched.position &&
                      validation.errors.position ? (
                        <FormFeedback type="invalid">
                          {validation.errors.position}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">نوع</Label>
                      <Input
                        name="type"
                        type="select"
                        className="form-select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.type || ""}
                        invalid={
                          validation.touched.type && validation.errors.type
                            ? true
                            : false
                        }
                      >
                        <option>تمام وقت</option>
                        <option>پاره وقت</option>
                        <option>فریلنسر</option>
                        <option>کارآموزی</option>
                      </Input>
                      {validation.touched.type && validation.errors.type ? (
                        <FormFeedback type="invalid">
                          {validation.errors.type}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">وضعیت</Label>
                      <Input
                        name="status"
                        type="select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.status || ""}
                        invalid={
                          validation.touched.status && validation.errors.status
                            ? true
                            : false
                        }
                      >
                        <option>فعال</option>
                        <option>جدید</option>
                        <option>بستن</option>
                      </Input>
                      {validation.touched.status && validation.errors.status ? (
                        <FormFeedback status="invalid">
                          {validation.errors.status}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="text-end">
                      <button
                        type="submit"
                        className="btn btn-success save-user"
                      >
                        ذخیره
                      </button>
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

// export default JobList;
export default JobList
