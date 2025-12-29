import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import { jobsGridData } from '../../../common/data';

//Import Breadcrumb
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import JobFilter from './JobFilter';
import JobData from './JobData';

const JobGrid = () => {
    document.title = "Jobs Grid | Skote - قالب مدیریتی و داشبورد Vite React ";

    const [jobGrid, setJobGrid] = useState();

    useEffect(() => {
        setJobGrid(jobsGridData)
    }, [jobsGridData])
    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            {/* Render Breadcrumbs */}
            <Breadcrumbs title="مشاغل" breadcrumbItem="شبکه مشاغل" />

            <JobFilter setJobGrid={setJobGrid} jobData={jobsGridData} />
            <JobData jobGrid={jobGrid} />
          </Container>
        </div>
      </React.Fragment>
    );
}

export default JobGrid;