export const SUPPORT_FORM_ENDED_CODE = "SUPPORT_FORM_ENDED";
export const SUPPORT_FORM_READ_ONLY_MESSAGE = "تاریخ پایان این فرم تماس گذشته است؛ فرم فقط قابل مشاهده است.";

export const isSupportFormEndedError = (error) => {
  const payload = error?.response?.data?.data ?? error?.response?.data;
  return error?.response?.status === 403 && payload?.code === SUPPORT_FORM_ENDED_CODE;
};

export const closeSupportForm = (form, error) => {
  const payload = error?.response?.data?.data ?? error?.response?.data ?? {};
  return {
    ...(form || {}),
    endAt: payload.endAt ?? form?.endAt ?? null,
    isClosed: true,
    canEdit: false,
    canCall: false,
    closedReason: "end_at_reached",
  };
};
