import React, { useState } from "react"
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Input,
  FormGroup,
  Label,
  Button,
} from "reactstrap"

// Import Editor
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// FlatPickr
import "flatpickr/dist/themes/material_blue.css";
import FlatPickr from "react-flatpickr";

//Import Breadcrumb
import Breadcrumbs from "/src/components/Common/Breadcrumb"

const TasksCreate = () => {

  //meta title
  document.title = "Create Task | Skote - قالب مدیریتی و داشبورد Vite React ";

  const inpRow = [{ name: "", file: "" }]
  const [startDate, setstartDate] = useState(new Date())
  const [endDate, setendDate] = useState(new Date())
  const [inputFields, setinputFields] = useState(inpRow)

  const startDateChange = date => {
    setstartDate(date)
  }

  const endDateChange = date => {
    setendDate(date)
  }

  // Function for Create Input Fields
  function handleAddFields() {
    const item1 = { name: "", file: "" }
    setinputFields([...inputFields, item1])
  }

  // Function for Remove Input Fields
  function handleRemoveFields(idx) {
    document.getElementById("nested" + idx).style.display = "none"
  }

  return (
    <>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="وظایف" breadcrumbItem="ایجاد وظیفه" />

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">تسک جدید ایجاد کنید</CardTitle>
                  <form className="outer-repeater">
                    <div data-repeater-list="outer-group" className="outer">
                      <div data-repeater-item className="outer">
                        <FormGroup className="mb-4" row>
                          <Label
                            htmlFor="taskname"
                            className="col-form-label col-lg-2"
                          >
                            نام تسک
                          </Label>
                          <Col lg="10">
                            <Input
                              id="taskname"
                              name="taskname"
                              type="text"
                              className="form-control"
                              placeholder="نام تسک را وارد کنید..."
                            />
                          </Col>
                        </FormGroup>
                        <FormGroup className="mb-4" row>
                          <Label className="col-form-label col-lg-2">
                            شرح وظیفه
                          </Label>
                          <Col lg="10">
                            <CKEditor
                              editor={ClassicEditor}
                              data="<p>سلام از CKEditor 5!</p>"
                              onReady={(editor) => {
                                // You can store the "editor" and use when it is needed.
                                // console.log('Editor is ready to use!', editor);
                              }}
                              onChange={(event, editor) => {
                                const data = editor.getData();
                              }}
                            />
                          </Col>
                        </FormGroup>

                        <FormGroup className="mb-4" row>
                          <Label className="col-form-label col-lg-2">
                            تاریخ تسک
                          </Label>
                          <Col lg="10">
                            <Row>
                              <Col md={6} className="pr-0">
                                <FlatPickr
                                  className="form-control"
                                  name="joiningDate"
                                  options={{
                                    dateFormat: "d M,Y",
                                  }}
                                  placeholder="انتخاب زمان"
                                  selected={startDate}
                                  onChange={startDateChange}
                                />
                              </Col>
                              <Col md={6} className="pl-0">
                                <FlatPickr
                                  className="form-control"
                                  options={{
                                    dateFormat: "d M,Y",
                                  }}
                                  name="joiningDate"
                                  placeholder="انتخاب زمان"
                                  selected={endDate}
                                  onChange={endDateChange}
                                />
                              </Col>
                            </Row>
                          </Col>
                        </FormGroup>

                        <div className="inner-repeater mb-4">
                          <div className="inner form-group mb-0 row">
                            <Label className="col-form-label col-lg-2">
                              عضو تیم را اضافه کنید
                            </Label>
                            <div
                              className="inner col-lg-10 ml-md-auto"
                              id="repeater"
                            >
                              {inputFields.map((field, key) => (
                                <div
                                  key={key}
                                  id={"nested" + key}
                                  className="mb-3 row align-items-center"
                                >
                                  <Col md="6">
                                    <input
                                      type="text"
                                      className="inner form-control"
                                      defaultValue={field.name}
                                      placeholder="وارد کردن نام..."
                                    />
                                  </Col>
                                  <Col md="4">
                                    <div className="mt-4 mt-md-0">
                                      <Input
                                        type="file"
                                        className="form-control"
                                        defaultValue={field.file}
                                      />
                                    </div>
                                  </Col>
                                  <Col md="2">
                                    <div className="mt-2 mt-md-0 d-grid">
                                      <Button
                                        color="primary"
                                        className="inner"
                                        onClick={() => {
                                          handleRemoveFields(key);
                                        }}
                                        block
                                      >
                                        حذف
                                      </Button>
                                    </div>
                                  </Col>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Row className="justify-content-end">
                            <Col lg="10">
                              <Button
                                color="success"
                                className="inner"
                                onClick={() => {
                                  handleAddFields();
                                }}
                              >
                                اضافه کردن شماره
                              </Button>
                            </Col>
                          </Row>
                        </div>
                        <FormGroup className="mb-4" row>
                          <label
                            htmlFor="taskbudget"
                            className="col-form-label col-lg-2"
                          >
                            بودجه
                          </label>
                          <div className="col-lg-10">
                            <Input
                              id="taskbudget"
                              name="taskbudget"
                              type="text"
                              placeholder="موجودی تسک را وارد کنید..."
                              className="form-control"
                            />
                          </div>
                        </FormGroup>
                      </div>
                    </div>
                  </form>
                  <Row className="justify-content-end">
                    <Col lg="10">
                      <Button type="submit" color="primary">
                        ساختن تسک
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default TasksCreate
