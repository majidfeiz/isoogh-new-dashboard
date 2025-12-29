import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import withRouter from "../../components/Common/withRouter";

import * as Yup from "yup";
import { useFormik } from "formik";
import { useAuth } from "../../context/AuthContext";

import {
  Row,
  Col,
  CardBody,
  Card,
  Alert,
  Container,
  Form,
  Input,
  FormFeedback,
  Label,
} from "reactstrap";

import profile from "../../assets/images/profile-img.png";
import logo from "../../assets/images/logo.svg";
import lightlogo from "../../assets/images/logo-light.svg";

import { login as loginApi } from "../../services/authService.jsx";

const Login = (props) => {
  document.title = "سیستم ورود به آیسوق";

  // الان به جای یک رشته، آرایه‌ای از رشته‌ها نگه می‌داریم
  const [serverErrors, setServerErrors] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const { setUser, setPermissions, syncToken } = useAuth();

  const validation = useFormik({
    enableReinitialize: false,
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("لطفا نام کاربری را وارد کنید"),
      password: Yup.string().required("لطفا رمز عبور خود را وارد کنید"),
    }),
    onSubmit: async (values) => {
      setServerErrors([]);
      setLoading(true);

      try {
        const result = await loginApi(values.username, values.password);

        const perms = Array.isArray(result?.user?.permissions)
          ? result.user.permissions.map((p) => p?.name).filter(Boolean)
          : [];

        setUser(result?.user ?? null);
        setPermissions(perms);

        // syncToken();

        props.router.navigate("/dashboard");
      } catch (err) {
        console.error(err);
        const data = err?.response?.data;

        let messages = [];

        if (Array.isArray(data?.message)) {
          messages = data.message;
        } else if (typeof data?.message === "string") {
          messages = [data.message];
        } else {
          messages = ["خطا در ورود. لطفا اطلاعات را بررسی کنید."];
        }

        setServerErrors(messages);
      } finally {
        setLoading(false);
      }
    },
  });

  const socialResponse = () => {
    // TODO: اتصال به socialLogin بک‌اند
  };

  return (
    <React.Fragment>
      <div className="home-btn d-none d-sm-block">
        <Link to="/" className="text-dark">
          <i className="bx bx-home h2" />
        </Link>
      </div>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="overflow-hidden">
                <div className="bg-primary-subtle">
                  <Row>
                    <Col xs={7}>
                      <div className="text-primary p-4">
                        <h5 className="text-primary">خوش آمدید !</h5>
                        <p>برای ادامه به آیسوق وارد شوید</p>
                      </div>
                    </Col>
                    <Col className="col-5 align-self-end">
                      <img src={profile} alt="" className="img-fluid" />
                    </Col>
                  </Row>
                </div>
                <CardBody className="pt-0">
                  <div className="auth-logo">
                    <Link to="/" className="auth-logo-light">
                      <div className="avatar-md profile-user-wid mb-4">
                        <span className="avatar-title rounded-circle bg-light">
                          <img
                            src={lightlogo}
                            alt=""
                            className="rounded-circle"
                            height="34"
                          />
                        </span>
                      </div>
                    </Link>
                    <Link to="/" className="auth-logo-dark">
                      <div className="avatar-md profile-user-wid mb-4">
                        <span className="avatar-title rounded-circle bg-light">
                          <img
                            src={logo}
                            alt=""
                            className="rounded-circle"
                            height="34"
                          />
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className="p-2">
                    <Form
                      className="form-horizontal"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      {/* نمایش همه خطاهای بک‌اند */}
                      {serverErrors.length > 0 && (
                        <Alert color="danger">
                          <ul className="mb-0">
                            {serverErrors.map((msg, idx) => (
                              <li key={idx}>{msg}</li>
                            ))}
                          </ul>
                        </Alert>
                      )}

                      {/* نام کاربری به جای ایمیل */}
                      <div className="mb-3">
                        <Label className="form-label">نام کاربری</Label>
                        <Input
                          name="username"
                          className="form-control"
                          placeholder="نام کاربری را وارد کنید"
                          type="text"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.username || ""}
                          invalid={
                            validation.touched.username &&
                            validation.errors.username
                              ? true
                              : false
                          }
                        />
                        {validation.touched.username &&
                        validation.errors.username ? (
                          <FormFeedback type="invalid">
                            {validation.errors.username}
                          </FormFeedback>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <Label className="form-label">رمز عبور</Label>
                        <Input
                          name="password"
                          autoComplete="off"
                          value={validation.values.password || ""}
                          type="password"
                          placeholder="رمز عبور را وارد کنید"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          invalid={
                            validation.touched.password &&
                            validation.errors.password
                              ? true
                              : false
                          }
                        />
                        {validation.touched.password &&
                        validation.errors.password ? (
                          <FormFeedback type="invalid">
                            {validation.errors.password}
                          </FormFeedback>
                        ) : null}
                      </div>

                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customControlInline"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customControlInline"
                        >
                          مرا به خاطر بسپار
                        </label>
                      </div>

                      <div className="mt-3 d-grid">
                        <button
                          className="btn btn-primary btn-block"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? "در حال ورود..." : "ورود"}
                        </button>
                      </div>

                      {/* <div className="mt-4 text-center">
                        <h5 className="font-size-14 mb-3">وارد شدن با</h5>

                        <ul className="list-inline">
                          <li className="list-inline-item">
                            <Link
                              to="#"
                              className="social-list-item bg-primary text-white border-primary"
                              onClick={(e) => {
                                e.preventDefault();
                                socialResponse("facebook");
                              }}
                            >
                              <i className="mdi mdi-facebook" />
                            </Link>
                          </li>
                          <li className="list-inline-item">
                            <Link
                              to="#"
                              className="social-list-item bg-danger text-white border-danger"
                              onClick={(e) => {
                                e.preventDefault();
                                socialResponse("google");
                              }}
                            >
                              <i className="mdi mdi-google" />
                            </Link>
                          </li>
                        </ul>
                      </div> */}

                      {/* <div className="mt-4 text-center">
                        <Link to="/forgot-password" className="text-muted">
                          <i className="mdi mdi-lock me-1" />
                          رمز عبور خود را فراموش کرده اید؟
                        </Link>
                      </div> */}
                    </Form>
                  </div>
                </CardBody>
              </Card>
              <div className="mt-5 text-center">
                {/* <p>
                  حسابی ندارید ؟{" "}
                  <Link to="/register" className="fw-medium text-primary">
                    اکنون ثبت نام کنید
                  </Link>
                </p> */}
                <p>
                  © {new Date().getFullYear()} ساخته شده توسط{" "}
                  <i className="mdi mdi-heart text-danger" /> تیم آیسوق
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(Login);

Login.propTypes = {
  history: PropTypes.object,
};
