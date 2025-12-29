import React from "react"
import { Link } from "react-router-dom"
import {
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Row,
  UncontrolledDropdown,
} from "reactstrap"

const FileList = () => {
  const myfiles = [
    {
      id: 1,
      name: "طرح",
      file: "12",
      Gb: 6,
    },
    {
      id: 2,
      name: "توسعه",
      file: "20",
      Gb: 8,
    },
    {
      id: 3,
      name: "پروژه A",
      file: "06 ",
      Gb: 2,
    },
    {
      id: 4,
      name: "ادمین",
      file: "08",
      Gb: 4,
    },
    {
      id: 5,
      name: "طراحی اسکج",
      file: "12",
      Gb: 6,
    },
    {
      id: 6,
      name: "برنامه های کاربردی",
      file: "20",
      Gb: 8,
    },
  ];
  return (
    <React.Fragment>
      <div>
        <Row className="mb-3">
          <Col xl={3} sm={6}>
            <div className="mt-2">
              <h5>فایل های من</h5>
            </div>
          </Col>
          <Col xl={9} sm={6}>
            <Form className="mt-4 mt-sm-0 float-sm-end d-flex align-items-center">
              <div className="search-box mb-2 me-2">
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control bg-light border-light rounded"
                    placeholder="جستجو ..."
                  />
                  <i className="bx bx-search-alt search-icon"></i>
                </div>
              </div>

              <UncontrolledDropdown className="mb-0">
                <DropdownToggle
                  tag="a"
                  className="btn btn-link text-muted mt-n2"
                >
                  <i className="mdi mdi-dots-vertical font-size-20"></i>
                </DropdownToggle>

                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem to="#">اشتراک گذاری فایل ها</DropdownItem>
                  <DropdownItem to="#">با من به اشتراک بگذارید</DropdownItem>
                  <DropdownItem to="#">اقدامات دیگر</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Form>
          </Col>
        </Row>
      </div>
      <div>
        <Row>
          {myfiles.map((myfiles, key) => (
            <Col xl={4} sm={6} key={key}>
              <Card className="shadow-none border">
                <CardBody className="p-3">
                  <div>
                    <div className="float-end ms-2">
                      <UncontrolledDropdown className="mb-2">
                        <DropdownToggle
                          tag="a"
                          className="font-size-16 text-muted"
                        >
                          <i className="mdi mdi-dots-horizontal"></i>
                        </DropdownToggle>

                        <DropdownMenu className="dropdown-menu-end">
                          <DropdownItem to="#">بازکردن</DropdownItem>
                          <DropdownItem to="#">ویرایش</DropdownItem>
                          <DropdownItem to="#">تغییر نام</DropdownItem>
                          <div className="dropdown-divider"></div>
                          <DropdownItem to="#">حذف</DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </div>
                    <div className="avatar-xs me-3 mb-3">
                      <div className="avatar-title bg-transparent rounded">
                        <i className="bx bxs-folder font-size-24 text-warning"></i>
                      </div>
                    </div>
                    <div className="d-flex">
                      <div className="overflow-hidden me-auto">
                        <h5 className="font-size-14 text-truncate mb-1">
                          <Link to="#" className="text-body">
                            {myfiles.name}
                          </Link>
                        </h5>
                        <p className="text-muted text-truncate mb-0">
                     فایل     {myfiles.file} 
                        </p>
                      </div>
                      <div className="align-self-end ms-2">
                        <p className="text-muted mb-0">{myfiles.Gb}GB</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </React.Fragment>
  );
}

export default FileList
