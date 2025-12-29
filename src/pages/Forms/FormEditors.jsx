import React from "react";

import {
  Form,
  Card,
  CardBody,
  Col,
  Row,
  Container,
} from "reactstrap";

import { Editor } from '@tinymce/tinymce-react';

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const FormEditors = () => {

  //meta title
  document.title = "Form Editors | Skote - قالب مدیریتی و داشبورد Vite React "

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="فرم ها" breadcrumbItem="ویرایشگر فرم" />

          <Row>
            <Col xs={12}>
              <Card>
                <CardBody>
                  <h4 className="card-title">Tinymce wysihtml5</h4>
                  <p className="card-title-desc">
                    Bootstrap-wysihtml5 یک جاوا اسکریپت است افزونه ای که ایجاد
                    ویرایشگرهای ساده و زیبای wysiwyg را آسان می کند با کمک
                    wysihtml5 و توییتر بوت استرپ
                  </p>
                  <Form method="post">
                    <Editor
                      // apiKey='your-api-key'
                      // onInit={(evt, edit or) => editorRef.current = editor}
                      initialValue=""
                      init={{
                        height: 350,
                        menubar: true,
                        plugins: [
                          "advlist",
                          "لینک خودکار",
                          "لیست ها",
                          "لینک",
                          "تصویر",
                          "چارت",
                          "پیش نمایش",
                          "anchor",
                          "جستجو ",
                          "بلوک های بصری",
                          "کد",
                          "تمام صفحه",
                          "درج تاریخ",
                          "رسانه ها",
                          "جدول",
                          "کد",
                          "راهنمایی",
                          "تعداد کلمه",
                        ],
                        toolbar:
                          "undo redo | blocks | " +
                          "bold italic forecolor | alignleft aligncenter " +
                          "alignright alignjustify | bullist numlist outdent indent | " +
                          "removeformat | help",
                        content_style:
                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                      }}
                    />
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default FormEditors;
