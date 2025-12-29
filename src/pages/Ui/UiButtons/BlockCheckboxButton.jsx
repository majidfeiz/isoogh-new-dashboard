import React from "react";
import { Button, Card, CardBody, CardTitle, Col, Row } from "reactstrap";

const BlockCheckboxButton = () => {
    return (
      <React.Fragment>
        <Row>
          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>دکمه های بلاک</CardTitle>
                <p className="card-title-desc">
                  دکمه هایی که کل عرض تگ والد را اشغال می کنند — دکمه های بلاک
                  لول بسازید{" "}
                  <code className="highlighter-rouge">.btn-block</code>.
                </p>

                <div className="d-grid gap-2">
                  <Button color="primary" type="button" className="btn-lg">
                    دکمه های بلاک
                  </Button>
                  <Button color="secondary" type="button" className="btn-sm">
                    دکمه های بلاک
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={6}>
            <Card>
              <CardBody>
                <CardTitle>چک باکس و دکمه های رادیویی</CardTitle>
                <p className="card-title-desc">
                  بوت استرپ <code className="highlighter-rouge">.button</code>{" "}
                  سبک ها را می توان برای عناصر دیگر اعمال کرد، مانند{" "}
                  <code className="highlighter rouge">&lt;label&gt;</code>s، به
                  چک باکس یا تغییر دکمه سبک رادیویی را ارائه دهید. اضافه کردن{" "}
                  <code className="highlighter rouge">
                    data toggle=&quot;دکمه ها&ldquo;
                  </code>{" "}
                  به گروه<code className="highlighter rouge">.btn</code> حاوی آن
                  دکمه های اصلاح شده برای فعال کردن تغییر در آنها سبک های مربوطه
                </p>

                <div className="d-flex flex-wrap gap-2">
                  <div>
                    <div className="d-flex flex-wrap gap-3">
                      <div className="btn-group" role="group">
                        <input
                          type="checkbox"
                          className="btn-check"
                          id="btncheck1"
                          autoComplete="off"
                          defaultChecked
                        />
                        <label className="btn btn-primary" htmlFor="btncheck1">
                          چک باکس 1
                        </label>

                        <input
                          type="checkbox"
                          className="btn-check"
                          id="btncheck2"
                          autoComplete="off"
                        />
                        <label className="btn btn-primary" htmlFor="btncheck2">
                          چک باکس 2
                        </label>

                        <input
                          type="checkbox"
                          className="btn-check"
                          id="btncheck3"
                          autoComplete="off"
                        />
                        <label className="btn btn-primary" htmlFor="btncheck3">
                          چک باکس 3
                        </label>
                      </div>

                      <div className="btn-group" role="group">
                        <input
                          type="checkbox"
                          className="btn-check"
                          id="btncheck4"
                          autoComplete="off"
                          defaultChecked
                        />
                        <label
                          className="btn btn-outline-primary"
                          htmlFor="btncheck4"
                        >
                          چک باکس 4
                        </label>

                        <input
                          type="checkbox"
                          className="btn-check"
                          id="btncheck5"
                          autoComplete="off"
                        />
                        <label
                          className="btn btn-outline-primary"
                          htmlFor="btncheck5"
                        >
                          چک باکس 5
                        </label>

                        <input
                          type="checkbox"
                          className="btn-check"
                          id="btncheck6"
                          autoComplete="off"
                        />
                        <label
                          className="btn btn-outline-primary"
                          htmlFor="btncheck6"
                        >
                          چک باکس 6
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="d-flex flex-wrap gap-3">
                      <div className="btn-group" role="group">
                        <input
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio1"
                          autoComplete="off"
                          defaultChecked
                        />
                        <label
                          className="btn btn-secondary"
                          htmlFor="btnradio1"
                        >
                          Radio 1
                        </label>

                        <input
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio2"
                          autoComplete="off"
                        />
                        <label
                          className="btn btn-secondary"
                          htmlFor="btnradio2"
                        >
                          Radio 2
                        </label>

                        <input
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio3"
                          autoComplete="off"
                        />
                        <label
                          className="btn btn-secondary"
                          htmlFor="btnradio3"
                        >
                          Radio 3
                        </label>
                      </div>

                      <div className="btn-group" role="group">
                        <input
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio4"
                          autoComplete="off"
                          defaultChecked
                        />
                        <label
                          className="btn btn-outline-secondary"
                          htmlFor="btnradio4"
                        >
                          Radio 4
                        </label>

                        <input
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio5"
                          autoComplete="off"
                        />
                        <label
                          className="btn btn-outline-secondary"
                          htmlFor="btnradio5"
                        >
                          Radio 5
                        </label>

                        <input
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio6"
                          autoComplete="off"
                        />
                        <label
                          className="btn btn-outline-secondary"
                          htmlFor="btnradio6"
                        >
                          Radio 6
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default BlockCheckboxButton;