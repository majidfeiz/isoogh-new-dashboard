import React from 'react';
import { Card, CardBody, Col, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { ReceivedTimeCharts } from './JobCharts';

const ReceivedTime = () => {
    return (
      <React.Fragment>
        <Col lg={4}>
          <Card>
            <CardBody>
              <div className="d-flex">
                <h4 className="card-title">زمان دریافت برنامه ها</h4>
                <UncontrolledDropdown className="ms-auto">
                  <DropdownToggle
                    tag="a"
                    href="#!"
                    className="text-muted font-size-16"
                    role="button"
                  >
                    <i className="mdi mdi-dots-horizontal"></i>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu-end">
                    <DropdownItem href="#!">اقدامات</DropdownItem>
                    <DropdownItem href="#!">اقدامات دیگر</DropdownItem>
                    <DropdownItem href="#!">موارد دیگر اینجا</DropdownItem>
                    <div className="dropdown-divider"></div>
                    <DropdownItem href="#!">لینک های جداگانه</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>

              <ReceivedTimeCharts dataColors='["--bs-primary", "--bs-success", "--bs-warning", "--bs-info"]' />
            </CardBody>
          </Card>
        </Col>
      </React.Fragment>
    );
}

export default ReceivedTime;