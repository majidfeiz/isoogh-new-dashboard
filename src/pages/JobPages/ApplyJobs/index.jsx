import React, { useEffect, useState, useMemo } from "react";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { Row, Col, Card, CardBody, Container, UncontrolledTooltip, Badge } from "reactstrap";
import TableContainer from "../../../components/Common/TableContainer";
import DeleteModal from "../../../components/Common/DeleteModal";
import { Link } from "react-router-dom";

import {
  getApplyJob as OnGetApplyJob,
  deleteApplyJob as OnDeleteApplyJob,
} from "/src/store/actions";

import Spinners from "../../../components/Common/Spinner"

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { ToastContainer } from "react-toastify";

const ApplyJobs = () => {
  document.title = "Job Apply | Skote - قالب مدیریتی و داشبورد Vite React ";

  const dispatch = useDispatch();

  const JobsApplyProperties = createSelector(
    (state) => state.JobReducer,
    (jobReducer) => ({
      jobApply: jobReducer.jobApply,
      loading: jobReducer.loading
    })
  );

  const {
    jobApply, loading
  } = useSelector(JobsApplyProperties);

  const [isLoading, setLoading] = useState(loading)
  const [apply, setApply] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(OnGetApplyJob());
  }, [dispatch]);

  useEffect(() => {
    setApply(jobApply);
  }, [jobApply]);

  // delete
  const onClickData = (apply) => {
    setApply(apply);
    setDeleteModal(true);
  };

  const handleDeleteApplyJob = () => {
    if (apply && apply.id) {
      dispatch(OnDeleteApplyJob(apply.id));
      setDeleteModal(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "شماره",
        accessorKey: "no",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "عنوان شغل",
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
        header: "نوع",
        accessorKey: "type",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          switch (cellProps.row.original.type) {
            case "تمام وقت":
              return <Badge className="badge-soft-success">تمام وقت</Badge>;
            case "فریلنسر":
              return <Badge className="badge-soft-info">فریلنسر</Badge>;
            case "کارآموزی":
              return <Badge className="badge-soft-warning">کارآموزی</Badge>;
            default:
              return <Badge className="badge-soft-danger">پاره وقت</Badge>;
          }
        },
      },
      {
        header: "تاریخ درخواست",
        accessorKey: "applyDate",
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
            case "فعال":
              return <Badge className="bg-success">فعال</Badge>;
            case "جدید":
              return <Badge className="bg-info">جدید</Badge>;
            default:
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
            <div className="list-unstyled hstack gap-1 mb-0">
              <li>
                <Link
                  to="/job-details"
                  className="btn btn-sm btn-soft-primary"
                  id={`viewtooltip${cellProps.row.original.id}`}
                >
                  <i className="mdi mdi-eye-outline" />
                  <UncontrolledTooltip
                    placement="top"
                    target={`viewtooltip${cellProps.row.original.id}`}
                  >
                    مشاهده
                  </UncontrolledTooltip>
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="btn btn-sm btn-soft-danger"
                  onClick={() => {
                    const userData = cellProps.row.original;
                    onClickData(userData);
                  }}
                  id={`deletetooltip${cellProps.row.original.id}`}
                >
                  <i className="mdi mdi-delete-outline" />
                  <UncontrolledTooltip
                    placement="top"
                    target={`deletetooltip${cellProps.row.original.id}`}
                  >
                    حذف
                  </UncontrolledTooltip>
                </Link>
              </li>
            </div>
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
        onDeleteClick={() => handleDeleteApplyJob()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="مشاغل" breadcrumbItem="درخواست شغل" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody className="border-bottom">
                    <div className="d-flex align-items-center">
                      <h5 className="mb-0 card-title flex-grow-1">
                        شغل های درخواست شده
                      </h5>
                      <div className="flex-shrink-0">
                        <select
                          className="form-select"
                          aria-label="Default select example"
                        >
                          <option value="Today" defaultValue>
                            امروز
                          </option>
                          <option value="1 Monthly">1 ماه</option>
                          <option value="6 Month">6 ماه</option>
                          <option value="1 Years">1 سال</option>
                        </select>
                      </div>
                    </div>
                  </CardBody>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={jobApply || []}
                      isGlobalFilter={false}
                      isPagination={true}
                      tableClass="table-bordered align-middle nowrap"
                      pagination="pagination pagination-rounded"
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
      <ToastContainer />
    </React.Fragment>
  );
};

export default ApplyJobs;
