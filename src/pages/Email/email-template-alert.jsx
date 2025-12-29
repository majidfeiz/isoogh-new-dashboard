import React from "react"
import { Row, Col, Container } from "reactstrap"
import { Link } from "react-router-dom"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

const EmailAlertTemplte = props => {
   //meta title
   document.title="ایمیل هشدار | Skote - قالب مدیریتی و داشبورد Vite React ";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="قالب ایمیل" breadcrumbItem="ایمیل هشدار" />

          <Row className="email-template">
            <Col md={12}>
              <table
                className="body-wrap"
                style={{
                  fontFamily: "yekan,Helvetica,Arial,sans-serif",
                  boxSizing: "border-box",
                  fontSize: "14px",
                  width: "100%",
                  margin: "0",
                  color: "#495057",
                }}
              >
                <tbody>
                  <tr
                    style={{
                      fontFamily: "yekan,Helvetica,Arial,sans-serif",
                      boxSizing: "border-box",
                      fontSize: "14px",
                      margin: "0",
                    }}
                  >
                    <td
                      style={{
                        fontFamily: "yekan,Helvetica,Arial,sans-serif",
                        boxSizing: "border-box",
                        fontSize: "14px",
                        verticalAlign: "top",
                        margin: "0",
                      }}
                      valign="top"
                    ></td>
                    <td
                      className="container"
                      width="600"
                      style={{
                        fontFamily: "yekan,Helvetica,Arial,sans-serif",
                        boxSizing: "border-box",
                        fontSize: "14px",
                        verticalAlign: "top",
                        display: "block",
                        maxWidth: "600px",
                        clear: "both",
                        margin: "0 auto",
                      }}
                      valign="top"
                    >
                      <div
                        className="content"
                        style={{
                          fontFamily:
                            "yekan,Helvetica,Arial,sans-serif",
                          boxSizing: "border-box",
                          fontSize: "14px",
                          maxWidth: "600px",
                          display: "block",
                          margin: "0 auto",
                          padding: "20px",
                        }}
                      >
                        <table
                          className="main"
                          width="100%"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{
                            fontFamily:
                              "yekan,Helvetica,Arial,sans-serif",
                            boxSizing: "border-box",
                            fontSize: "14px",
                            borderRadius: "7px",
                            backgroundColor: "#fff",
                            margin: "0",
                            boxShadow: "0 0.75rem 1.5rem rgba(18,38,63,.03)",
                          }}
                        >
                          <tbody>
                            <tr
                              style={{
                                fontFamily:
                                  "yekan,Helvetica,Arial,sans-serif",
                                boxSizing: "border-box",
                                fontSize: "14px",
                                margin: "0",
                              }}
                            >
                              <td
                                style={{
                                  fontFamily:
                                    "yekan,Helvetica,Arial,sans-serif",
                                  boxSizing: "border-box",
                                  fontSize: "16px",
                                  verticalAlign: "top",
                                  color: "#fff",
                                  fontWeight: "500",
                                  textAlign: "center",
                                  borderRadius: "3px 3px 0px 0px",
                                  backgroundColor: "#556ee6",
                                  margin: "0",
                                  padding: "20px",
                                }}
                                align="center"
                                valign="top"
                              >
                                هشدار: شما به حد مجاز خود نزدیک می شوید. لطفا
                                ارتقا دهید
                              </td>
                            </tr>
                            <tr
                              style={{
                                fontFamily:
                                  "yekan,Helvetica,Arial,sans-serif",
                                boxSizing: "border-box",
                                fontSize: "14px",
                                margin: "0",
                              }}
                            >
                              <td
                                className="content-wrap"
                                style={{
                                  fontFamily:
                                    "yekan,Helvetica,Arial,sans-serif",
                                  boxSizing: "border-box",
                                  fontSize: "14px",
                                  verticalAlign: "top",
                                  margin: "0",
                                  padding: "20px",
                                }}
                                valign="top"
                              >
                                <table
                                  width="100%"
                                  cellPadding="0"
                                  cellSpacing="0"
                                  style={{
                                    fontFamily:
                                      "yekan,Helvetica,Arial,sans-serif",
                                    boxSizing: "border-box",
                                    fontSize: "14px",
                                    margin: "0",
                                  }}
                                >
                                  <tbody>
                                    <tr
                                      style={{
                                        fontFamily:
                                          "yekan,Helvetica,Arial,sans-serif",
                                        boxSizing: "border-box",
                                        fontSize: "14px",
                                        margin: "0",
                                      }}
                                    >
                                      <td
                                        className="content-block"
                                        style={{
                                          fontFamily:
                                            "yekan,Helvetica,Arial,sans-serif",
                                          boxSizing: "border-box",
                                          fontSize: "14px",
                                          verticalAlign: "top",
                                          margin: "0",
                                          padding: "0 0 20px",
                                        }}
                                        valign="top"
                                      >
                                        برای شما{" "}
                                        <strong
                                          style={{
                                            fontFamily:
                                              "yekan,Helvetica,Arial,sans-serif",
                                            boxSizing: "border-box",
                                            fontSize: "14px",
                                            margin: "0",
                                          }}
                                        >
                                          <span
                                            style={{
                                              backgroundColor: "#f46a6a",
                                              color: "#ffffff",
                                              padding: "5px 8px",
                                              fontSize: "12px",
                                              borderRadius: "4px",
                                            }}
                                          >
                                            1 گزارش رایگان
                                          </span>
                                        </strong>{" "}
                                        باقی مانده است.
                                      </td>
                                    </tr>
                                    <tr
                                      style={{
                                        fontFamily:
                                          "yekan,Helvetica,Arial,sans-serif",
                                        boxSizing: "border-box",
                                        fontSize: "14px",
                                        margin: "0",
                                      }}
                                    >
                                      <td
                                        className="content-block"
                                        style={{
                                          fontFamily:
                                            "yekan,Helvetica,Arial,sans-serif",
                                          boxSizing: "border-box",
                                          fontSize: "14px",
                                          verticalAlign: "top",
                                          margin: "0",
                                          padding: "0 0 20px",
                                        }}
                                        valign="top"
                                      >
                                        اکنون کارت اعتباری خود را برای ارتقاء
                                        کارت اضافه کنید حساب به یک طرح حق بیمه
                                        برای اطمینان از شما نیاز دارد
                                      </td>
                                    </tr>
                                    <tr
                                      style={{
                                        fontFamily:
                                          "yekan,Helvetica,Arial,sans-serif",
                                        boxSizing: "border-box",
                                        fontSize: "14px",
                                        margin: "0",
                                      }}
                                    >
                                      <td
                                        className="content-block"
                                        style={{
                                          fontFamily:
                                            "yekan,Helvetica,Arial,sans-serif",
                                          boxSizing: "border-box",
                                          fontSize: "14px",
                                          verticalAlign: "top",
                                          margin: "0",
                                          padding: "0 0 20px",
                                        }}
                                        valign="top"
                                      >
                                        <Link
                                          to="#"
                                          className="btn-primary"
                                          style={{
                                            fontFamily:
                                              "yekan,Helvetica,Arial,sans-serif",
                                            boxSizing: "border-box",
                                            fontSize: "14px",
                                            color: "#FFF",
                                            textDecoration: "none",
                                            lineHeight: "2em",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                            cursor: "pointer",
                                            display: "inline-block",
                                            borderRadius: "5px",
                                            textTransform: "capitalize",
                                            backgroundColor: "#34c38f",
                                            margin: "0",
                                            borderColor: "#34c38f",
                                            borderStyle: "solid",
                                            borderWidth: "8px 16px",
                                          }}
                                        >
                                        ارتقاء حساب من
                                        </Link>
                                      </td>
                                    </tr>
                                    <tr
                                      style={{
                                        fontFamily:
                                          "yekan,Helvetica,Arial,sans-serif",
                                        boxSizing: "border-box",
                                        fontSize: "14px",
                                        margin: "0",
                                      }}
                                    >
                                      <td
                                        className="content-block"
                                        style={{
                                          fontFamily:
                                            "yekan,Helvetica,Arial,sans-serif",
                                          boxSizing: "border-box",
                                          fontSize: "14px",
                                          verticalAlign: "top",
                                          margin: "0",
                                          padding: "0 0 20px",
                                        }}
                                        valign="top"
                                      >
                                        متشکر از انتخاب <b>Skote</b> Admin.
                                      </td>
                                    </tr>
                                    <tr
                                      style={{
                                        fontFamily:
                                          "yekan,Helvetica,Arial,sans-serif",
                                        boxSizing: "border-box",
                                        fontSize: "14px",
                                        margin: "0",
                                      }}
                                    >
                                      <td
                                        className="content-block"
                                        style={{
                                          fontFamily:
                                            "yekan,Helvetica,Arial,sans-serif",
                                          boxSizing: "border-box",
                                          fontSize: "14px",
                                          verticalAlign: "top",
                                          margin: "0",
                                          padding: "0 0 20px",
                                        }}
                                        valign="top"
                                      >
                                        <b>Skote</b>
                                        <p>تیم پشتیبانی</p>
                                      </td>
                                    </tr>

                                    <tr
                                      style={{
                                        fontFamily:
                                          "yekan,Helvetica,Arial,sans-serif",
                                        boxSizing: "border-box",
                                        fontSize: "14px",
                                        margin: "0",
                                      }}
                                    >
                                      <td
                                        className="content-block"
                                        style={{
                                          textAlign: "center",
                                          fontFamily:
                                            "yekan,Helvetica,Arial,sans-serif",
                                          boxSizing: "border-box",
                                          fontSize: "14px",
                                          verticalAlign: "top",
                                          margin: "0",
                                          padding: "0",
                                        }}
                                        valign="top"
                                      >
                                        © {new Date().getFullYear()} Skote
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default EmailAlertTemplte
