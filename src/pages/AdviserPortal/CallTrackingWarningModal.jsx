import React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const CallTrackingWarningModal = ({ open, onAcknowledge }) => (
  <Modal isOpen={open} backdrop="static" keyboard={false} centered>
    <ModalHeader className="bg-danger text-white">
      <div className="d-flex align-items-center gap-2">
        <i className="bx bx-error-circle font-size-24" />
        تماس در سامانه ثبت نشده است
      </div>
    </ModalHeader>
    <ModalBody className="p-4">
      <div className="text-center mb-3">
        <i className="bx bx-phone-off text-danger" style={{ fontSize: 64 }} />
      </div>
      <p className="fw-semibold font-size-16 text-center mb-3">
        این تماس قابل رهگیری و ثبت لاگ در سامانه نیست.
      </p>
      <div className="alert alert-danger mb-0">
        اگر تلفن شما از طرف VoIP زنگ خورد، تماس را فوراً قطع کنید و دوباره برای برقراری تماس تلاش کنید.
      </div>
    </ModalBody>
    <ModalFooter className="justify-content-center">
      <Button color="danger" size="lg" onClick={onAcknowledge} className="px-4">
        متوجه شدم و تماس را قطع می‌کنم
      </Button>
    </ModalFooter>
  </Modal>
);

export default CallTrackingWarningModal;
