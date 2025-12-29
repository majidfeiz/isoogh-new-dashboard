import React, { useState } from "react";
import { Link } from "react-router-dom";
import Dropzone from "react-dropzone";
import { Button, Card, CardBody, Col, Container, Form, FormFeedback, Input, Label, Row, UncontrolledTooltip } from "reactstrap";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

//Import Flatepicker
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";

import * as Yup from "yup";
import { useFormik } from "formik";
import moment from "moment";
import SimpleBar from "simplebar-react";
import { projectAssignedTo } from "../../common/data";

const ProjectsCreate = () => {

  document.title = "Create New Project | Skote - قالب مدیریتی و داشبورد Vite React ";

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imgStore, setImgStore] = useState([]);
  const [dropList, setDropList] = useState(false);
  const [active, setActive] = useState(0)

  const handleAcceptedFiles = (files) => {
    const newImages = files?.map((file) => {
      return Object.assign(file, {
        priview: URL.createObjectURL(file),
      })
    })
    setSelectedFiles([...selectedFiles, ...newImages]);
  };

  //  img upload
  const handleImageChange = (event) => {
    event.preventDefault();
    let reader = new FileReader();
    let file = event.target.files[0];
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      validation.setFieldValue('projectImage', reader.result)
    };
    reader.readAsDataURL(file);
  };


  const handleClick = (item) => {
    const isItemInImgStore = imgStore.some((imgItem) => imgItem.id === item.id);
    setActive(item.id)
    if (!isItemInImgStore) {
      const newData = [...imgStore, item];
      setImgStore(newData);
      validation.setFieldValue('assignedto', newData)
    } else {
      const newData = imgStore.filter((imgItem) => imgItem.id !== item.id)
      setImgStore(newData);
      validation.setFieldValue('assignedto', newData)
    }
  }

  // validation
  const validation = useFormik({
    initialValues: {
      projectname: "",
      projectdesc: "",
      assignedto: [],
      projectImage: "",
      img: "",
      startdate: "",
      // enddate: ''
    },
    validationSchema: Yup.object({
      projectname: Yup.string().required("لطفا نام پروژه خود را وارد کنید"),
      projectdesc: Yup.string().required("لطفاً شرح پروژه خود را وارد کنید"),
      assignedto: Yup.array().min(1, "لطفا انتخاب کنید"),
      startdate: Yup.string().required("لطفا تاریخ شروع خود را وارد کنید"),
      projectImage: Yup.string().required("لطفا تصویر را انتخاب کنید"),
    }),
    onSubmit: (values) => {
      // console.log(values);
    },
  });
  
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="پروژه ها" breadcrumbItem="ایجاد" />

          <Form
            id="createproject-form"
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
          >
            <Row>
              <Col lg={8}>
                <Card>
                  <CardBody>
                    <input
                      type="hidden"
                      className="form-control"
                      id="formAction"
                      name="formAction"
                      defaultValue="add"
                    />
                    <input
                      type="hidden"
                      className="form-control"
                      id="project-id-input"
                    />
                    <div className="mb-3">
                      <Label htmlFor="projectname-input">نام پروژه</Label>
                      <Input
                        id="projectname"
                        name="projectname"
                        type="text"
                        placeholder="نام پروژه را وارد کنید..."
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.projectname || ""}
                      />
                      {validation.touched.projectname &&
                      validation.errors.projectname ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors.projectname}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">تصویر پروژه</Label>

                      <div className="text-center">
                        <div className="position-relative d-inline-block">
                          <div className="position-absolute bottom-0 end-0">
                            <Label
                              htmlFor="project-image-input"
                              className="mb-0"
                              id="projectImageInput"
                            >
                              <div className="avatar-xs">
                                <div className="avatar-title bg-light border rounded-circle text-muted cursor-pointer shadow font-size-16">
                                  <i className="bx bxs-image-alt"></i>
                                </div>
                              </div>
                            </Label>
                            <UncontrolledTooltip
                              placement="right"
                              target="projectImageInput"
                            >
                              انتخاب تصویر
                            </UncontrolledTooltip>
                            <input
                              className="form-control d-none"
                              id="project-image-input"
                              type="file"
                              accept="image/png, image/gif, image/jpeg"
                              onChange={handleImageChange}
                            />
                          </div>
                          <div className="avatar-lg">
                            <div className="avatar-title bg-light rounded-circle">
                              <img
                                src={selectedImage || ""}
                                id="projectlogo-img"
                                alt=""
                                className="avatar-md h-auto rounded-circle"
                              />
                            </div>
                          </div>
                        </div>
                        {validation.touched.projectImage &&
                        validation.errors.projectImage ? (
                          <FormFeedback type="invalid" className="d-block">
                            {validation.errors.projectImage}
                          </FormFeedback>
                        ) : null}
                      </div>
                    </div>
                    <div className="mb-3">
                      <Label htmlFor="projectdesc-input">شرح پروژه</Label>
                      <Input
                        as="textarea"
                        id="projectdesc"
                        rows={3}
                        name="projectdesc"
                        placeholder="توضیحات پروژه را وارد کنید..."
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.projectdesc || ""}
                      />
                      {validation.touched.projectdesc &&
                      validation.errors.projectdesc ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors.projectdesc}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3 position-relative">
                      <Label htmlFor="task-assign-input">اختصاص یافته به</Label>

                      <div
                        className="avatar-group justify-content-center"
                        id="assignee-member"
                      >
                        {(imgStore || [])?.map((item, idx) => (
                          <React.Fragment key={idx}>
                            <Link
                              to="#"
                              className="avatar-group-item mb-2"
                              id={`assignee-member${idx}`}
                            >
                              <img
                                src={item.imageSrc}
                                alt=""
                                className="rounded-circle avatar-xs"
                              />
                            </Link>
                            <UncontrolledTooltip
                              placement="top"
                              target={`assignee-member${idx}`}
                            >
                              {item.name}
                            </UncontrolledTooltip>
                          </React.Fragment>
                        ))}
                      </div>

                      <div className="select-element" id="select-element">
                        <button
                          className="btn btn-light w-100 d-flex justify-content-between"
                          type="button"
                          onClick={() => setDropList(!dropList)}
                        >
                          <span>
                            اختصاص یافته به
                            <b id="total-assignee" className="mx-1">
                              {imgStore?.length || 0}
                            </b>
                            اعضا
                          </span>{" "}
                          <i className="mdi mdi-chevron-down"></i>
                        </button>
                        <div
                          className={`w-100 dropdown-menu ${
                            dropList ? "show" : ""
                          }`}
                        >
                          <SimpleBar
                            data-simplebar="init"
                            style={{ maxHeight: "172px" }}
                          >
                            <ul className="list-unstyled mb-0 assignto-list">
                              {(projectAssignedTo || [])?.map((item, index) => (
                                <a
                                  className={`d-flex align-items-center dropdown-item ${
                                    active === item.id ? "active" : ""
                                  }`}
                                  href="#!"
                                  key={index}
                                  onClick={() => handleClick(item)}
                                >
                                  <div className="avatar-xs flex-shrink-0 me-2">
                                    <img
                                      src={item.imageSrc}
                                      alt=""
                                      className="img-fluid rounded-circle"
                                    />
                                  </div>
                                  <div className="flex-grow-1">{item.name}</div>
                                </a>
                              ))}
                            </ul>
                          </SimpleBar>
                        </div>
                      </div>

                      {validation.touched.assignedto &&
                      validation.errors.assignedto ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors.assignedto}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div>
                      <Label>فایل های پیوست شده</Label>
                      <Dropzone
                        onDrop={(acceptedFiles) => {
                          handleAcceptedFiles(acceptedFiles);
                          validation.setFieldValue("img", acceptedFiles[0]);
                        }}
                      >
                        {({ getRootProps, getInputProps }) => (
                          <div className="dropzone">
                            <div
                              className="dz-message needsclick"
                              {...getRootProps()}
                            >
                              <input {...getInputProps()} />
                              <div className="dz-message needsclick">
                                <div className="mb-3">
                                  <i className="display-4 text-muted bx bxs-cloud-upload" />
                                </div>
                                <h4>
                                  فایل ها را اینجا رها کنید یا برای آپلود کلیک
                                  کنید
                                </h4>
                              </div>
                            </div>
                          </div>
                        )}
                      </Dropzone>
                      <div
                        className="dropzone-previews mt-3"
                        id="file-previews"
                      >
                        {selectedFiles.map((file, index) => {
                          return (
                            <div className="border rounded" key={index}>
                              <div className="d-flex flex-wrap gap-2 p-2">
                                <div className="flex-shrink-0 me-3">
                                  <div className="avatar-sm bg-light rounded p-2">
                                    <img
                                      data-dz-thumbnail=""
                                      className="img-fluid rounded d-block"
                                      src={file.priview}
                                      alt={file.name}
                                    />
                                  </div>
                                </div>
                                <div className="flex-grow-1">
                                  <div className="pt-1">
                                    <h5 className="fs-md mb-1" data-dz-name>
                                      {file.path}
                                    </h5>
                                    <strong
                                      className="error text-danger"
                                      data-dz-errormessage
                                    ></strong>
                                  </div>
                                </div>
                                <div className="flex-shrink-0 ms-3">
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                      const newImages = [...selectedFiles];
                                      newImages.splice(index, 1);
                                      setSelectedFiles(newImages);
                                    }}
                                  >
                                    حذف
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {validation.errors.img && validation.touched.img ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors.img}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col lg={4}>
                <Card>
                  <CardBody>
                    <h5 className="card-title mb-3">انتشار</h5>
                    <div className="mb-3">
                      <Label htmlFor="project-status-input">وضعیت</Label>
                      <select
                        className="form-select pageSize"
                        id="project-status-input"
                      >
                        <option value="Completed">تکمیل شده</option>
                        <option value="Inprogress">در حال پیشرفت</option>
                        <option value="Delay">تاخیر انداختن</option>
                      </select>
                      <div className="invalid-feedback">
                        لطفا وضعیت پروژه را انتخاب کنید
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="project-visibility-input">
                        قابل رویت
                      </Label>
                      <select
                        className="form-select pageSize"
                        id="project-visibility-input"
                      >
                        <option value="Private">خصوصی</option>
                        <option value="Public">عمومی</option>
                        <option value="Team">تیم</option>
                      </select>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h5 className="card-title mb-3">تاریخ پایان</h5>
                    <Flatpickr
                      className="form-control d-block"
                      id="orderdate"
                      name="startdate"
                      placeholder="انتخاب تاریخ"
                      options={{
                        mode: "single",
                        dateFormat: "d M, Y",
                      }}
                      onChange={(customerdate) =>
                        validation.setFieldValue(
                          "startdate",
                          moment(customerdate[0]).format("DD MMMM ,YYYY")
                        )
                      }
                      value={validation.values.startdate || ""}
                    />
                    {validation.errors.startdate &&
                    validation.touched.startdate ? (
                      <FormFeedback type="invalid" className="d-block">
                        {validation.errors.startdate}
                      </FormFeedback>
                    ) : null}
                  </CardBody>
                </Card>
              </Col>
              <Col lg={8}>
                <div className="text-end mb-4">
                  <Button type="submit" color="primary">
                    ایجاد پروژه
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ProjectsCreate;
