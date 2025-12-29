import React from "react"
import PropTypes from "prop-types"
import {
  Row,
  Col,
  Form,
  Label,
  Card,
  CardBody,
  CardTitle,
  Container,
  Input
} from "reactstrap"

import Breadcrumbs from "../../components/Common/Breadcrumb"

// Form Mask
import InputMask from "react-input-mask"

const FormMask = () => {
  //meta title
  document.title = "Form Mask | Skote - قالب مدیریتی و داشبورد Vite React "

  const Repeat = props => (
    <InputMask
      mask="9999999999"
      value={props.value}
      className="form-control input-color"
      onChange={props.onChange}
    >     
    </InputMask>
  )


  const IPV4 = props => (
    <InputMask
      mask="999.999.999.999"
      value={props.value}
      className="form-control input-color"
      onChange={props.onChange}
    >
         </InputMask>
  )
  const TAX = props => (
    <InputMask
      mask="99-9999999"
      value={props.value}
      className="form-control input-color"
      onChange={props.onChange}
    >    
    </InputMask>
  )

  const Phone = props => (
    <InputMask
      mask="(999) 999-9999"
      value={props.value}
      className="form-control input-color"
      onChange={props.onChange}
    >     
    </InputMask>
  )

  const Currency = props => (
    <InputMask
      mask="تومان 999,999,999.00"
      value={props.value}
      className="form-control input-color"
      onChange={props.onChange}
    >      
    </InputMask>
  )

  const Date1 = props => (
    <InputMask
      mask="99/99/9999"
      value={props.value}
      className="form-control input-color"
      onChange={props.onChange}
    >     
    </InputMask>
  )

  const Date2 = props => (
    <InputMask
      mask="99-99-9999"
      value={props.value}
      className="form-control input-color"
      onChange={props.onChange}
    >     
    </InputMask>
  )

  const Date3 = props => (
    <InputMask
      mask="9999-99-99 99:99:99"
      value={props.value}
      className="form-control input-color"
      onChange={props.onChange}
    >     
    </InputMask>
  )

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="فرم ها" breadcrumbItem="فرم ماسک" />

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">مثال</CardTitle>
                  <Form>
                    <Row>
                      <Col lg={6}>
                        <div>
                          <div className="form-group mb-4">
                            <Label for="input-date1">استایل تاریخ 1</Label>
                            <Date1 />
                            <span className="text-muted">e.g "dd/mm/yyyy"</span>
                          </div>
                          <div className="form-group mb-4">
                            <Label for="input-date2">استایل تاریخ 2</Label>
                            <Date2 />
                            <span className="text-muted">e.g "mm/dd/yyyy"</span>
                          </div>
                          <div className="form-group mb-4">
                            <Label for="input-datetime">تاریخ زمان</Label>
                            <Date3 />
                            <span className="text-muted">e.g "yyyy-mm-dd'T'HH:MM:ss"</span>
                          </div>
                          <div className="form-group mb-0">
                            <Label for="input-currency">واحد پولی:</Label>
                            <Currency />
                            <span className="text-muted">e.g "تومان 0.00"</span>
                          </div>
                        </div>
                      </Col>
                      <Col lg={6}>
                        <div className="mt-4 mt-lg-0">
                          <div className="form-group mb-4">
                            <Label for="input-repeat">تکرار:</Label>
                            <Repeat />
                            <span className="text-muted">e.g "9999999999"</span>
                          </div>
                          <div className="form-group mb-4">
                            <Label for="input-mask">ماسک</Label>
                            <TAX />
                            <span className="text-muted">e.g "99-9999999"</span>
                          </div>
                          <div className="form-group mb-4">
                            <Label for="input-ip">IP آدرس</Label>
                            <IPV4 />
                            <span className="text-muted">e.g "99.99.99.99"</span>

                          </div>
                          <div className="form-group mb-0">
                            <Label for="input-email">آدرس ایمیل:</Label>
                            <Phone />
                            <span className="text-muted">_@_._</span>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  )
}

FormMask.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
}

export default FormMask
