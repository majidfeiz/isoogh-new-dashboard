import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import withRouter from "../../components/Common/withRouter";
import {
  Button,
  Card,
  Col,
  Container,
  Input,
  Label,
  Row,
  Nav,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NavItem,
} from "reactstrap";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

import classnames from "classnames";

// Import Editor
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import {
  getMailsLists as onGetMailsLists,
  getSelectedMails as onGetSelectedMails,
  staredMail as onStaredMail
} from "/src/store/mails/actions";

//Import Email Topbar
import EmailToolbar from "./email-toolbar";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { labelsData, mailChatData } from "../../common/data";
import Spinners from "../../components/Common/Spinner";

const EmailInbox = () => {
  //meta title
  document.title = "صندوق ورودی| Skote - قالب مدیریتی و داشبورد Vite React ";

  const dispatch = useDispatch();
  const [mailsList, setMailsList] = useState();

  const EmailProperties = createSelector(
    (state) => state.mails,
    (Mails) => ({
      mailsLists: Mails.mailslists,
      selectedmails: Mails.selectedmails,
      loading: Mails.loading
    })
  );

  const { mailsLists, loading, selectedmails } = useSelector(EmailProperties);
  const [isLoading, setLoading] = useState(loading);
  const [checkbox, setCheckbox] = useState(false);

  useEffect(() => {
    setMailsList(mailsLists)
    const read = mailsLists.filter((item) => !item.read).length;
    setBadgeLength(read);
  }, [mailsLists])

  const [activeTab, setActiveTab] = useState("1");
  const [modal, setModal] = useState(false);
  const [badgeLength, setBadgeLength] = useState();

  useEffect(() => {
    dispatch(onGetMailsLists(0));
  }, [dispatch]);

  const handleSelect = (selectedItems) => {
    dispatch(onGetSelectedMails(selectedItems));
  };

  const [displayCategory, setDisplayCategory] = useState("inbox")
  const filterMails = ({ category }) => {
    if (displayCategory === "inbox" && category === "trash") {
      return false;
    }
    return (
      (displayCategory === "inbox" || displayCategory === category)
    );
  }

  const checkFirstCheckbox = () => {
    const checkboxElement = document.querySelectorAll('.message-list input[type="checkbox"]');
    let isChecked = false;

    checkboxElement.forEach((checkboxElement) => {
      if (checkboxElement.checked) {
        isChecked = true;
        return;
      }
    });

    setCheckbox(isChecked);
  };

  // search 
  const handelSearch = (searchQuery) => {
    const filteredEmails = mailsLists.filter((email) =>
      email.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setMailsList(filteredEmails);
  }

  // Starred Mail
  const starredBtn = (item) => {
    dispatch(onStaredMail(item.id));
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="ایمیل" breadcrumbItem="صندوق ورودی" />

          <Row>
            <Col xs="12">
              {/* Render Email SideBar */}
              <Card className="email-leftbar">
                <Button
                  type="button"
                  color="danger"
                  onClick={() => {
                    setModal(!modal);
                  }}
                  block
                >
                  نوشتن
                </Button>
                <div className="mail-list mt-4">
                  <Nav tabs className="nav-tabs-custom" vertical role="tablist">
                    <NavItem>
                      <a
                        href="#!"
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => {
                          setActiveTab("1");
                          setDisplayCategory("inbox");
                        }}
                      >
                        <i className="mdi mdi-email-outline me-2"></i> ورودی
                        <span className="ml-1 float-end">
                          {badgeLength === 0 ? "" : badgeLength}
                        </span>
                      </a>
                    </NavItem>

                    <NavItem>
                      <a
                        href="#!"
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => {
                          setActiveTab("2");
                          setDisplayCategory("ستاره دار");
                          setBadgeLength(0);
                        }}
                      >
                        <i className="mdi mdi-star-outline me-2"></i>ستاره دار
                      </a>
                    </NavItem>

                    <NavItem>
                      <a
                        href="#!"
                        className={classnames({ active: activeTab === "3" })}
                        onClick={() => {
                          setActiveTab("3");
                          setDisplayCategory("مهم");
                          setBadgeLength(0);
                        }}
                      >
                        <i className="mdi mdi-diamond-stone me-2"></i>مهم
                      </a>
                    </NavItem>

                    <NavItem>
                      <a
                        href="#!"
                        className={classnames({ active: activeTab === "4" })}
                        onClick={() => {
                          setActiveTab("4");
                          setDisplayCategory("در انتظار");
                          setBadgeLength(0);
                        }}
                      >
                        <i className="mdi mdi-file-outline me-2"></i>پیش نویس
                      </a>
                    </NavItem>

                    <NavItem>
                      <a
                        href="#!"
                        className={classnames({ active: activeTab === "5" })}
                        onClick={() => {
                          setActiveTab("5");
                          setDisplayCategory("ارسال شده");
                          setBadgeLength(0);
                        }}
                      >
                        <i className="mdi mdi-email-check-outline me-2"></i>
                        ارسال شده
                      </a>
                    </NavItem>

                    <NavItem>
                      <a
                        href="#!"
                        className={classnames({ active: activeTab === "6" })}
                        onClick={() => {
                          setActiveTab("6");
                          setDisplayCategory("سطل زباله");
                          setBadgeLength(0);
                        }}
                      >
                        <i className="mdi mdi-trash-can-outline me-2"></i>سطل
                        زباله
                      </a>
                    </NavItem>
                  </Nav>
                </div>

                <h6 className="mt-4">برچسب ها</h6>

                <div className="mail-list mt-1">
                  {(labelsData || []).map((item, index) => (
                    <Link to="#" key={index}>
                      <span className={item.icon}></span>
                      {item.text}
                    </Link>
                  ))}
                </div>

                <h6 className="mt-4">چت</h6>

                <div className="mt-2">
                  {(mailChatData || []).map((item, index) => (
                    <Link to="#" className="d-flex" key={index}>
                      <div className="flex-shrink-0">
                        <img
                          className="d-flex me-3 rounded-circle"
                          src={item.imageSrc}
                          alt="skote"
                          height="36"
                        />
                      </div>
                      <div className="flex-grow-1 chat-user-box">
                        <p className="user-title m-0">{item.userTitle}</p>
                        <p className="text-muted">{item.textMessage}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>

              <Modal
                isOpen={modal}
                autoFocus={true}
                centered={true}
                toggle={() => {
                  setModal(!modal);
                }}
              >
                <div className="modal-content">
                  <ModalHeader
                    toggle={() => {
                      setModal(!modal);
                    }}
                  >
                    پیام جدید{" "}
                  </ModalHeader>
                  <ModalBody>
                    <form>
                      <div className="mb-3">
                        <Input type="email" placeholder="To" />
                      </div>

                      <div className="mb-3">
                        <Input type="text" placeholder="Subject" />
                      </div>
                      <Editor
                        toolbarClassName="toolbarClassName"
                        wrapperClassName="wrapperClassName"
                        editorClassName="editorClassName"
                      />
                    </form>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      type="button"
                      color="secondary"
                      onClick={() => {
                        setModal(!modal);
                      }}
                    >
                      بستن
                    </Button>
                    <Button type="button" color="primary">
                      {" "}
                      ارسال <i className="fab fa-telegram-plane ms-1"></i>{" "}
                    </Button>
                  </ModalFooter>
                </div>
              </Modal>

              {isLoading ? (
                <Spinners setLoading={setLoading} />
              ) : (
                <div className="email-rightbar mb-3">
                  <Card>
                    {mailsLists.length > 0 ? (
                      <>
                        {/* Render Email Top Tool Bar */}
                        <EmailToolbar
                          checkbox={checkbox}
                          setCheckbox={setCheckbox}
                          handelSearch={handelSearch}
                          selectedmails={selectedmails}
                          activeTab={activeTab}
                          category={displayCategory}
                        />

                        <ul className="message-list">
                          {(mailsList || [])
                            ?.filter(({ category }) =>
                              filterMails({ category })
                            )
                            ?.map((mail, key) => (
                              <li
                                key={key}
                                className={mail.read ? "" : "خوانده نشده"}
                              >
                                <div className="col-mail col-mail-1">
                                  <div className="checkbox-wrapper-mail">
                                    <Input
                                      type="checkbox"
                                      value={mail.id}
                                      id={mail.id}
                                      name="emailcheckbox"
                                      onChange={(e) => e.target.value}
                                      onClick={(e) => {
                                        handleSelect(e.target.value);
                                        checkFirstCheckbox();
                                      }}
                                      // checked={selectedmails.includes(mail.id)}
                                    />
                                    <Label
                                      htmlFor={mail.id}
                                      className="toggle"
                                    />
                                  </div>
                                  <Link
                                    to={"/email-read/" + mail.id}
                                    className="title"
                                  >
                                    {mail.name}
                                  </Link>

                                  <span
                                    className={
                                      mail.category === "ستاره دار"
                                        ? "star-toggle fas fa-star text-warning"
                                        : "star-toggle far fa-star"
                                    }
                                    style={{ cursor: "pointer" }}
                                    onClick={() => starredBtn(mail)}
                                  />
                                </div>
                                <div className="col-mail col-mail-2">
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: mail.description,
                                    }}
                                  ></div>
                                  <div className="date">{mail.date}</div>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </>
                    ) : (
                      <div className="align-items-center text-center p-4">
                        {" "}
                        <i className="mdi mdi-email-outline me-2 display-5"></i>{" "}
                        <h4> هیچ رکوردی یافت نشد</h4>
                      </div>
                    )}
                  </Card>
                  {mailsLists.length > 0 && (
                    <Row>
                      <Col xs="7">نمایش 1 - 20 از 1,524</Col>
                      <Col xs="5">
                        <div className="btn-group float-end">
                          <Button type="button" color="success" size="sm">
                            <i className="fa fa-chevron-left" />
                          </Button>
                          <Button type="button" color="success" size="sm">
                            <i className="fa fa-chevron-right" />
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  )}
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(EmailInbox);
