import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Card,
} from "reactstrap"

// Import Editor

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

//Import images
import avatar2 from "../../assets/images/users/avatar-2.jpg"
import avatar3 from "../../assets/images/users/avatar-3.jpg"
import avatar4 from "../../assets/images/users/avatar-4.jpg"
import avatar6 from "../../assets/images/users/avatar-6.jpg"

const EmailSideBar = props => {
  const [modal, setmodal] = useState(false)

  return (
    <React.Fragment>
      <Card className="email-leftbar">
        <Button
          type="button"
          color="danger"
          onClick={() => {
            setmodal(!modal);
          }}
          block
        >
          ساختن
        </Button>
        <div className="mail-list mt-4">
          <Link to="email-inbox" className="active">
            <i className="mdi mdi-email-outline me-2"></i> ورودی{" "}
            <span className="ml-1 float-end">(18)</span>
          </Link>
          <Link to="/email-inbox" filter="SHOW_COMPLETED">
            <i className="mdi mdi-star-outline me-2"></i>ستاره دار
          </Link>
          <Link to="/email-inbox">
            <i className="mdi mdi-diamond-stone me-2"></i>مهم
          </Link>
          <Link to="/email-inbox">
            <i className="mdi mdi-file-outline me-2"></i>پیش نویس
          </Link>
          <Link to="/email-inbox">
            <i className="mdi mdi-email-check-outline me-2"></i>ارسال شده
          </Link>
          <Link to="/email-inbox">
            <i className="mdi mdi-trash-can-outline me-2"></i>سطل زباله
          </Link>
        </div>

        <h6 className="mt-4">برچسب ها</h6>

        <div className="mail-list mt-1">
          <Link to="#">
            <span className="mdi mdi-arrow-right-drop-circle text-info float-end"></span>
            پشتیبانی از قالب
          </Link>
          <Link to="#">
            <span className="mdi mdi-arrow-right-drop-circle text-warning float-end"></span>
            آزاد
          </Link>
          <Link to="#">
            <span className="mdi mdi-arrow-right-drop-circle text-primary float-end"></span>
            اجتماعی
          </Link>
          <Link to="#">
            <span className="mdi mdi-arrow-right-drop-circle text-danger float-end"></span>
            دوستان
          </Link>
          <Link to="#">
            <span className="mdi mdi-arrow-right-drop-circle text-success float-end"></span>
            خانواده
          </Link>
        </div>

        <h6 className="mt-4">چت</h6>

        <div className="mt-2">
          <Link to="#" className="d-flex">
            <img
              className="d-flex me-3 rounded-circle"
              src={avatar2}
              alt="skote"
              height="36"
            />
            <div className="flex-grow-1 chat-user-box">
              <p className="user-title m-0">محمد دارابی</p>
              <p className="text-muted">سلام</p>
            </div>
          </Link>

          <Link to="#" className="d-flex">
            <img
              className="d-flex me-3 rounded-circle"
              src={avatar3}
              alt="skote"
              height="36"
            />
            <div className="chat-user-box">
              <p className="user-title m-0">احسان نریمانی</p>
              <p className="text-muted">زمان جلسه ی بعد</p>
            </div>
          </Link>

          <Link to="#" className="d-flex">
            <img
              className="d-flex me-3 rounded-circle"
              src={avatar4}
              alt="skote"
              height="36"
            />
            <div className="chat-user-box">
              <p className="user-title m-0">زهرا دهقان</p>
              <p className="text-muted">همه چی خوبه</p>
            </div>
          </Link>

          <Link to="#" className="d-flex">
            <img
              className="d-flex me-3 rounded-circle"
              src={avatar6}
              alt="skote"
              height="36"
            />
            <div className="chat-user-box">
              <p className="user-title m-0">امیر ابراهیمی</p>
              <p className="text-muted">خیلی عالیه </p>
            </div>
          </Link>
        </div>
      </Card>

      <Modal
        isOpen={modal}
        role="dialog"
        autoFocus={true}
        centered={true}
        className="exampleModal"
        tabIndex="-1"
        toggle={() => {
          setmodal(!modal);
        }}
      >
        <div className="modal-content">
          <ModalHeader
            toggle={() => {
              setmodal(!modal);
            }}
          >
            پیام جدید
          </ModalHeader>
          <ModalBody>
            <form>
              <div className="mb-3">
                <Input type="email" className="form-control" placeholder="به" />
              </div>

              <div className="mb-3">
                <Input
                  type="text"
                  className="form-control"
                  placeholder="موضوع"
                />
              </div>
              {/* <Editor
                toolbarClassName="toolbarClassName"
                wrapperClassName="wrapperClassName"
                editorClassName="editorClassName"
              /> */}
              <CKEditor
                editor={ClassicEditor}
                data="<p>سلام از CKEditor 5!</p>"
                onReady={(editor) => {
                  // You can store the "editor" and use when it is needed.
                  console.log("ویرایشگر آماده استفاده است!", editor);
                }}
                onChange={(event, editor) => {
                  const data = editor.getData();
                }}
              />
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              color="secondary"
              onClick={() => {
                setmodal(!modal);
              }}
            >
              بستن
            </Button>
            <Button
              type="button"
              color="primary"
              onClick={() => setmodal(!modal)}
            >
              ارسال <i className="fab fa-telegram-plane ms-1"></i>
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </React.Fragment>
  );
}

export default EmailSideBar
