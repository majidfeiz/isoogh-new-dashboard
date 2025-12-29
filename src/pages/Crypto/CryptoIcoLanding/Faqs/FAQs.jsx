import React, { useState } from "react"
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Nav,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap"
import classnames from "classnames"

//Import Components
import Accordian from "./accordian"

const FAQs = () => {
  const [activeTab, setactiveTab] = useState("1")

  return (
    <React.Fragment>
      <section className="section" id="faqs">
        <Container>
          <Row>
            <Col lg="12">
              <div className="text-center mb-5">
                <div className="small-title">سوالات متداول</div>
                <h4>سوالات متداول</h4>
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg="12">
              <div className="vertical-nav">
                <Row>
                  <Col lg="2" sm="4">
                    <Nav pills className="flex-column">
                      <NavLink
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => {
                          setactiveTab("1");
                        }}
                      >
                        <i className="bx bx-help-circle nav-icon d-block mb-2" />
                        <p className="font-weight-bold mb-0">سوالات عمومی</p>
                      </NavLink>

                      <NavLink
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => {
                          setactiveTab("2");
                        }}
                      >
                        <i className="bx bx-receipt nav-icon d-block mb-2" />
                        <p className="font-weight-bold mb-0">فروش توکن</p>
                      </NavLink>

                      <NavLink
                        className={classnames({ active: activeTab === "3" })}
                        onClick={() => {
                          setactiveTab("3");
                        }}
                      >
                        <i className="bx bx-timer d-block nav-icon mb-2" />
                        <p className="font-weight-bold mb-0">نقشه راه</p>
                      </NavLink>
                    </Nav>
                  </Col>
                  <Col lg="10" sm="8">
                    <Card>
                      <CardBody>
                        <TabContent activeTab={activeTab}>
                          <TabPane tabId="1" id="buy">
                            <h4 className="card-title mb-4">سوالات عمومی</h4>

                            {/* accoridan */}
                            <Accordian
                              question1="چرا از آن استفاده می کنیم ?"
                              answer1="همه می دانند که چرا زبان مشترک جدید مطلوب است: می توان از پرداخت هزینه مترجمان گران قیمت خودداری کرد. برای رسیدن به این هدف، داشتن دستور زبان، تلفظ و کلمات رایج تر ضروری است"
                              question2="لورم ایپسوم چیست؟ ?"
                              answer2="اگر چند زبان با هم ادغام شوند، گرامر زبان حاصل ساده تر و منظم تر از زبان های جداگانه است. زبان مشترک جدید ساده تر و منظم تر از زبان های اروپایی موجود خواهد بود"
                              question3="از کجا میتونم تهیه کنم?"
                              answer3="به همین سادگی خواهد بود. در واقع، آن را غربی خواهد بود. همانطور که یکی از دوستان شکاکم در کمبریج به من گفت چه Occidental برای یک فرد انگلیسی، مانند انگلیسی ساده شده به نظر می رسد"
                              question4="از کجا آمده است?"
                              answer4="اگر چند زبان با هم ادغام شوند، گرامر زبان حاصل ساده تر و منظم تر از زبان های جداگانه است. زبان مشترک جدید ساده تر و منظم تر از زبان های اروپایی موجود خواهد بود"
                            />
                          </TabPane>

                          <TabPane tabId="2">
                            <h4 className="card-title mb-4">فروش توکن</h4>

                            <Accordian
                              question1="چرا از آن استفاده می کنیم?"
                              answer1="همه می دانند که چرا زبان مشترک جدید مطلوب است: می توان از پرداخت هزینه مترجمان گران قیمت خودداری کرد. برای رسیدن به این هدف، داشتن دستور زبان، تلفظ و کلمات رایج تر ضروری است"
                              question2="لورم ایپسوم چیست؟ ?"
                              answer2="اگر چند زبان با هم ادغام شوند، گرامر زبان حاصل ساده تر و منظم تر از زبان های جداگانه است. زبان مشترک جدید ساده تر و منظم تر از زبان های اروپایی موجود خواهد بود"
                              question3="از کجا میتونم تهیه کنم?"
                              answer3="به همین سادگی خواهد بود. در واقع، آن را غربی خواهد بود. همانطور که یکی از دوستان شکاکم در کمبریج به من گفت چه Occidental برای یک فرد انگلیسی، مانند انگلیسی ساده شده به نظر می رسد"
                              question4="از کجا آمده است?"
                              answer4="اگر چند زبان با هم ادغام شوند، گرامر زبان حاصل ساده تر و منظم تر از زبان های جداگانه است. زبان مشترک جدید ساده تر و منظم تر از زبان های اروپایی موجود خواهد بود"
                            />
                          </TabPane>

                          <TabPane tabId="3">
                            <h4 className="card-title mb-4">نقشه ی راه</h4>

                            <Accordian
                              question1="چرا از آن استفاده می کنیم ?"
                              answer1="همه می دانند که چرا زبان مشترک جدید مطلوب است: می توان از پرداخت هزینه مترجمان گران قیمت خودداری کرد. برای رسیدن به این هدف، داشتن دستور زبان، تلفظ و کلمات رایج تر ضروری است"
                              question2="لورم ایپسوم چیست؟ ?"
                              answer2="اگر چند زبان با هم ادغام شوند، گرامر زبان حاصل ساده تر و منظم تر از زبان های جداگانه است. زبان مشترک جدید ساده تر و منظم تر از زبان های اروپایی موجود خواهد بود"
                              question3="از کجا میتونم تهیه کنم ?"
                              answer3="به همین سادگی خواهد بود. در واقع، آن را غربی خواهد بود. همانطور که یکی از دوستان شکاکم در کمبریج به من گفت چه Occidental برای یک فرد انگلیسی، مانند انگلیسی ساده شده به نظر می رسد"
                              question4="از کجا آمده است?"
                              answer4="اگر چند زبان با هم ادغام شوند، گرامر زبان حاصل ساده تر و منظم تر از زبان های جداگانه است. زبان مشترک جدید ساده تر و منظم تر از زبان های اروپایی موجود خواهد بود"
                            />
                          </TabPane>
                        </TabContent>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </React.Fragment>
  );
}

export default FAQs
