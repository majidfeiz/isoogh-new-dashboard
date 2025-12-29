import React from "react"
import { Container, Row, Col } from "reactstrap"
import { Link } from "react-router-dom"

//Import Images
import blog1 from "../../../../assets/images/crypto/blog/img-1.jpg"
import blog2 from "../../../../assets/images/crypto/blog/img-2.jpg"
import blog3 from "../../../../assets/images/crypto/blog/img-3.jpg"

const Blog = () => {
  
  const blogs = [
    {
      imgUrl: blog1,
      tag: "ارز دیجیتال",
      date: "04 آبان, 1402",
      title: "چگونه در بازار رمز ارز ها موفق باشیم ؟",
      desc: "یکی از بهترین روش ها برای اگاه شدن از تغییر قیمت ها مطالعه ی بخش ...",
    },
    {
      imgUrl: blog2,
      tag: "ارز دیجیتال",
      date: "12 آذر, 1402",
      title: "پرسود ترین رمز ارز کدام است ؟",
      desc: "همه ی ما به دنبال کشف بهترین و پرسود ترین رمز ارز هستیم ...",
    },
    {
      imgUrl: blog3,
      tag: "ارز دیجیتال",
      date: "06 دی, 1402",
      title: "راه اندازی کیف پول دیجیتال ",
      desc: "مهم ترین بخش از کیف پول دیجیتال تامین امنیت و اگاهی از ان می باشد",
    },
  ];

  return (
    <React.Fragment>
      <section className="section bg-white" id="news">
        <Container>
          <Row>
            <Col lg="12">
              <div className="text-center mb-5">
                <div className="small-title">وبلاگ</div>
                <h4>آخرین اخبار</h4>
              </div>
            </Col>
          </Row>

          <Row>
            {blogs.map((blog, key) => (
              <Col xl="4" sm="6" key={key}>
                <div className="blog-box mb-4 mb-xl-0">
                  <div className="position-relative">
                    <img
                      src={blog.imgUrl}
                      alt=""
                      className="rounded img-fluid mx-auto d-block"
                    />
                    <div className="blog-badge font-size-11 badge bg-success">
                      {blog.tag}
                    </div>
                  </div>

                  <div className="mt-4 text-muted">
                    <p className="mb-2">
                      <i className="bx bx-calendar ms-1" /> {blog.date}
                    </p>
                    <h5 className="mb-3">{blog.title}</h5>
                    <p>{blog.desc}</p>

                    <div>
                      <Link to="#">بیشتر بدانید</Link>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </React.Fragment>
  );
}

export default Blog
