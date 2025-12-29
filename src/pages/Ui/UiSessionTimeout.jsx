import React, { Component } from "react"

import { Card, Row, Col, CardBody, CardTitle, Container, Alert } from "reactstrap"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

class UiSessionTimeout extends Component {
  constructor(props) {
    super(props)
    this.state = { timeralert: null, timerswitch: false, seconds: 0 }
    this.tick = this.tick.bind(this)
  }
  tick() {
    this.interval = setInterval(() => {
      this.setState(prevState => ({ seconds: prevState.seconds + 1 }))
    }, 1000)
  }

  componentDidMount() {
    this.main_function()
  }

  hideAlert() {
    window.location = "/login"
  }
  confirmAlert() {
    this.setState({ timeralert: null })
  }
  main_function() {
    setTimeout(
      function () {
        setTimeout(
          function () {
            this.function1()
          }.bind(this),
          6000
        )
        this.function2()
      }.bind(this),
      6000
    )
  }
  function1() {
    if (window.location.pathname === "/ui-session-timeout") {
      window.location = "/login"
    } else {
    }
  }
  function2() {
    this.tick()
    const nextmsg = () => (
      <Alert
        showCancel
        confirmBtnText="Stay Connected"
        cancelBtnText="Logout"
        confirmBtnBsStyle="success"
        cancelBtnBsStyle="danger"
        title="جلسه شما رو به اتمام است!"
        onCancel={() => this.hideAlert()}
        onConfirm={() => this.confirmAlert()}
      >
        تغییر مسیر در 10 ثانیه<br></br>
      </Alert>
    );
    this.setState({ timeralert: nextmsg() })
  }
  render() {
    //meta title
    document.title = "Session Timeout | Skote - قالب مدیریتی و داشبورد Vite React ";

    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid={true}>
            {this.state.timeralert}

            <Breadcrumbs title="المنت های UI" breadcrumbItem="پایان جلسه" />

            <Row>
              <Col>
                <Card>
                  <CardBody>
                    <CardTitle>اتمام جلسه بوت استرپ</CardTitle>
                    <p className="sub-header">
                      پایان جلسه و کنترل زنده با یک خوب گفتگوی هشدار بوت استرپ
                    </p>

                    <div>
                      <p>
                        پس از مدت زمان مشخصی از زمان بیکاری، یک هشدار بوت استرپ
                        گفتگو با گزینه هر یک به کاربر نشان داده می شود از سیستم
                        خارج شوید یا متصل بمانید. اگر &quot;خروج&ldquo; دکمه
                        انتخاب شده است، صفحه به خروج از سیستم هدایت می شود URL.
                        اگر &quot;در ارتباط بمانید&ldquo; انتخاب شده است گفتگو
                        بسته می شود و جلسه زنده نگه داشته می شود. اگر نه گزینه
                        بعد از مقدار دیگری از حالت بیکار انتخاب می شود زمان،
                        صفحه به طور خودکار به یک مجموعه هدایت می شود نشانی وب به
                        پایان رسیده است
                      </p>
                      <p>
                        زمان بیکاری بدون ماوس، صفحه کلید یا لمس تعریف می شود
                        فعالیت رویداد ثبت شده توسط مرورگر
                      </p>

                      <p className="mb-0">
                        تا زمانی که کاربر فعال است، (اختیاری) زنده بماند URL
                        مدام پینگ می شود و جلسه زنده می ماند. اگر شما نیازی به
                        زنده نگه داشتن جلسه سمت سرور ندارید از طریق URL keep
                        alive نیز می توانید از این افزونه به عنوان استفاده کنید
                        یک مکانیسم قفل ساده که به شما هدایت می شود قفل کردن جلسه
                        یا خروج از URL پس از مقدار مشخصی از حالت بیکار زمان
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    );
  }
}

export default UiSessionTimeout
