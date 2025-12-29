import React from "react";
import { Link } from "react-router-dom";
import { Card, CardText, CardTitle } from "reactstrap";

const CardTitleTreatment = ({ text }) => {
    return (
      <React.Fragment>
        <Card className={"card-body " + text}>
          <CardTitle tag="h4" className="mt-0">
            رفتار ویژه ی عنوان
          </CardTitle>
          <CardText>
            با متن پشتیبان زیر به عنوان یک راهنما طبیعی به موارد اضافی محتوا
          </CardText>
          <Link to="#" className="btn btn-primary">
           رفتن به جایی
          </Link>
        </Card>
      </React.Fragment>
    );
}

export default CardTitleTreatment;