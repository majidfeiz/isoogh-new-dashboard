import React, { useState } from "react";
import { Button, Card, CardBody, CardTitle, Col, Form, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";

const ToggleContent = ({ removeBodyCss }) => {

    const [togModal, setTogModal] = useState(false);
    const [togModal1, setTogModal1] = useState(false);
    const [varyingModal, setVaryingModal] = useState(false);
    const [modal_1, setModal_1] = useState("varying");

    const tog_toggleModal = () => {
        setTogModal(!togModal);
        setTogModal1(false)
        removeBodyCss();
    }

    const tog_toggleModal1 = () => {
        setTogModal1(!togModal1);
        setTogModal(false)
        removeBodyCss();
    }

    const tog_varyingModal = () => {
        setVaryingModal(!varyingModal);
    }

    return (
      <React.Fragment>
        <Row>
          <Col lg={6}>
            <Card>
              <CardBody>
                <CardTitle className="h4">جابه‌جایی بین حالت‌ها</CardTitle>
                <p className="card-title-desc">
                  جابه‌جایی بین چند حالت با چند قرار دادن هوشمندانه
                  <code>data-bs-target</code> و ویژگی های{" "}
                  <code>data-bs-toggle</code>
                </p>

                <div>
                  <Button
                    type="button"
                    color="primary"
                    onClick={() => {
                      tog_toggleModal();
                    }}
                    className=" waves-effect waves-light"
                  >
                    اولین مودال را باز کنید
                  </Button>
                  <Modal
                    isOpen={togModal}
                    toggle={() => {
                      tog_toggleModal();
                    }}
                    centered
                  >
                    <ModalHeader
                      toggle={() => {
                        tog_toggleModal();
                      }}
                    >
                      مودال 1
                    </ModalHeader>
                    <ModalBody>
                      <p>
                        یک مودال دوم را نشان دهید و آن را با دکمه پنهان کنید زیر
                      </p>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="primary"
                        onClick={() => {
                          tog_toggleModal1();
                        }}
                      >
                        حالت دوم را باز کنید
                      </Button>
                    </ModalFooter>
                  </Modal>
                </div>

                <Modal
                  isOpen={togModal1}
                  toggle={() => {
                    tog_toggleModal1();
                  }}
                  centered
                >
                  <ModalHeader
                    toggle={() => {
                      tog_toggleModal1();
                    }}
                  >
                    مودال 2
                  </ModalHeader>
                  <ModalBody>
                    <p>
                      این مدال را مخفی کنید و اولین مورد را با دکمه زیر نشان
                      دهید
                    </p>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      color="primary"
                      onClick={() => {
                        tog_toggleModal();
                      }}
                    >
                      بازگشت به اول
                    </Button>
                  </ModalFooter>
                </Modal>
              </CardBody>
            </Card>
          </Col>

          <Col lg={6}>
            <Card>
              <CardBody>
                <CardTitle className="h4">محتوای مدال متفاوت</CardTitle>
                <p className="card-title-desc">
                  مدال دکمه‌هایی که همگی یک مودال را با کمی راه‌اندازی می‌کنند
                  مطالب مختلف از <code>event.relatedTarget</code> و استفاده کنید
                  ویژگی های <code>data-bs-target</code> HTML برای تغییر دادن
                  محتویات مدال بسته به اینکه روی کدام دکمه کلیک شده است
                </p>

                <div>
                  <div className="d-flex flex-wrap gap-3">
                    <Button
                      type="button"
                      color="primary"
                      onClick={() => {
                        tog_varyingModal();
                        setModal_1("@mdo");
                      }}
                    >
                      باز کردن modal برای @mdo
                    </Button>
                    <Button
                      type="button"
                      color="primary"
                      onClick={() => {
                        tog_varyingModal();
                        setModal_1("@fat");
                      }}
                    >
                      باز کردن modal برای @mdo
                    </Button>
                    <Button
                      type="button"
                      color="primary"
                      onClick={() => {
                        tog_varyingModal();
                        setModal_1("@getbootstrap");
                      }}
                    >
                      باز کردن modal برای @getbootstrap
                    </Button>
                  </div>

                  <Modal
                    isOpen={varyingModal}
                    toggle={() => {
                      tog_varyingModal();
                    }}
                  >
                    <ModalHeader
                      toggle={() => {
                        tog_varyingModal();
                      }}
                    >
                     پیام جدید {modal_1}
                    </ModalHeader>
                    <ModalBody>
                      <Form>
                        <div className="mb-3">
                          <label
                            htmlFor="recipient-name"
                            className="col-form-label"
                          >
                            گیرنده:
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="recipient-name"
                            defaultValue={modal_1}
                          />
                        </div>
                        <div className="mb-3">
                          <label
                            htmlFor="message-text"
                            className="col-form-label"
                          >
                            پیام:
                          </label>
                          <textarea
                            className="form-control"
                            id="message-text"
                          ></textarea>
                        </div>
                      </Form>
                    </ModalBody>
                    <ModalFooter>
                      <Button type="button" color="secondary">
                        بستن
                      </Button>
                      <Button type="button" color="primary">
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

export default ToggleContent;