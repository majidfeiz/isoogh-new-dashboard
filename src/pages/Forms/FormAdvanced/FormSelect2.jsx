import React, { useState } from "react";
import { Card, CardBody, Col, Label, Row } from "reactstrap";
import Select from "react-select";

const Select2 = () => {

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedMulti, setSelectedMulti] = useState(null);
    const [selectedMulti1, setSelectedMulti1] = useState(null);
    const [selectedMulti2, setSelectedMulti2] = useState(null);
    const [selectedMulti3, setSelectedMulti3] = useState(null);

    const handleSelectGroup = (selectedGroup) => {
        setSelectedGroup(selectedGroup);
    }

    const handleMulti = (selectedMulti) => {
        setSelectedMulti(selectedMulti);
    }

    const handleMulti1 = (selectedMulti1) => {
        setSelectedMulti1(selectedMulti1);
    }

    const handleMulti2 = (selectedMulti2) => {
        setSelectedMulti2(selectedMulti2);
    }

    const handleMulti3 = (selectedMulti3) => {
        setSelectedMulti3(selectedMulti3);
    }


    const optionGroup = [
        {
            label: "پیک نیک",
            options: [
                { label: "سس خردل", value: "Mustard" },
                { label: "سس کچاپ", value: "Ketchup" },
                { label: "دستمال", value: "Relish" },
            ],
        },
        {
            label: "چادر زدن",
            options: [
                { label: "چادر", value: "Tent" },
                { label: "چراغ قوه", value: "Flashlight" },
                { label: "دستمال", value: "Toilet Paper" },
            ],
        },
    ];



    const optionGroup1 = [
      {
        label: "پیک نیک",
        options: [
          { label: "سس خردل", value: "Mustard" },
          { label: "سس کچاپ", value: "Ketchup" },
          { label: "لذت ببرید", value: "Relish" },
        ],
      },
      {
        label: "چادر زدن",
        options: [
          { label: "چادر", value: "Tent" },
          { label: "چراغ قوه", value: "Flashlight" },
          { label: "دستمال", value: "Toilet Paper" },
        ],
      },
    ];

    const optionGroup2 = [
      {
        label: "پیک نیک",
        options: [
          { label: "سس خردل", value: "Mustard" },
          { label: "سس کچاپ", value: "Ketchup" },
          { label: "دستمال", value: "Relish" },
        ],
      },
      {
        label: "چادر زدن",
        options: [
          { label: "چادر", value: "Tent" },
          { label: "چراغ قوه", value: "Flashlight" },
          { label: "دستمال", value: "Toilet Paper" },
        ],
      },
    ];

    return (
      <React.Fragment>
        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
                <h4 className="card-title">انتخاب 2</h4>
                <p className="card-title-desc">
                  یک جزء چرخنده ورودی سازگار با موبایل و لمس برای بوت استرپ
                </p>

                <form>
                  <Row>
                    <Col lg="6">
                      <div className="mb-3">
                        <Label>انتخاب تکی</Label>
                        <Select
                          value={selectedGroup}
                          onChange={() => {
                            handleSelectGroup();
                          }}
                          options={optionGroup}
                          className="select2-selection"
                          placeholder="انتخاب کنید ..."
                        />
                      </div>
                      <div className="mb-3">
                        <label className="control-label">انتخاب چندگانه</label>
                        <Select
                          value={selectedMulti}
                          isMulti={true}
                          onChange={() => {
                            handleMulti();
                          }}
                          options={optionGroup}
                          className="select2-selection"
                          placeholder="انتخاب کنید ..."
                        />
                      </div>

                      <div>
                        <Label>جستجو غیر فعال </Label>
                        <Select
                          value={selectedMulti1}
                          isMulti={true}
                          onChange={() => {
                            handleMulti1();
                          }}
                          options={optionGroup}
                          className="select2-selection"
                          // isDisabled={true}
                          placeholder="انتخاب کنید ..."
                        />
                      </div>
                    </Col>

                    <Col lg="6">
                      <div className="mb-3 ajax-select mt-3 mt-lg-0 select2-container">
                        <Label>Ajax (داده های راه دور)</Label>
                        <Select
                          value={selectedMulti2}
                          onChange={() => {
                            handleMulti2();
                          }}
                          options={optionGroup1}
                          className="select2-selection"
                          isLoading={true}
                          placeholder="انتخاب کنید ..."
                        />
                      </div>
                      <div className="mb-3 templating-select select2-container">
                        <label className="control-label">الگوسازی</label>
                        <Select
                          value={selectedMulti3}
                          onChange={() => {
                            handleMulti3();
                          }}
                          options={optionGroup2}
                          className="select2-selection"
                          placeholder="انتخاب کنید ..."
                        />
                      </div>
                    </Col>
                  </Row>
                </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default Select2;