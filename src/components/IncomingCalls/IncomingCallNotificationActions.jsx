import React from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { buildLatestSupportFormTarget, notificationToIncomingCall } from "./incomingCallNotificationUtils.js";

const IncomingCallNotificationActions = ({ item, markRead }) => {
  const navigate = useNavigate();
  const data = item?.data || {};
  const act = async (action) => {
    if (!item.isRead) await markRead(item);
    action();
  };
  const openProfile = () => act(() => window.dispatchEvent(new CustomEvent("incoming-calls:open-notification", { detail: notificationToIncomingCall(item) })));
  const formTarget = buildLatestSupportFormTarget(data.latestSupportForm);
  if (!data.matched) return null;
  return <div className="d-flex flex-wrap gap-2 mt-2" onClick={(event) => event.stopPropagation()}>
    {data.callerProfileUrl && <Button size="sm" outline color="primary" onClick={openProfile}><i className="bx bx-user me-1" />مشاهده پرونده</Button>}
    {formTarget && <Button size="sm" outline color="success" onClick={() => act(() => navigate(formTarget.pathname + formTarget.search, { state: formTarget.state }))}><i className="bx bx-file me-1" />آخرین فرم تماس</Button>}
  </div>;
};

export default IncomingCallNotificationActions;
