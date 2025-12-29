import React from "react";
import { Container } from "reactstrap"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

const PagesStarter = () => {

    //meta title
    document.title="Stater Page | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="ابزارهای مفید" breadcrumbItem="جدول زمانی" />
        </Container>
      </div>
    </React.Fragment>
  );
}

export default PagesStarter
