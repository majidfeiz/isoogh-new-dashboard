import React, { useState } from "react";

import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  CardTitle,
  CardSubtitle,
  Label,
  Input,
  Container,
  FormFeedback,
  Form,
} from "reactstrap";
// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const FormValidations = () => {
  //meta title
  document.title =
    "Form Validation | Skote - قالب مدیریتی و داشبورد Vite React ";

  // Form validation 
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      firstname: "سارا",
      lastname: "توسلی",
      city: "شهر",
      state: "",
      zip: "کد پستی",
    },
    validationSchema: Yup.object({
      firstname: Yup.string().required("لطفا نام خود را وارد کنید"),
      lastname: Yup.string().required("لطفا نام خانوادگی خود را وارد کنید"),
      city: Yup.string().required("لطفا شهر خود را وارد کنید"),
      state: Yup.string().required("لطفا استان خود را وارد کنید"),
      zip: Yup.string().required("لطفا کد پستی خود را وارد کنید"),
    }),
    onSubmit: (values) => {
      // console.log("values", values);
    },
  });

  // Form validation 
  const validationType = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      username: "",
      password: "",
      password1: "",
      email: "",
      digits: "",
      number: "",
      alphanumeric: "",
    },
    validationSchema: Yup.object().shape({
      username: Yup.string().required("این مقدار اجباری است"),
      password: Yup.string().required("این مقدار اجباری است"),
      password1: Yup.string().when("password", {
        is: (val) => (val && val.length > 0 ? true : false),
        then: () =>
          Yup.string().oneOf(
            [Yup.ref("password")],
            "هر دو رمز عبور باید یکسان باشند"
          ),
      }),
      email: Yup.string()
        .email("باید یک ایمیل معتبر باشد")
        .max(255)
        .required("ایمیل اجباری است"),
      url: Yup.string()
        .matches(
          /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
          "آدرس سایت را وارد کنید"
        )
        .required("آدرس سایت خود را وارد کنید"),
      digits: Yup.number().required("لطفا ارقام خود را وارد کنید"),
      number: Yup.number().required("لطفا شماره خود را وارد کنید"),
      alphanumeric: Yup.string()
        .matches(/^[a-z0-9]+$/i, "الفبایی عددی صحیح را وارد کنید!")
        .required("لطفا عدد الفبای خود را وارد کنید"),
      textarea: Yup.string().required("لطفا Textarea خود را وارد کنید"),
    }),
    onSubmit: (values) => {},
  });

  // Form validation 
  const rangeValidation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      min_Length: "",
      max_Length: "",
      range_Length: "",
      min_Value: "",
      max_Value: "",
      range_Value: "",
      regular_Exp: "",
    },
    validationSchema: Yup.object().shape({
      min_Length: Yup.string()
        .min(6, "باید دقیقا 6 رقمی باشد")
        .required("حداقل 6 کاراکتر"),
      max_Length: Yup.string()
        .max(6, "Must be exactly 6 digits")
        .required("حداکثر 6 کاراکتر"),
      range_Length: Yup.string()
        .required("محدوده بین 5 تا 10")
        .min(5, "این مقدار باید بین 5 تا 10 باشد")
        .max(10, "این مقدار باید بین 5 تا 10 باشد"),
      min_Value: Yup.string()
        .required("حداقل مقدار 6")
        .test(
          "val",
          "این مقدار باید بزرگتر یا مساوی 6 باشد",
          (val) => val >= 6
        ),
      max_Value: Yup.string()
        .required("حداکثر مقدار 6")
        .matches(/^[0-6]+$/, "این مقدار باید کمتر یا مساوی 6 باشد"),
      range_Value: Yup.string()
        .required("محدوده بین 5 تا 10")
        .min(5, "این مقدار باید بین 5 تا 10 باشد")
        .max(10, "این مقدار باید بین 5 تا 10 باشد"),
      regular_Exp: Yup.string()
        .matches(/^[#0-9]+$/, "فقط مقدار Hex ")
        .required("فقط مقدار Hex"),
    }),
    onSubmit: (values) => {},
  });

  const [formValidation, setValidation] = useState({
    fnm: null,
    lnm: null,
    unm: null,
    city: null,
    stateV: null,
  });

  function handleSubmit(e) {
    e.preventDefault();
    const modifiedV = { ...formValidation };
    var fnm = document.getElementById("validationTooltip01").value;
    var lnm = document.getElementById("validationTooltip02").value;
    var unm = document.getElementById("validationTooltipUsername").value;
    var city = document.getElementById("validationTooltip03").value;
    var stateV = document.getElementById("validationTooltip04").value;

    if (fnm === "") {
      modifiedV["fnm"] = false;
    } else {
      modifiedV["fnm"] = true;
    }

    if (lnm === "") {
      modifiedV["lnm"] = false;
    } else {
      modifiedV["lnm"] = true;
    }

    if (unm === "") {
      modifiedV["unm"] = false;
    } else {
      modifiedV["unm"] = true;
    }

    if (city === "") {
      modifiedV["city"] = false;
    } else {
      modifiedV["city"] = true;
    }

    if (stateV === "") {
      modifiedV["stateV"] = false;
    } else {
      modifiedV["stateV"] = true;
    }
    setValidation(modifiedV);
  }

  //for change tooltip display propery
  const onChangeValidation = (fieldName, value) => {
    const modifiedV = { ...validation };
    if (value !== "") {
      modifiedV[fieldName] = true;
    } else {
      modifiedV[fieldName] = false;
    }
    setValidation(modifiedV);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="فرم ها" breadcrumbItem="اعتبار سنجی فرم" />
          <Row>
            <Col xl="6">
              <Card>
                <CardBody>
                  <h4 className="card-title">React اعتبار سنجی - عادی</h4>
                  <p className="card-title-desc">
                    بازخورد ارزشمند و عملی را به کاربران خود ارائه دهید اعتبار
                    سنجی فرم HTML5 - در همه موارد پشتیبانی شده ما موجود است
                    مرورگرها
                  </p>
                  <Form
                    className="needs-validation"
                    onSubmit={(e) => {
                      e.preventDefault();
                      validation.handleSubmit();
                      return false;
                    }}
                  >
                    <Row>
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label htmlFor="validationCustom01">نام</Label>
                          <Input
                            name="firstname"
                            placeholder="نام ..."
                            type="text"
                            className="form-control"
                            id="validationCustom01"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.firstname || ""}
                            invalid={
                              validation.touched.firstname &&
                              validation.errors.firstname
                                ? true
                                : false
                            }
                          />
                          {validation.touched.firstname &&
                          validation.errors.firstname ? (
                            <FormFeedback type="invalid">
                              {validation.errors.firstname}
                            </FormFeedback>
                          ) : null}
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label htmlFor="validationCustom02">
                            نام خانوادگی
                          </Label>
                          <Input
                            name="lastname"
                            placeholder="نام خانوادگی"
                            type="text"
                            className="form-control"
                            id="validationCustom02"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.lastname || ""}
                            invalid={
                              validation.touched.lastname &&
                              validation.errors.lastname
                                ? true
                                : false
                            }
                          />
                          {validation.touched.lastname &&
                          validation.errors.lastname ? (
                            <FormFeedback type="invalid">
                              {validation.errors.lastname}
                            </FormFeedback>
                          ) : null}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <Label htmlFor="validationCustom04">استان</Label>
                          <Input
                            name="state"
                            placeholder="استان ..."
                            type="text"
                            className="form-control"
                            id="validationCustom04"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.state || ""}
                            invalid={
                              validation.touched.state &&
                              validation.errors.state
                                ? true
                                : false
                            }
                          />
                          {validation.touched.state &&
                          validation.errors.state ? (
                            <FormFeedback type="invalid">
                              {validation.errors.state}
                            </FormFeedback>
                          ) : null}
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <Label htmlFor="validationCustom03">شهر</Label>
                          <Input
                            name="city"
                            placeholder="شهر"
                            type="text"
                            className="form-control"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.city || ""}
                            invalid={
                              validation.touched.city && validation.errors.city
                                ? true
                                : false
                            }
                          />
                          {validation.touched.city && validation.errors.city ? (
                            <FormFeedback type="invalid">
                              {validation.errors.city}
                            </FormFeedback>
                          ) : null}
                        </FormGroup>
                      </Col>

                      <Col md="4">
                        <FormGroup className="mb-3">
                          <Label htmlFor="validationCustom05">کد پستی</Label>
                          <Input
                            name="zip"
                            placeholder="کد پستی"
                            type="text"
                            className="form-control"
                            id="validationCustom05"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.zip || ""}
                            invalid={
                              validation.touched.zip && validation.errors.zip
                                ? true
                                : false
                            }
                          />
                          {validation.touched.zip && validation.errors.zip ? (
                            <FormFeedback type="invalid">
                              {validation.errors.zip}
                            </FormFeedback>
                          ) : null}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="12">
                        <FormGroup className="mb-3">
                          <div className="form-check">
                            <Input
                              type="checkbox"
                              className="form-check-input"
                              id="invalidCheck"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="invalidCheck"
                            >
                              {" "}
                              با شرایط و ضوابط موافقت کنید
                            </Label>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Button color="primary" type="submit">
                      ارسال فرم
                    </Button>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            <Col xl="6">
              <Card>
                <CardBody>
                  <h4 className="card-title">React اعتبارسنجی (نکات ابزار)</h4>
                  <p className="card-title-desc">
                    اگر چیدمان فرم شما اجازه می دهد، می توانید آن را تعویض کنید
                    کلاس‌های <code>.{"{valid | invalid }"}بازخورد</code> برای
                    <code>.{"{valid | invalid }"} راهنمای ابزار</code> کلاس‌ها
                    به نمایش بازخورد تأیید اعتبار در یک راهنمای ابزار سبک
                  </p>
                  <form
                    className="needs-validation"
                    method="post"
                    id="tooltipForm"
                    onSubmit={(e) => {
                      handleSubmit(e);
                    }}
                  >
                    <Row>
                      <Col md="4">
                        <div className="mb-3 position-relative">
                          <Label htmlFor="validationTooltip01">نام</Label>
                          <Input
                            type="text"
                            className="form-control"
                            id="validationTooltip01"
                            placeholder="نام ..."
                            onChange={(event) => {
                              onChangeValidation("fnm", event.target.value);
                            }}
                            valid={validation["fnm"] === true}
                            invalid={
                              validation["fnm"] !== true &&
                              validation["fnm"] !== null
                            }
                          />

                          <div
                            className={
                              validation["fnm"] === true
                                ? "valid-tooltip"
                                : "invalid-tooltip"
                            }
                            name="validate"
                            id="validate1"
                          >
                            {validation["fnm"] === true
                              ? "به نظر خوب است!"
                              : "لطفا نام معتبر را وارد کنید"}
                          </div>
                        </div>
                      </Col>
                      <Col md="4">
                        <div className="mb-3 position-relative">
                          <Label htmlFor="validationTooltip02">
                            نام خانوادگی
                          </Label>
                          <Input
                            type="text"
                            className="form-control"
                            id="validationTooltip02"
                            placeholder="نام خانوادگی"
                            onChange={(event) =>
                              onChangeValidation("lnm", event.target.value)
                            }
                            valid={validation["lnm"] === true}
                            invalid={
                              validation["lnm"] !== true &&
                              validation["lnm"] !== null
                            }
                          />
                          <div
                            className={
                              validation["lnm"] === true
                                ? "valid-tooltip"
                                : "invalid-tooltip"
                            }
                            name="validate"
                            id="validate2"
                          >
                            {validation["lnm"] === true
                              ? "به نظر خوب است !"
                              : "لطفا نام خانوادگی معتبر وارد کنید"}
                          </div>
                        </div>
                      </Col>
                      <Col md="4">
                        <div className="mb-3 position-relative">
                          <Label htmlFor="validationTooltipUsername">
                            نام کاربری
                          </Label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span
                                className="input-group-text"
                                id="validationTooltipUsernamePrepend"
                              >
                                @
                              </span>
                            </div>
                            <Input
                              type="text"
                              className="form-control"
                              id="validationTooltipUsername"
                              placeholder="نام کاربری"
                              onChange={(event) =>
                                onChangeValidation("unm", event.target.value)
                              }
                              valid={validation["unm"] === true}
                              invalid={
                                validation["unm"] !== true &&
                                validation["unm"] !== null
                              }
                            />
                            <div
                              className={
                                validation["unm"] === true
                                  ? "valid-tooltip"
                                  : "invalid-tooltip"
                              }
                              name="validate"
                              id="validate3"
                            >
                              {validation["unm"] === true
                                ? "به نظر خوب است!"
                                : "لطفا یک نام کاربری منحصر به فرد و معتبر انتخاب کنید"}
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <div className="mb-3 position-relative">
                          <Label htmlFor="validationTooltip03">شهر</Label>
                          <Input
                            type="text"
                            className="form-control"
                            id="validationTooltip03"
                            placeholder="شهر ..."
                            onChange={(event) =>
                              onChangeValidation("city", event.target.value)
                            }
                            valid={validation["city"] === true}
                            invalid={
                              validation["city"] !== true &&
                              validation["city"] !== null
                            }
                          />
                          <div
                            className={
                              validation["city"] === true
                                ? "valid-tooltip"
                                : "invalid-tooltip"
                            }
                            name="validate"
                            id="validate4"
                          >
                            {validation["city"] === true
                              ? "به نظر خوب است"
                              : "لطفاً یک نام کاربری منحصر به فرد و معتبر انتخاب کنید. لطفاً یک شهر معتبر ارائه دهید"}
                          </div>
                        </div>
                      </Col>
                      <Col md="6">
                        <div className="mb-3 position-relative">
                          <Label htmlFor="validationTooltip04">استان</Label>
                          <Input
                            type="text"
                            className="form-control"
                            id="validationTooltip04"
                            placeholder="استان ..."
                            onChange={(event) =>
                              onChangeValidation("stateV", event.target.value)
                            }
                            valid={validation["stateV"] === true}
                            invalid={
                              validation["stateV"] !== true &&
                              validation["stateV"] !== null
                            }
                          />
                          <div
                            className={
                              validation["stateV"] === true
                                ? "valid-tooltip"
                                : "invalid-tooltip"
                            }
                            name="validate"
                            id="validate5"
                          >
                            {validation["stateV"] === true
                              ? "به نظر خوب است"
                              : "لطفاً یک وضعیت معتبر ارائه دهید"}
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <Button color="primary" type="submit">
                      ارسال فرم
                    </Button>
                  </form>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle>نوع اعتبارسنجی</CardTitle>
                  <CardSubtitle className="mb-3">
                    جعفری یک اعتبارسنجی reactstrap است. به شما کمک می کند در
                    مورد ارسال فرم به کاربران خود بازخورد ارائه دهید قبل از
                    ارسال آن به سرور شما
                  </CardSubtitle>

                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      validationType.handleSubmit();
                      return false;
                    }}
                  >
                    <div className="mb-3">
                      <Label className="form-label">ضروری</Label>
                      <Input
                        name="نام کاربری"
                        placeholder="چیزی را تایپ کنید"
                        type="text"
                        onChange={validationType.handleChange}
                        onBlur={validationType.handleBlur}
                        value={validationType.values.username || ""}
                        invalid={
                          validationType.touched.username &&
                          validationType.errors.username
                            ? true
                            : false
                        }
                      />
                      {validationType.touched.username &&
                      validationType.errors.username ? (
                        <FormFeedback type="invalid">
                          {validationType.errors.username}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label>مساوی با</Label>
                      <Input
                        name="رمز عبور"
                        type="password"
                        autoComplete="off"
                        placeholder="رمز عبور"
                        onChange={validationType.handleChange}
                        onBlur={validationType.handleBlur}
                        value={validationType.values.password || ""}
                        invalid={
                          validationType.touched.password &&
                          validationType.errors.password
                            ? true
                            : false
                        }
                      />
                      {validationType.touched.password &&
                      validationType.errors.password ? (
                        <FormFeedback type="invalid">
                          {validationType.errors.password}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Input
                        name="رمز عبور1"
                        type="password"
                        autoComplete="off"
                        placeholder="تکرار رمز عبور ..."
                        onChange={validationType.handleChange}
                        onBlur={validationType.handleBlur}
                        value={validationType.values.password1 || ""}
                        invalid={
                          validationType.touched.password1 &&
                          validationType.errors.password1
                            ? true
                            : false
                        }
                      />
                      {validationType.touched.password1 &&
                      validationType.errors.password1 ? (
                        <FormFeedback type="invalid">
                          {validationType.errors.password1}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">ایمیل</Label>
                      <Input
                        name="email"
                        placeholder="ایمیل معتبر وارد کنید"
                        type="email"
                        onChange={validationType.handleChange}
                        onBlur={validationType.handleBlur}
                        value={validationType.values.email || ""}
                        invalid={
                          validationType.touched.email &&
                          validationType.errors.email
                            ? true
                            : false
                        }
                      />
                      {validationType.touched.email &&
                      validationType.errors.email ? (
                        <FormFeedback type="invalid">
                          {validationType.errors.email}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">ارقام</Label>
                      <Input
                        name="digits"
                        label="ارقام"
                        placeholder="رقم ها فقط اعداد را وارد کنید"
                        type="number"
                        onChange={validationType.handleChange}
                        onBlur={validationType.handleBlur}
                        value={validationType.values.digits || ""}
                        invalid={
                          validationType.touched.digits &&
                          validationType.errors.digits
                            ? true
                            : false
                        }
                      />
                      {validationType.touched.digits &&
                      validationType.errors.digits ? (
                        <FormFeedback type="invalid">
                          {validationType.errors.digits}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">عدد</Label>
                      <Input
                        name="number"
                        placeholder="فقط عدد وارد کنید"
                        type="number"
                        onChange={validationType.handleChange}
                        onBlur={validationType.handleBlur}
                        value={validationType.values.number || ""}
                        invalid={
                          validationType.touched.number &&
                          validationType.errors.number
                            ? true
                            : false
                        }
                      />
                      {validationType.touched.number &&
                      validationType.errors.number ? (
                        <FormFeedback type="invalid">
                          {validationType.errors.number}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">الفبایی</Label>
                      <Input
                        name="alphanumeric"
                        placeholder="فقط مقدار الفبای عددی را وارد کنید"
                        type="text"
                        onChange={validationType.handleChange}
                        onBlur={validationType.handleBlur}
                        value={validationType.values.alphanumeric || ""}
                        invalid={
                          validationType.touched.alphanumeric &&
                          validationType.errors.alphanumeric
                            ? true
                            : false
                        }
                      />
                      {validationType.touched.alphanumeric &&
                      validationType.errors.alphanumeric ? (
                        <FormFeedback type="invalid">
                          {validationType.errors.alphanumeric}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <Button type="submit" color="primary">
                        ارسال
                      </Button>{" "}
                      <Button type="reset" color="secondary">
                        لغو
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle>اعتبار سنجی محدوده</CardTitle>
                  <CardSubtitle className="mb-3">
                    جعفری یک اعتبارسنجی reactstrap است. به شما کمک می کند در
                    مورد ارسال فرم به کاربران خود بازخورد ارائه دهید قبل از
                    ارسال آن به سرور شما
                  </CardSubtitle>

                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      rangeValidation.handleSubmit();
                      return false;
                    }}
                  >
                    <div className="mb-3">
                      <Label>حداقل طول</Label>
                      <Input
                        name="min_Length"
                        label="حداقل طول  "
                        placeholder="حداقل طول 6 کاراکتر"
                        type="number"
                        onChange={rangeValidation.handleChange}
                        onBlur={rangeValidation.handleBlur}
                        value={rangeValidation.values.min_Length || ""}
                        invalid={
                          rangeValidation.touched.min_Length &&
                          rangeValidation.errors.min_Length
                            ? true
                            : false
                        }
                      />
                      {rangeValidation.touched.min_Length &&
                      rangeValidation.errors.min_Length ? (
                        <FormFeedback type="invalid">
                          {rangeValidation.errors.min_Length}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label>بیشترین طول</Label>
                      <Input
                        name="max_Length"
                        placeholder="بیشترین طول 6 کاراکتر"
                        type="number"
                        onChange={rangeValidation.handleChange}
                        onBlur={rangeValidation.handleBlur}
                        value={rangeValidation.values.max_Length || ""}
                        invalid={
                          rangeValidation.touched.max_Length &&
                          rangeValidation.errors.max_Length
                            ? true
                            : false
                        }
                      />
                      {rangeValidation.touched.max_Length &&
                      rangeValidation.errors.max_Length ? (
                        <FormFeedback type="invalid">
                          {rangeValidation.errors.max_Length}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">طول برد</Label>
                      <Input
                        name="range_Length"
                        placeholder="طول متن بین 5 تا 10 کاراکتر"
                        type="number"
                        onChange={rangeValidation.handleChange}
                        onBlur={rangeValidation.handleBlur}
                        value={rangeValidation.values.range_Length || ""}
                        invalid={
                          rangeValidation.touched.range_Length &&
                          rangeValidation.errors.range_Length
                            ? true
                            : false
                        }
                      />
                      {rangeValidation.touched.range_Length &&
                      rangeValidation.errors.range_Length ? (
                        <FormFeedback type="invalid">
                          {rangeValidation.errors.range_Length}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">حداقل مقدار</Label>
                      <Input
                        name="min_Value"
                        placeholder="حداقل مقدار 6 کاراکتر"
                        min={6}
                        type="number"
                        onChange={rangeValidation.handleChange}
                        onBlur={rangeValidation.handleBlur}
                        value={rangeValidation.values.min_Value || ""}
                        invalid={
                          rangeValidation.touched.min_Value &&
                          rangeValidation.errors.min_Value
                            ? true
                            : false
                        }
                      />
                      {rangeValidation.touched.min_Value &&
                      rangeValidation.errors.min_Value ? (
                        <FormFeedback type="invalid">
                          {rangeValidation.errors.min_Value}
                        </FormFeedback>
                      ) : null}
                    </div>

                    <div className="mb-3">
                      <Label className="form-label">حداکثر مقدار</Label>
                      <Input
                        name="max_Value"
                        placeholder="حداکثر مقدار 6 کاراکتر"
                        max={6}
                        type="number"
                        onChange={rangeValidation.handleChange}
                        onBlur={rangeValidation.handleBlur}
                        value={rangeValidation.values.max_Value || ""}
                        invalid={
                          rangeValidation.touched.max_Value &&
                          rangeValidation.errors.max_Value
                            ? true
                            : false
                        }
                      />
                      {rangeValidation.touched.max_Value &&
                      rangeValidation.errors.max_Value ? (
                        <FormFeedback type="invalid">
                          {rangeValidation.errors.max_Value}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">مقدار محدوده</Label>
                      <Input
                        name="range_Value"
                        placeholder="تعداد بین 6 تا 100"
                        max={6}
                        type="number"
                        onChange={rangeValidation.handleChange}
                        onBlur={rangeValidation.handleBlur}
                        value={rangeValidation.values.range_Value || ""}
                        invalid={
                          rangeValidation.touched.range_Value &&
                          rangeValidation.errors.range_Value
                            ? true
                            : false
                        }
                      />
                      {rangeValidation.touched.range_Value &&
                      rangeValidation.errors.range_Value ? (
                        <FormFeedback type="invalid">
                          {rangeValidation.errors.range_Value}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">انقضای معمولی</Label>
                      <Input
                        name="regular_Exp"
                        placeholder="Hex. رنگ"
                        type="number"
                        onChange={rangeValidation.handleChange}
                        onBlur={rangeValidation.handleBlur}
                        value={rangeValidation.values.regular_Exp || ""}
                        invalid={
                          rangeValidation.touched.regular_Exp &&
                          rangeValidation.errors.regular_Exp
                            ? true
                            : false
                        }
                        // validate={{
                        //   required: { value: true },
                        //   pattern: {
                        //     value: "^[#0-9]+$",
                        //     errorMessage: "Only Hex Value",
                        //   },
                        // }}
                      />
                      {rangeValidation.touched.regular_Exp &&
                      rangeValidation.errors.regular_Exp ? (
                        <FormFeedback type="invalid">
                          {rangeValidation.errors.regular_Exp}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <FormGroup className="mb-0">
                      <div>
                        <Button type="submit" color="primary" className="ms-1">
                          ارسال
                        </Button>{" "}
                        <Button type="reset" color="secondary">
                          لغو
                        </Button>
                      </div>
                    </FormGroup>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default FormValidations
