import React from 'react';
import { Container, Row } from 'reactstrap';

//Import Breadcrumb
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import Overview from './Overview';
import DetailsSection from './DetailsSection';

const JobDetails = () => {
    document.title = "Job Details | Skote - قالب مدیریتی و داشبورد Vite React ";
   
    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            {/* Render Breadcrumbs */}
            <Breadcrumbs title="مشاغل" breadcrumbItem="جزئیات شغل" />

            <Row>
              <Overview />
              <DetailsSection />
            </Row>
          </Container>
        </div>
      </React.Fragment>
    );
}

export default JobDetails;