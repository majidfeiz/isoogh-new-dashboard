import React from "react";
import { Row, Col, Container } from "reactstrap";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const EmailTemplateBilling = props => {
   //meta title
   document.title="ایمیل صورتحساب | Skote - قالب مدیریتی و داشبورد Vite React ";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="قالب ایمیل" breadcrumbItem="ایمیل صورتحساب" />

          <Row className="email-template">
            <Col md="12">
              <table
                className="body-wrap"
                style={{
                  fontFamily: "yekan,Helvetica,Arial,sans-serif",
                  boxSizing: "border-box",
                  fontSize: "14px",
                  width: "100%",
                  backgroundColor: "transparent",
                  margin: "0",
                  color: "#495057",
                }}
                bgcolor="#f6f6f6"
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
                            margin: "0",
                            border: "none",
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
                                className="content-wrap aligncenter"
                                style={{
                                  fontFamily:
                                    "yekan,Helvetica,Arial,sans-serif",
                                  boxSizing: "border-box",
                                  fontSize: "14px",
                                  verticalAlign: "top",
                                  margin: "0",
                                  padding: "20px",
                                  border: "3px solid #1d1e3a",
                                  borderRadius: "7px",
                                  backgroundColor: "#fff",
                                }}
                                align="center"
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
                                        <h2
                                          className="aligncenter"
                                          style={{
                                            fontFamily:
                                              "yekan,Helvetica,Arial,Lucida Grande,sans-serif",
                                            boxSizing: "border-box",
                                            fontSize: "24px",
                                            color: "#000",
                                            lineHeight: "1.2em",
                                            fontWeight: "400",
                                            textAlign: "center",
                                            margin: "40px 0 0",
                                          }}
                                          align="center"
                                        >
                                          با تشکر از شما به دلیل استفاده از{" "}
                                          <b style={{ fontWeight: "600" }}>
                                            {" "}
                                            SKOTE
                                          </b>
                                          .
                                        </h2>
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
                                        className="content-block aligncenter"
                                        style={{
                                          fontFamily:
                                            "yekan,Helvetica,Arial,sans-serif",
                                          boxSizing: "border-box",
                                          fontSize: "14px",
                                          verticalAlign: "top",
                                          textAlign: "center",
                                          margin: "0",
                                          padding: "0 0 20px",
                                        }}
                                        align="center"
                                        valign="top"
                                      >
                                        <table
                                          className="invoice"
                                          style={{
                                            fontFamily:
                                              "yekan,Helvetica,Arial,sans-serif",
                                            boxSizing: "border-box",
                                            fontSize: "14px",
                                            textAlign: "left",
                                            width: "80%",
                                            margin: "40px auto",
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
                                                  fontSize: "14px",
                                                  verticalAlign: "top",
                                                  margin: "0",
                                                  padding: "5px 0",
                                                }}
                                                valign="top"
                                              >
                                                <b>نام شرکت</b>
                                                <br
                                                  style={{
                                                    fontFamily:
                                                      "yekan,Helvetica,Arial,sans-serif",
                                                    boxSizing: "border-box",
                                                    fontSize: "14px",
                                                    margin: "0",
                                                  }}
                                                />
                                                صورتحساب #6521
                                                <br
                                                  style={{
                                                    fontFamily:
                                                      "yekan,Helvetica,Arial,sans-serif",
                                                    boxSizing: "border-box",
                                                    fontSize: "14px",
                                                    margin: "0",
                                                  }}
                                                />
                                                آبان 01 1402
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
                                                style={{
                                                  fontFamily:
                                                    "yekan,Helvetica,Arial,sans-serif",
                                                  boxSizing: "border-box",
                                                  fontSize: "14px",
                                                  verticalAlign: "top",
                                                  margin: "0",
                                                  padding: "5px 0",
                                                }}
                                                valign="top"
                                              >
                                                <table
                                                  className="invoice-items"
                                                  cellPadding="0"
                                                  cellSpacing="0"
                                                  style={{
                                                    fontFamily:
                                                      "yekan,Helvetica,Arial,sans-serif",
                                                    boxSizing: "border-box",
                                                    fontSize: "14px",
                                                    width: "100%",
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
                                                        className="email-billing-list"
                                                        style={{
                                                          fontFamily:
                                                            "yekan,Helvetica,Arial,sans-serif",
                                                          boxSizing:
                                                            "border-box",
                                                          fontSize: "14px",
                                                          verticalAlign: "top",
                                                          borderTopWidth: "1px",
                                                          borderTopColor:
                                                            "#eee",
                                                          borderTopStyle:
                                                            "solid",
                                                          margin: "0",
                                                          padding: "5px 0",
                                                        }}
                                                        valign="top"
                                                      >
                                                       BS-200 (1 عدد)
                                                      </td>
                                                      <td
                                                        className="email-billing-list alignright"
                                                        style={{
                                                          fontFamily:
                                                            "yekan,Helvetica,Arial,sans-serif",
                                                          boxSizing:
                                                            "border-box",
                                                          fontSize: "14px",
                                                          verticalAlign: "top",
                                                          textAlign: "right",
                                                          borderTopWidth: "1px",
                                                          borderTopColor:
                                                            "#eee",
                                                          borderTopStyle:
                                                            "solid",
                                                          margin: "0",
                                                          padding: "5px 0",
                                                        }}
                                                        align="right"
                                                        valign="top"
                                                      >
                                                        تومان 10.99
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
                                                        className="email-billing-list"
                                                        style={{
                                                          fontFamily:
                                                            "yekan,Helvetica,Arial,sans-serif",
                                                          boxSizing:
                                                            "border-box",
                                                          fontSize: "14px",
                                                          verticalAlign: "top",
                                                          borderTopWidth: "1px",
                                                          borderTopColor:
                                                            "#eee",
                                                          borderTopStyle:
                                                            "solid",
                                                          margin: "0",
                                                          padding: "5px 0",
                                                        }}
                                                        valign="top"
                                                      >
                                                        BS-400 (2 عدد )
                                                      </td>
                                                      <td
                                                        className="email-billing-list alignright"
                                                        style={{
                                                          fontFamily:
                                                            "yekan,Helvetica,Arial,sans-serif",
                                                          boxSizing:
                                                            "border-box",
                                                          fontSize: "14px",
                                                          verticalAlign: "top",
                                                          textAlign: "right",
                                                          borderTopWidth: "1px",
                                                          borderTopColor:
                                                            "#eee",
                                                          borderTopStyle:
                                                            "solid",
                                                          margin: "0",
                                                          padding: "5px 0",
                                                        }}
                                                        align="right"
                                                        valign="top"
                                                      >
                                                        تومان60.00
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
                                                        className="email-billing-list alignright"
                                                        style={{
                                                          fontFamily:
                                                            "yekan,Helvetica,Arial,sans-serif",
                                                          boxSizing:
                                                            "border-box",
                                                          fontSize: "14px",
                                                          verticalAlign: "top",
                                                          borderTopWidth: "1px",
                                                          borderTopColor:
                                                            "#eee",
                                                          borderTopStyle:
                                                            "solid",
                                                          margin: "0",
                                                          padding: "5px 0",
                                                        }}
                                                        valign="top"
                                                      >
                                                        BS-1000 (1 عدد )
                                                      </td>
                                                      <td
                                                        className="alignright"
                                                        style={{
                                                          fontFamily:
                                                            "yekan,Helvetica,Arial,sans-serif",
                                                          boxSizing:
                                                            "border-box",
                                                          fontSize: "14px",
                                                          verticalAlign: "top",
                                                          textAlign: "right",
                                                          borderTopWidth: "1px",
                                                          borderTopColor:
                                                            "#eee",
                                                          borderTopStyle:
                                                            "solid",
                                                          margin: "0",
                                                          padding: "5px 0",
                                                        }}
                                                        align="right"
                                                        valign="top"
                                                      >
                                                        600.00 تومان
                                                      </td>
                                                    </tr>
                                                    <tr
                                                      className="total"
                                                      style={{
                                                        fontFamily:
                                                          "yekan,Helvetica,Arial,sans-serif",
                                                        boxSizing: "border-box",
                                                        fontSize: "14px",
                                                        margin: "0",
                                                      }}
                                                    >
                                                      <td
                                                        className="alignright"
                                                        width="80%"
                                                        style={{
                                                          fontFamily:
                                                            "yekan,Helvetica,Arial,sans-serif",
                                                          boxSizing:
                                                            "border-box",
                                                          fontSize: "14px",
                                                          verticalAlign: "top",
                                                          textAlign: "right",
                                                          borderTopWidth: "2px",
                                                          borderTopColor:
                                                            "#333",
                                                          borderTopStyle:
                                                            "solid",
                                                          borderBottomColor:
                                                            "#333",
                                                          borderBottomWidth:
                                                            "2px",
                                                          borderBottomStyle:
                                                            "solid",
                                                          fontWeight: "700",
                                                          margin: "0",
                                                          padding: "5px 0",
                                                        }}
                                                        align="right"
                                                        valign="top"
                                                      >
                                                        مجموع
                                                      </td>
                                                      <td
                                                        className="alignright"
                                                        style={{
                                                          fontFamily:
                                                            "yekan,Helvetica,Arial,sans-serif",
                                                          boxSizing:
                                                            "border-box",
                                                          fontSize: "14px",
                                                          verticalAlign: "top",
                                                          textAlign: "right",
                                                          borderTopWidth: "2px",
                                                          borderTopColor:
                                                            "#333",
                                                          borderTopStyle:
                                                            "solid",
                                                          borderBottomColor:
                                                            "#333",
                                                          borderBottomWidth:
                                                            "2px",
                                                          borderBottomStyle:
                                                            "solid",
                                                          fontWeight: "700",
                                                          margin: "0",
                                                          padding: "5px 0",
                                                        }}
                                                        align="right"
                                                        valign="top"
                                                      >
                                                        تومان 670.99
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
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
                                        className="content-block aligncenter"
                                        style={{
                                          fontFamily:
                                            "yekan,Helvetica,Arial,sans-serif",
                                          boxSizing: "border-box",
                                          fontSize: "14px",
                                          verticalAlign: "top",
                                          textAlign: "center",
                                          margin: " 0",
                                          padding: " 0 0 20px",
                                        }}
                                        align="center"
                                        valign="top"
                                      >
                                            کمپانی Skote,خیابان اصلی بهشتی، شماره 2550
                                    
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
};

export default EmailTemplateBilling;
