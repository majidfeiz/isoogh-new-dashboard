import PropTypes from 'prop-types'
import React from "react"
import { Modal, ModalBody } from "reactstrap"

const DeleteModal = ({
  show,
  onDeleteClick,
  onCloseClick,
  loading = false,
  message = "آیا مطمئن هستید که می خواهید کار را برای همیشه پاک کنید",
  confirmText = "پاک کردن",
  loadingText = "در حال حذف...",
  cancelText = "بستن",
  confirmColor = "danger",
  icon = "mdi mdi-trash-can-outline",
}) => {
  return (
    <Modal size="md" isOpen={show} toggle={onCloseClick} centered={true}>
      <div className="modal-content">
        <ModalBody className="px-4 py-5 text-center">
          <button
            type="button"
            onClick={onCloseClick}
            className="btn-close position-absolute end-0 top-0 m-3"
            disabled={loading}
          ></button>
          <div className="avatar-sm mb-4 mx-auto">
            <div className="avatar-title bg-primary text-primary bg-opacity-10 font-size-20 rounded-3">
              <i className={icon}></i>
            </div>
          </div>
          <p className="text-muted font-size-16 mb-4">
            {message}
          </p>

          <div className="hstack gap-2 justify-content-center mb-0">
            <button
              type="button"
              className={`btn btn-${confirmColor}`}
              onClick={onDeleteClick}
              disabled={loading}
            >
              {loading ? loadingText : confirmText}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCloseClick}
              disabled={loading}
            >
              {cancelText}
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
}

DeleteModal.propTypes = {
  onCloseClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  show: PropTypes.any,
  loading: PropTypes.bool,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  loadingText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmColor: PropTypes.string,
  icon: PropTypes.string
}

export default DeleteModal
