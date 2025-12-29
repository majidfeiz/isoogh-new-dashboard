import React from 'react';
import { Col, Container, Row } from 'reactstrap';

//Import Breadcrumb
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { Link } from 'react-router-dom';

const JobCategories = () => {
    document.title = "Job Categories | Skote - قالب مدیریتی و داشبورد Vite React ";

    const jobCategories1 = [
        { id : 1, name : "حسابداری" , category : 52},
        { id : 2, name : "توسعه" , category : 10},
        { id : 3, name : "خدمات مشتری" , category : 64},
        { id : 4, name : "بازاریابی" , category : 105},
        { id : 5, name : "منابع انسانی" , category : 142},
        { id : 6, name : "بهداشت و مراقبت" , category : "01"},
        { id : 7, name : "مدیریت پروژه" , category : 254},
        { id : 8, name : "مشاغل خودروسازی" , category : 79},
    ];

    const jobCategories2 = [
        { id : 1, name : "حسابداری" , category : 85},
        { id : 2, name : "توسعه" , category : 19},
        { id : 3, name : "خدمات مشتری" , category : 48},
        { id : 4, name : "بازاریابی" , category : 34},
        { id : 5, name : "منابع انسانی" , category : 33},
        { id : 6, name : "بهداشت و مراقبت" , category : 748},
        { id : 7, name : "مدیریت پروژه" , category : 16},
        { id : 8, name : "مشاغل خودروسازی" , category : 94},
    ];

    const jobCategories3 = [
        { id : 1, name : "حسابداری" , category : 17},
        { id : 2, name : "توسعه" , category : 64},
        { id : 3, name : "خدمات مشتری" , category : 72},
        { id : 4, name : "بازاریابی" , category : 19},
        { id : 5, name : "منابع انسانی" , category : 305},
        { id : 6, name : "بهداشت و مراقبت" , category : 64},
        { id : 7, name : "مدیریت پروژه" , category : 112},
        { id : 8, name : "مشاغل خودروسازی" , category : 31},
    ];

    const jobCategories4 = [
        { id : 1, name : "حسابداری" , category : 85},
        { id : 2, name : "توسعه" , category : 19},
        { id : 3, name : "خدمات مشتری" , category : 48},
        { id : 4, name : "بازاریابی" , category : 34},
        { id : 5, name : "منابع انسانی" , category : 33},
        { id : 6, name : "بهداشت و مراقبت" , category : 748},
        { id : 7, name : "مدیریت پروژه" , category : 16},
        { id : 8, name : "مشاغل خودروسازی" , category : 94},
    ];
    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            {/* Render Breadcrumbs */}
            <Breadcrumbs title="مشاغل" breadcrumbItem="دسته بندی های شغلی" />

            <Row className="justify-content-center text-center">
              <Col xl={4}>
                <div className="mb-4">
                  <h4>جستجوی شغل بر اساس دسته بندی ها</h4>
                  <p className="text-muted">
                    یک شغل ارسال کنید تا در مورد پروژه خود به ما بگویید. ما به
                    سرعت شما را با فریلنسرهای مناسب مطابقت دهید
                  </p>
                </div>
              </Col>
            </Row>

            <Row>
              <Col xl={3} md={6}>
                <div className="card jobs-categories">
                  <div className="card-body">
                    {(jobCategories1 || []).map((item, key) => (
                      <Link
                        key={key}
                        to="#!"
                        className="px-3 py-2 rounded bg-light bg-opacity-50 d-block mb-2"
                      >
                        {item.name}
                        <span className="badge text-bg-info float-end bg-opacity-100">
                          {item.category}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </Col>

              <Col xl={3} md={6}>
                <div className="card jobs-categories">
                  <div className="card-body">
                    {(jobCategories2 || []).map((item, key) => (
                      <Link
                        key={key}
                        to="#!"
                        className="px-3 py-2 rounded bg-light bg-opacity-50 d-block mb-2"
                      >
                        {item.name}
                        <span className="badge text-bg-info float-end bg-opacity-100">
                          {item.category}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </Col>

              <Col xl={3} md={6}>
                <div className="card jobs-categories">
                  <div className="card-body">
                    {(jobCategories3 || []).map((item, key) => (
                      <Link
                        key={key}
                        to="#!"
                        className="px-3 py-2 rounded bg-light bg-opacity-50 d-block mb-2"
                      >
                        {item.name}
                        <span className="badge text-bg-info float-end bg-opacity-100">
                          {item.category}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </Col>

              <Col xl={3} md={6}>
                <div className="card jobs-categories">
                  <div className="card-body">
                    {(jobCategories4 || []).map((item, key) => (
                      <Link
                        key={key}
                        to="#!"
                        className="px-3 py-2 rounded bg-light bg-opacity-50 d-block mb-2"
                      >
                        {item.name}
                        <span className="badge text-bg-info float-end bg-opacity-100">
                          {item.category}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    );
}

export default JobCategories;