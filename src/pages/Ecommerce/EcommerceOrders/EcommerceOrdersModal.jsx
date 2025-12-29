import React from "react"
import PropTypes from "prop-types"
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
} from "reactstrap"
import img7 from "../../../assets/images/product/img-7.png"
import img4 from "../../../assets/images/product/img-4.png"

const EcommerceOrdersModal = (props) => {
  const { isOpen, toggle, transaction } = props;
  return (
    <Modal
      isOpen={isOpen}
      role="dialog"
      autoFocus={true}
      centered={true}
      className="exampleModal"
      tabIndex="-1"
      toggle={toggle}
    >
      <div className="modal-content">
        <ModalHeader toggle={toggle}>جزئیات سفارش</ModalHeader>
        <ModalBody>
          <p className="mb-2">
            شناسه محصول:{" "}
            <span className="text-primary">
              {transaction.orderId || "#SK2540"}
            </span>
          </p>
          <p className="mb-4">
            نام صورتحساب:{" "}
            <span className="text-primary">
              {transaction.billingName || "Neal Matthews"}
            </span>
          </p>

          <div className="table-responsive">
            <Table className="table align-middle table-nowrap">
              <thead>
                <tr>
                  <th scope="col">محصول</th>
                  <th scope="col">نام محصول</th>
                  <th scope="col">قیمت</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    <div>
                      <img src={img7} alt="" className="avatar-sm" />
                    </div>
                  </th>
                  <td>
                    <div>
                      <h5 className="text-truncate font-size-14">
                        هدفون بی سیم (مشکی)
                      </h5>
                      <p className="text-muted mb-0">تومان 225.000 x 1</p>
                    </div>
                  </td>
                  <td>تومان 255.000</td>
                </tr>
                <tr>
                  <th scope="row">
                    <div>
                      <img src={img4} alt="" className="avatar-sm" />
                    </div>
                  </th>
                  <td>
                    <div>
                      <h5 className="text-truncate font-size-14">هودی (آبی)</h5>
                      <p className="text-muted mb-0">تومان 145.000 x 1</p>
                    </div>
                  </td>
                  <td> 145.000 تومان</td>
                </tr>
                <tr>
                  <td colSpan="2">
                    <h6 className="m-0 text-right">مجموع فرعی:</h6>
                  </td>
                  <td> {transaction.total || 400}</td>
                </tr>
                <tr>
                  <td colSpan="2">
                    <h6 className="m-0 text-right">حمل و نقل دریایی:</h6>
                  </td>
                  <td>رایگان</td>
                </tr>
                <tr>
                  <td colSpan="2">
                    <h6 className="m-0 text-right">مجموع:</h6>
                  </td>
                  <td> {transaction.total || 400}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="secondary" onClick={toggle}>
            بستن
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}

EcommerceOrdersModal.propTypes = {
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
}

export default EcommerceOrdersModal
