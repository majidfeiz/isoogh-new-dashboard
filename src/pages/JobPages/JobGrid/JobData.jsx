import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardBody, Col, Modal, ModalBody, ModalHeader, Row, Label, Input, FormFeedback, Form } from 'reactstrap';
import { Link } from 'react-router-dom';
import Spinners from '../../../components/Common/Spinner';
import Paginations from '../../../components/Common/Paginations';

// format number
import { PatternFormat } from "react-number-format";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

const JobData = ({ jobGrid }) => {

    const [modal, setModal] = useState(false);
    const [isLoading, setLoading] = useState(true)

    // pagination
    const [jobGridData, setJobGridData] = useState()
    const [currentPage, setCurrentPage] = useState(1);
    const perPageData = 8;
    const indexOfLast = currentPage * perPageData;
    const indexOfFirst = indexOfLast - perPageData;
    const currentData = useMemo(() => jobGrid?.slice(indexOfFirst, indexOfLast), [jobGrid, indexOfFirst, indexOfLast])

    useEffect(() => {
        setJobGridData(currentData);
    }, [currentData]);


    // validation
    const validation = useFormik({
        initialValues: {
            fullNameInput: '',
            emailInput: '',
            phoneNumberInput: '',
            uploadResume: '',
            messageInput: '',
        },
        validationSchema: Yup.object({
            fullNameInput: Yup.string().required("لطفا نام خود را وارد کنید"),
            emailInput: Yup.string().required("لطفا ایمیل خود را وارد کنید"),
            phoneNumberInput: Yup.string().required("لطفا شماره تلفن خود را وارد کنید"),
            uploadResume: Yup.string().required("افزودن روزمه "),
            messageInput: Yup.string().required("لطفا پیام خود را وارد کنید"),
        }),
        onSubmit: (values) => {
            setModal();
            validation.resetForm();
        }
    });

    return (
      <React.Fragment>
        {isLoading ? (
          <Spinners setLoading={setLoading} />
        ) : (
          <>
            <Row>
              {(jobGridData || []).map((item, key) => (
                <Col xl={3} md={6} key={key}>
                  <Card>
                    <CardBody>
                      <div className="favorite-icon">
                        <Link to="#">
                          <i className="uil uil-heart-alt fs-18"></i>
                        </Link>
                      </div>
                      <img src={item.img} alt="" height="50" className="mb-3" />
                      <h5 className="fs-17 mb-2">
                        <Link to="/job-details" className="text-dark">
                          {item.title}
                        </Link>{" "}
                        <small className="text-muted fw-normal">
                          (0-2 Yrs Exp.)
                        </small>
                      </h5>
                      <ul className="list-inline mb-0">
                        <li className="list-inline-item">
                          <p className="text-muted fs-14 mb-1">
                            شرکت Skote Technology Pvt.Ltd
                          </p>
                        </li>{" "}
                        <li className="list-inline-item">
                          <p className="text-muted fs-14 mb-0">
                            <i className="mdi mdi-map-marker"></i>{" "}
                            {item.location}
                          </p>
                        </li>
                        <li className="list-inline-item">
                          <p className="text-muted fs-14 mb-0">
                            <i className="uil uil-wallet"></i> تومان 250 - 800 تومان
                            / ماه
                          </p>
                        </li>
                      </ul>
                      <div className="mt-3 hstack gap-2">
                        <span className="badge rounded-1 badge-soft-success">
                          تمام وقت
                        </span>
                        <span className="badge rounded-1 badge-soft-warning">
                          فوری
                        </span>
                        <span className="badge rounded-1 badge-soft-info">
                          خصوصی
                        </span>
                      </div>
                      <div className="mt-4 hstack gap-2">
                        <Link
                          to="/job-details"
                          className="btn btn-soft-success w-100"
                        >
                          مشاهده پروفایل
                        </Link>
                        <Link
                          to="#applyJobs"
                          onClick={() => setModal(true)}
                          className="btn btn-soft-primary w-100"
                        >
                          اکنون درخواست دهید
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
            <Paginations
              perPageData={perPageData}
              data={jobGrid}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isShowingPageLength={true}
              paginationDiv="col-sm-12 col-md-7"
              paginationClass="pagination justify-content-end pagination-rounded"
            />
          </>
        )}

        {/* Modal */}
        <Modal
          isOpen={modal}
          toggle={() => {
            setModal();
          }}
          id="applyJobs"
        >
          <div className="modal-content">
            <ModalHeader
              toggle={() => setModal()}
              id="applyJobsLabel"
              className="modal-header"
            >
              برای این شغل درخواست دهید
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={validation.handleSubmit} autoComplete="off">
                <Row>
                  <Col lg={12}>
                    <div className="mb-3">
                      <Label htmlFor="fullNameInput">تمام وقت</Label>
                      <Input
                        type="text"
                        id="fullNameInput"
                        name="fullNameInput"
                        placeholder="نام خود را وارد کنید"
                        value={validation.values.fullNameInput}
                        onChange={validation.handleChange}
                      />
                      {validation.touched.fullNameInput &&
                      validation.errors.fullNameInput ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors.fullNameInput}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <Label htmlFor="emailInput">ایمیل</Label>
                      <Input
                        type="email"
                        id="emailInput"
                        name="emailInput"
                        placeholder="ایمیل خود را وارد کنید"
                        value={validation.values.emailInput}
                        onChange={validation.handleChange}
                      />
                      {validation.touched.emailInput &&
                      validation.errors.emailInput ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors.emailInput}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <Label htmlFor="phoneNumberInput">شماره تلفن</Label>
                      <PatternFormat
                        className="form-control"
                        name="phoneNumberInput"
                        placeholder="لطفا شماره تلفن خود را وارد کنید"
                        value={validation.values.phoneNumberInput || ""}
                        onChange={validation.handleChange}
                        format="###-###-####"
                      />

                      {validation.touched.phoneNumberInput &&
                      validation.errors.phoneNumberInput ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors.phoneNumberInput}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                  <Col lg={12}>
                    <div className="mb-3">
                      <Label htmlFor="uploadResume">بارگزاری رزومه</Label>
                      <Input
                        type="file"
                        id="uploadResume"
                        nae="uploadResume"
                        placeholder="بارگزاری رزومه"
                        value={validation.values.uploadResume}
                        onChange={validation.handleChange}
                      />
                      {validation.touched.uploadResume &&
                      validation.errors.uploadResume ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors.uploadResume}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                  <Col lg={12}>
                    <div className="mb-4">
                      <Label htmlFor="messageInput">پیام</Label>
                      <textarea
                        className="form-control"
                        id="messageInput"
                        name="messageInput"
                        rows="3"
                        placeholder="پیام خود را وارد کنید"
                        value={validation.values.messageInput}
                        onChange={validation.handleChange}
                      ></textarea>
                      {validation.touched.messageInput &&
                      validation.errors.messageInput ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors.messageInput}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                  <Col lg={12}>
                    <div className="text-end">
                      <button type="submit" className="btn btn-success me-1">
                        ارسال برنامه <i className="bx bx-send align-middle"></i>
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setModal()}
                      >
                        لغو
                      </button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </ModalBody>
          </div>
        </Modal>
      </React.Fragment>
    );
}

export default JobData;