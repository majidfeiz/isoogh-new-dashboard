import React, { useState } from "react";

import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Container,
  Button,
} from "reactstrap";

//Import Breadcrumb
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import BasicModal from "./BasicModal";
import DefaultFullscreen from "./DefaultFullscreen";
import OptionalSizes from "./OptionalSizes";
import StaticScrollable from "./StaticScrollable";
import ToggleContent from "./ToggleContent";

const UiModal = () => {

  //meta title
  document.title = "Models | Skote - قالب مدیریتی و داشبورد Vite React ";


  const [modal_large, setModal_large] = useState(false);
  const [modal_xLarge, setModal_xLarge] = useState(false);
  const [modal_small, setModal_small] = useState(false);
  const [modal_center, setModal_center] = useState(false);

  const removeBodyCss = () => {
    document.body.classList.add("no_padding");
  }

  const tog_large = () => {
    setModal_large(!modal_large);
    removeBodyCss();
  }

  const tog_xLarge = () => {
    setModal_xLarge(!modal_xLarge);
    removeBodyCss();
  }

  const tog_small = () => {
    setModal_small(!modal_small);
    removeBodyCss();
  }

  const tog_center = () => {
    setModal_center(!modal_center);
    removeBodyCss();
  }



  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="المنت های UI" breadcrumbItem="مودال ها" />

          <BasicModal />
          <DefaultFullscreen removeBodyCss={removeBodyCss} />

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">اندازه های اختیاری</CardTitle>
                  <p className="card-title-desc">
                    مودال ها دارای سه اندازه اختیاری هستند که از طریق اصلاح
                    کننده در دسترس هستند کلاس هایی که روی{" "}
                    <code>.modal-dialog</code> قرار می گیرند
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        tog_xLarge();
                      }}
                      color="primary"
                    >
                      مودال فوق العاده بزرگ
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        tog_large();
                      }}
                      color="light"
                    >
                      مودال بزرگ
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        tog_small();
                      }}
                      color="success"
                    >
                      مودال کوچک
                    </Button>
                  </div>

                  <div>
                    <OptionalSizes
                      title="مودال های فوق العاده بزرگ"
                      size="xl"
                      isOpen={modal_xLarge}
                      toggle={tog_xLarge}
                    />
                    <OptionalSizes
                      title="مودال بزرگ"
                      size="lg"
                      isOpen={modal_large}
                      toggle={tog_large}
                    />
                    <OptionalSizes
                      title="مودال کوچک"
                      size="sm"
                      isOpen={modal_small}
                      toggle={tog_small}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h5">عمودی مرکز</CardTitle>
                  <p className="card-title-desc">
                    اضافه کردن <code>.modal-dialog-centered</code> به{" "}
                    <code>.modal-dialog</code> برای مرکز عمودی مدال
                  </p>
                  <div>
                    <Button
                      type="button"
                      color="primary "
                      onClick={() => {
                        tog_center();
                      }}
                    >
                     مودال مرکزی
                    </Button>
                    <OptionalSizes
                      center={true}
                      title="مودال مرکزی"
                      size="md"
                      isOpen={modal_center}
                      toggle={tog_center}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>

            <StaticScrollable removeBodyCss={removeBodyCss} />
          </Row>

          <ToggleContent removeBodyCss={removeBodyCss} />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default UiModal;
