import React, { useState } from "react";
import { ModalContent } from "./ModalContent";
import { Button, Card, CardBody, CardTitle, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";

const DefaultFullscreen = ({ removeBodyCss }) => {

    const [modal_standard, setModal_standard] = useState(false);
    const [modal_fullscreen, setModal_fullscreen] = useState(false);

    const tog_standard = () => {
        setModal_standard(!modal_standard);
        removeBodyCss();
    }

    const tog_fullscreen = () => {
        setModal_fullscreen(!modal_fullscreen);
        removeBodyCss();
    }

    return (
      <React.Fragment>
        <Row>
          <Col lg={6}>
            <Card>
              <CardBody>
                <CardTitle className="h4">حالت پیش فرض</CardTitle>
                <p className="card-title-desc">
                  با کلیک کردن روی دکمه زیر، یک نسخه آزمایشی مودال کار را تغییر
                  دهید. آی تی به پایین می لغزد و از بالای صفحه محو می شود
                </p>
                <div>
                  <Button
                    type="button"
                    onClick={() => {
                      tog_standard();
                    }}
                    color="primary "
                  >
                    مدال استاندارد
                  </Button>

                  <Modal
                    isOpen={modal_standard}
                    toggle={() => {
                      tog_standard();
                    }}
                  >
                    <ModalHeader
                      toggle={() => {
                        tog_standard();
                      }}
                    >
                      عنوان مدال پیش فرض
                    </ModalHeader>
                    <ModalBody>
                      <ModalContent />
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        type="button"
                        onClick={() => {
                          tog_standard();
                        }}
                        color="secondary "
                      >
                        بستن
                      </Button>
                      <Button type="button" color="primary ">
                        ذخیره تغییرات
                      </Button>
                    </ModalFooter>
                  </Modal>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={6}>
            <Card>
              <CardBody>
                <CardTitle className="h4">تمام صفحه مدال</CardTitle>
                <p className="card-title-desc">
                  یکی دیگر از موارد نادیده گرفته شده، گزینه ای است که یک مودال
                  را پوشش می دهد نمای کاربر، از طریق کلاس های اصلاح کننده موجود
                  است روی یک <code>.modal تمام صفحه</code> قرار داده شده است
                </p>
                <div>
                  <Button
                    type="button"
                    onClick={() => {
                      tog_fullscreen();
                    }}
                    color="primary "
                  >
                  مدال تمام صفحه
                  </Button>
                  <Modal
                    size="xl"
                    isOpen={modal_fullscreen}
                    toggle={() => {
                      tog_fullscreen();
                    }}
                    className="modal-fullscreen"
                  >
                    <ModalHeader
                      toggle={() => {
                        tog_fullscreen();
                      }}
                    >
                    مدال تمام صفحه
                    </ModalHeader>
                    <ModalBody>
                      <ModalContent />
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        type="button"
                        onClick={() => {
                          tog_fullscreen();
                        }}
                        color="secondary "
                      >
                        بستن
                      </Button>
                      <Button type="button" color="primary ">
                       ذخیره ی تغییرات
                      </Button>
                    </ModalFooter>
                  </Modal>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default DefaultFullscreen;