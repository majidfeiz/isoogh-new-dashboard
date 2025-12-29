import React from "react";

import { Card, Col, Container, Row, CardBody, CardTitle, Label, Form, Input, InputGroup, FormFeedback } from "reactstrap";
import * as Yup from 'yup';
import { useFormik } from "formik";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const FormLayouts = () => {

  //meta title
  document.title = "Form Layouts | Skote - قالب مدیریتی و داشبورد Vite React ";

  const formik = useFormik({
    initialValues: {
      firstname: "",
      email: "",
      password: "",
      city: "",
      state: "",
      zip: "",
      check: "",
    },
    validationSchema: Yup.object({
      firstname: Yup.string().required("این فیلد اجباری است"),
      email: Yup.string()
        .email()
        .matches(/^(?!.*@[^,]*,)/)
        .required("ایمیل خود را وارد کنید"),
      password: Yup.string()
        .min(6, "رمز عبور باید حداقل 6 کاراکتر باشد")
        .matches(RegExp("(.*[a-z].*)"), "حداقل حروف کوچک")
        .matches(RegExp("(.*[A-Z].*)"), "حداقل حروف بزرگ")
        .matches(RegExp("(.*[0-9].*)"), "حداقل  عدد")
        .required("This field is required"),
      city: Yup.string().required("این فیلد الزامی است"),
      state: Yup.string().required("این فیلد الزامی است"),
      zip: Yup.string().required("این فیلد الزامی است"),
      check: Yup.string().required("این فیلد الزامی است"),
    }),

    onSubmit: (values) => {
      // console.log("value", values.password);
    },
  });

  //Horizontal form 
  const horizontalformik = useFormik({
    initialValues: {
      firstname: "",
      email: "",
      password: "",
      check: "",
    },
    validationSchema: Yup.object({
      firstname: Yup.string().required("این فیلد الزامی است"),
      email: Yup.string()
        .email()
        .matches(/^(?!.*@[^,]*,)/)
        .required("لطفا آدرس اییمیل خود را وارد نمایید"),
      password: Yup.string()
        .min(6, "رمز عبور باید حداقل 6 کاراکتر باشد")
        .matches(RegExp("(.*[a-z].*)"), "حداقل حروف کوچک")
        .matches(RegExp("(.*[A-Z].*)"), "حداقل حروف بزرگ")
        .matches(RegExp("(.*[0-9].*)"), "حداقل عدد")
        .required("این فیلد الزامی است"),
      check: Yup.string().required("این فیلد الزامی است"),
    }),

    onSubmit: (values) => {
      // console.log("value", values.password);
    },
  });

  //auto sizeing form
  const autoformik = useFormik({
    initialValues: {
      name: "",
      username: "",
      state: "",
      check: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("این فیلد الزامی است"),
      username: Yup.string().required("این فیلد الزامی است"),
      state: Yup.string().required("این فیلد الزامی است"),
      check: Yup.string().required("این فیلد الزامی است"),
    }),

    onSubmit: (values) => {
      // console.log("value", values.password);
    },
  });

  //Inline forms
  const inlineformik = useFormik({
    initialValues: {
      username: "",
      select: "",
      check: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("این فیلد الزامی است"),
      select: Yup.string().required("این فیلد الزامی است"),
      check: Yup.string().required("این فیلد الزامی است"),
    }),

    onSubmit: (values) => {
      // console.log("value", values.password);
    },
  });

  //Floating labels forms
  const floatingformik = useFormik({
    initialValues: {
      name: "",
      email: "",
      select: "",
      check: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("این فیلد الزامی است"),
      email: Yup.string()
        .email()
        .matches(/^(?!.*@[^,]*,)/)
        .required("لطفا آدرس ایمیل خود را وارد نمایید"),
      select: Yup.string().required("این فیلد الزامی است"),
      check: Yup.string().required("این فیلد الزامی است"),
    }),

    onSubmit: (values) => {
      // console.log("value", values.password);
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="فرم ها" breadcrumbItem="طرح بندی فرم ها" />
          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">طرح بندی شبکه ای فرم</CardTitle>

                  <Form onSubmit={formik.handleSubmit}>
                    <div className="mb-3">
                      <Label htmlFor="formrow-firstname-Input">نام</Label>
                      <Input
                        type="text"
                        name="firstname"
                        className="form-control"
                        id="formrow-firstname-Input"
                        placeholder="نام خود را وارد نمایید"
                        value={formik.values.firstname}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        invalid={
                          formik.touched.firstname && formik.errors.firstname
                            ? true
                            : false
                        }
                      />
                      {formik.errors.firstname && formik.touched.firstname ? (
                        <FormFeedback type="invalid">
                          {formik.errors.firstname}
                        </FormFeedback>
                      ) : null}
                    </div>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="formrow-email-Input">ایمیل</Label>
                          <Input
                            type="email"
                            name="email"
                            className="form-control"
                            id="formrow-email-Input"
                            placeholder="شناسه ایمیل خود را وارد کنید"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={
                              formik.touched.email && formik.errors.email
                                ? true
                                : false
                            }
                          />
                          {formik.errors.email && formik.touched.email ? (
                            <FormFeedback type="invalid">
                              {formik.errors.email}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="formrow-password-Input">
                            رمز عبور
                          </Label>
                          <Input
                            type="password"
                            name="password"
                            className="form-control"
                            id="formrow-password-Input"
                            placeholder="رمز عبور خود را وارد کنید"
                            autoComplete="off"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={
                              formik.touched.password && formik.errors.password
                                ? true
                                : false
                            }
                          />
                          {formik.errors.password && formik.touched.password ? (
                            <FormFeedback type="invalid">
                              {formik.errors.password}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col lg={4}>
                        <div className="mb-3">
                          <Label htmlFor="formrow-InputCity">شهر</Label>
                          <Input
                            type="text"
                            name="city"
                            className="form-control"
                            id="formrow-InputCity"
                            placeholder="محل سکونت خود را وارد کنید"
                            value={formik.values.city}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={
                              formik.touched.city && formik.errors.city
                                ? true
                                : false
                            }
                          />
                          {formik.errors.city && formik.touched.city ? (
                            <FormFeedback type="invalid">
                              {formik.errors.city}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </Col>
                      <Col lg={4}>
                        <div className="mb-3">
                          <Label htmlFor="formrow-InputState">استان</Label>
                          <select
                            name="state"
                            id="formrow-InputState"
                            className="form-control"
                            value={formik.values.state}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            <option>انتخاب...</option>
                            <option>...</option>
                          </select>
                          {formik.errors.state && formik.touched.state ? (
                            <span className="text-danger">
                              {formik.errors.state}
                            </span>
                          ) : null}
                        </div>
                      </Col>

                      <Col lg={4}>
                        <div className="mb-3">
                          <Label htmlFor="formrow-InputZip">کد پستی</Label>
                          <Input
                            type="text"
                            name="zip"
                            className="form-control"
                            id="formrow-InputZip"
                            placeholder="کد پستی خود را وارد کنید"
                            value={formik.values.zip}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={
                              formik.touched.zip && formik.errors.zip
                                ? true
                                : false
                            }
                          />
                          {formik.errors.zip && formik.touched.zip ? (
                            <FormFeedback type="invalid">
                              {formik.errors.zip}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <div className="form-check">
                        <Input
                          type="checkbox"
                          className="form-check-Input"
                          id="formrow-customCheck"
                          name="check"
                          value={formik.values.check}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={
                            formik.touched.check && formik.errors.check
                              ? true
                              : false
                          }
                        />
                        <Label
                          className="form-check-Label"
                          htmlFor="formrow-customCheck"
                        >
                          من را بررسی کنید
                        </Label>
                      </div>
                      {formik.errors.check && formik.touched.check ? (
                        <FormFeedback type="invalid">
                          {formik.errors.check}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div>
                      <button type="submit" className="btn btn-primary w-md">
                        ارسال
                      </button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">طرح بندی فرم افقی</CardTitle>
                  <Form onSubmit={horizontalformik.handleSubmit}>
                    <Row className="mb-4">
                      <Label
                        htmlFor="horizontal-firstname-Input"
                        className="col-sm-3 col-form-label"
                      >
                        نام
                      </Label>
                      <Col sm={9}>
                        <Input
                          name="firstname"
                          type="text"
                          className="form-control"
                          id="horizontal-firstname-Input"
                          placeholder="نام ..."
                          value={horizontalformik.values.firstname}
                          onChange={horizontalformik.handleChange}
                          onBlur={horizontalformik.handleBlur}
                          invalid={
                            horizontalformik.touched.firstname &&
                            horizontalformik.errors.firstname
                              ? true
                              : false
                          }
                        />
                        {horizontalformik.errors.firstname &&
                        horizontalformik.touched.firstname ? (
                          <FormFeedback type="invalid">
                            {horizontalformik.errors.firstname}
                          </FormFeedback>
                        ) : null}
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Label
                        htmlFor="horizontal-email-Input"
                        className="col-sm-3 col-form-label"
                      >
                        ایمیل
                      </Label>
                      <Col sm={9}>
                        <Input
                          type="email"
                          name="email"
                          className="form-control"
                          id="horizontal-email-Input"
                          placeholder="شناسه ایمیل خود را وارد کنید"
                          value={horizontalformik.values.email}
                          onChange={horizontalformik.handleChange}
                          onBlur={horizontalformik.handleBlur}
                          invalid={
                            horizontalformik.touched.email &&
                            horizontalformik.errors.email
                              ? true
                              : false
                          }
                        />
                        {horizontalformik.errors.email &&
                        horizontalformik.touched.email ? (
                          <FormFeedback type="invalid">
                            {horizontalformik.errors.email}
                          </FormFeedback>
                        ) : null}
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Label
                        htmlFor="horizontal-password-Input"
                        className="col-sm-3 col-form-label"
                      >
                        رمزعبور
                      </Label>
                      <Col sm={9}>
                        <Input
                          type="password"
                          name="password"
                          className="form-control"
                          id="horizontal-password-Input"
                          autoComplete="off"
                          placeholder="رمزعبور خود را وارد کنید"
                          value={horizontalformik.values.password}
                          onChange={horizontalformik.handleChange}
                          onBlur={horizontalformik.handleBlur}
                          invalid={
                            horizontalformik.touched.password &&
                            horizontalformik.errors.password
                              ? true
                              : false
                          }
                        />
                        {horizontalformik.errors.password &&
                        horizontalformik.touched.password ? (
                          <FormFeedback type="invalid">
                            {horizontalformik.errors.password}
                          </FormFeedback>
                        ) : null}
                      </Col>
                    </Row>

                    <Row className="justify-content-end">
                      <Col sm={9}>
                        <div className="form-check mb-4">
                          <Input
                            type="checkbox"
                            name="check"
                            className="form-check-Input"
                            id="horizontal-customCheck"
                            value={horizontalformik.values.check}
                            onChange={horizontalformik.handleChange}
                            onBlur={horizontalformik.handleBlur}
                            invalid={
                              horizontalformik.touched.check &&
                              horizontalformik.errors.check
                                ? true
                                : false
                            }
                          />
                          <Label
                            className="form-check-label"
                            htmlFor="horizontal-customCheck"
                          >
                            مرا به خاطر بسپار
                          </Label>
                          <div>
                            {horizontalformik.errors.check &&
                            horizontalformik.touched.check ? (
                              <FormFeedback type="invalid">
                                {horizontalformik.errors.check}
                              </FormFeedback>
                            ) : null}
                          </div>
                        </div>

                        <div>
                          <button
                            type="submit"
                            className="btn btn-primary w-md"
                          >
                            ارسال
                          </button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <CardTitle className="h5 mb-4">اندازه گیری خودکار</CardTitle>

                  <Form
                    className="row gy-2 gx-3 align-items-center"
                    onSubmit={autoformik.handleSubmit}
                  >
                    <div className="col-sm-auto">
                      <Label
                        className="visually-hidden"
                        htmlFor="autoSizingInput"
                      >
                        نام
                      </Label>
                      <Input
                        type="text"
                        name="name"
                        className="form-control"
                        id="autoSizingInput"
                        placeholder="سارا توسلی"
                        value={autoformik.values.name}
                        onChange={autoformik.handleChange}
                        onBlur={autoformik.handleBlur}
                        invalid={
                          autoformik.touched.name && autoformik.errors.name
                            ? true
                            : false
                        }
                      />
                      {autoformik.errors.name && autoformik.touched.name ? (
                        <FormFeedback type="invalid">
                          {autoformik.errors.name}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="col-sm-auto">
                      <Label
                        className="visually-hidden"
                        htmlFor="autoSizingInputGroup"
                      >
                        نام کاربری
                      </Label>
                      <InputGroup>
                        <div className="input-group-text">@</div>
                        <input
                          type="text"
                          name="username"
                          className="form-control"
                          id="autoSizingInputGroup"
                          placeholder="نام کاربری"
                          value={autoformik.values.username}
                          onChange={autoformik.handleChange}
                          onBlur={autoformik.handleBlur}
                        />
                      </InputGroup>
                      {autoformik.errors.username &&
                      autoformik.touched.username ? (
                        <span className="text-danger">
                          {autoformik.errors.username}
                        </span>
                      ) : null}
                    </div>
                    <div className="col-sm-auto">
                      <label
                        className="visually-hidden"
                        htmlFor="autoSizingSelect"
                      >
                        اولویت
                      </label>
                      <select
                        className="form-select"
                        name="state"
                        value={autoformik.values.state}
                        onChange={autoformik.handleChange}
                        onBlur={autoformik.handleBlur}
                      >
                        <option defaultValue="0">انتخاب...</option>
                        <option value="1">یک</option>
                        <option value="2">دو</option>
                        <option value="3">سه</option>
                      </select>
                      {autoformik.errors.state && autoformik.touched.state ? (
                        <span className="text-danger">
                          {autoformik.errors.state}
                        </span>
                      ) : null}
                    </div>
                    <div className="col-sm-auto">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="autoSizingCheck"
                          name="check"
                          value={autoformik.values.check}
                          onChange={autoformik.handleChange}
                          onBlur={autoformik.handleBlur}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="autoSizingCheck"
                        >
                          مرا به خاطر بسپار
                        </label>

                        <div>
                          {autoformik.errors.check &&
                          autoformik.touched.check ? (
                            <span className="text-danger">
                              {autoformik.errors.check}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-auto">
                      <button type="submit" className="btn btn-primary w-md">
                        ارسال
                      </button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
          {/* end row  */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <CardTitle className="h5 mb-4">فرم های درون خطی</CardTitle>

                  <Form
                    className="row row-cols-lg-auto g-3 align-items-center"
                    onSubmit={inlineformik.handleSubmit}
                  >
                    <Col xs={12}>
                      <label
                        className="visually-hidden"
                        htmlFor="inlineFormInputGroupUsername"
                      >
                        نام کاربری
                      </label>
                      <InputGroup>
                        <div className="input-group-text">@</div>
                        <input
                          type="text"
                          name="username"
                          className="form-control"
                          id="inlineFormInputGroupUsername"
                          placeholder="نام کاربری"
                          value={inlineformik.values.username}
                          onChange={inlineformik.handleChange}
                          onBlur={inlineformik.handleBlur}
                        />
                      </InputGroup>
                      {inlineformik.errors.username &&
                      inlineformik.touched.username ? (
                        <span className="text-danger">
                          {inlineformik.errors.username}
                        </span>
                      ) : null}
                    </Col>

                    <Col xs={12}>
                      <label
                        className="visually-hidden"
                        htmlFor="inlineFormSelectPref"
                      >
                        اولویت
                      </label>
                      <select
                        className="form-select"
                        name="select"
                        value={inlineformik.values.select}
                        onChange={inlineformik.handleChange}
                        onBlur={inlineformik.handleBlur}
                      >
                        <option value="0">انتخاب...</option>
                        <option value="1">یک</option>
                        <option value="2">دو</option>
                        <option value="3">سه</option>
                      </select>
                      {inlineformik.errors.select &&
                      inlineformik.touched.select ? (
                        <span className="text-danger">
                          {inlineformik.errors.select}
                        </span>
                      ) : null}
                    </Col>

                    <Col xs={12}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          name="check"
                          type="checkbox"
                          id="inlineFormCheck"
                          value={inlineformik.values.check}
                          onChange={inlineformik.handleChange}
                          onBlur={inlineformik.handleBlur}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="inlineFormCheck"
                        >
                          مرا به خاطر بسپار
                        </label>
                      </div>
                      <div>
                        {inlineformik.errors.check &&
                        inlineformik.touched.check ? (
                          <span className="text-danger">
                            {inlineformik.errors.check}
                          </span>
                        ) : null}
                      </div>
                    </Col>

                    <Col xs={12}>
                      <button type="submit" className="btn btn-primary w-md">
                        ارسال
                      </button>
                    </Col>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h5">برچسب های شناور</CardTitle>
                  <p className="card-title-desc">
                    برچسب‌های ساده و زیبایی ایجاد کنید که بر روی شما شناور هستند
                    فیلدهای ورودی
                  </p>

                  <Form onSubmit={floatingformik.handleSubmit}>
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        id="floatingnameInput"
                        placeholder="نام ..."
                        value={floatingformik.values.name}
                        onChange={floatingformik.handleChange}
                        onBlur={floatingformik.handleBlur}
                      />
                      <label htmlFor="floatingnameInput">نام</label>
                      {floatingformik.errors.name &&
                      floatingformik.touched.name ? (
                        <span className="text-danger">
                          {floatingformik.errors.name}
                        </span>
                      ) : null}
                    </div>
                    <Row>
                      <Col md={6}>
                        <div className="form-floating mb-3">
                          <input
                            type="email"
                            name="email"
                            className="form-control"
                            id="floatingemailInput"
                            placeholder="ایمیل را وارد کنید"
                            value={floatingformik.values.email}
                            onChange={floatingformik.handleChange}
                            onBlur={floatingformik.handleBlur}
                          />
                          <label htmlFor="floatingemailInput">آدرس ایمیل</label>
                          {floatingformik.errors.email &&
                          floatingformik.touched.email ? (
                            <span className="text-danger">
                              {floatingformik.errors.email}
                            </span>
                          ) : null}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-floating mb-3">
                          <select
                            className="form-select"
                            name="select"
                            value={floatingformik.values.select}
                            onChange={floatingformik.handleChange}
                            onBlur={floatingformik.handleBlur}
                          >
                            <option defaultValue="0">
                              این منوی انتخاب را باز کنید
                            </option>
                            <option value="1">یک</option>
                            <option value="2">دو</option>
                            <option value="3">سه</option>
                          </select>
                          <label htmlFor="floatingSelectGrid">
                            با انتخاب کار میکند
                          </label>
                          <div>
                            {floatingformik.errors.select &&
                            floatingformik.touched.select ? (
                              <span className="text-danger">
                                {floatingformik.errors.select}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="floatingCheck"
                          name="check"
                          value={floatingformik.values.check}
                          onChange={floatingformik.handleChange}
                          onBlur={floatingformik.handleBlur}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="floatingCheck"
                        >
                          من را بررسی کنید
                        </label>
                      </div>
                      {floatingformik.errors.check &&
                      floatingformik.touched.check ? (
                        <span className="text-danger">
                          {floatingformik.errors.check}
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <button type="submit" className="btn btn-primary w-md">
                        ارسال
                      </button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h5 mb-4">
                    فرم های درون خطی با Hstack
                  </CardTitle>
                  <div className="hstack gap-3">
                    <Input
                      className="form-control me-auto"
                      type="text"
                      placeholder="مورد خود را اینجا اضافه کنید..."
                      aria-label="مورد خود را اینجا اضافه کنید..."
                    />
                    <button type="button" className="btn btn-secondary">
                      ارسال
                    </button>
                    <div className="vr"></div>
                    <button type="button" className="btn btn-outline-danger">
                      بازنشانی
                    </button>
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

export default FormLayouts;
