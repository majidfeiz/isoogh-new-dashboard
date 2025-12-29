import React, { useEffect } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";

//Import Image
import avatar2 from "../../assets/images/users/avatar-2.jpg";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

//Import Email Sidebar
import EmailSideBar from "./email-sidebar";
import withRouter from "../../components/Common/withRouter";
import { useDispatch, useSelector } from "react-redux";
import { getMailsListsId as onGetMailsListsId } from "/src/store/mails/actions";
import { createSelector } from "reselect";

const EmailRead = (props) => {

  const id = props.router.params.id;

  const dispatch = useDispatch();

  const selectProperties = createSelector(
    (state) => state.mails,
    (Mails) => ({
      mailsListsId: Mails.mailsListsId
    })
  );

  const { mailsListsId } = useSelector(selectProperties);

  useEffect(() => {
    if (id) {
      dispatch(onGetMailsListsId(id));
    } else {
      dispatch(onGetMailsListsId("1"));
    }
  }, [dispatch, id]);

  //meta title
  document.title = "خواندن ایمیل | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="ایمیل" breadcrumbItem="خواندن ایمیل" />

          <Row>
            <Col xs="12">
              {/* Render Email SideBar */}
              <EmailSideBar />

              <div className="email-rightbar mb-3">
                <Card>
                  <CardBody className="list-message">
                    <div className="d-flex mb-4">
                      <img
                        className="d-flex me-3 rounded-circle avatar-sm"
                        src={avatar2}
                        alt="skote"
                      />
                      <div className="flex-grow-1">
                        <h5 className="font-size-14 mt-1">
                          {mailsListsId.name}
                        </h5>
                        <small className="text-muted">support@domain.com</small>
                      </div>
                    </div>

                    <h4 className="mt-0 font-size-16">
                      بهترین داستان های این هفته
                    </h4>

                    <p>ارسال شده توسط تیم بازیابی</p>
                    <div className="col-mail col-mail-2">
                      {mailsListsId.description && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: mailsListsId.description,
                          }}
                        ></div>
                      )}
                    </div>
                    <p>
                      لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ
                      و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه
                      روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای
                      شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف
                      بهبود ابزارهای کاربردی می باشد.
                    </p>
                    <p>
                      کتابهای زیادی در شصت و سه درصد گذشته، حال و آینده شناخت
                      فراوان جامعه و متخصصان را می طلبد تا با نرم افزارها شناخت
                      بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی و
                      فرهنگ پیشرو در زبان فارسی ایجاد کرد. در این صورت می توان
                      امید داشت که تمام و دشواری موجود در ارائه راهکارها و شرایط
                      سخت تایپ به پایان رسد
                    </p>
                    <p>ارادتمند  شما,</p>
                  </CardBody>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

// export default withRouter(EmailRead)
export default withRouter(EmailRead)
