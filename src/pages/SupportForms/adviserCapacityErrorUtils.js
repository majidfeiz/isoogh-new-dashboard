const number = (value) => Math.max(0, Number(value) || 0).toLocaleString("fa-IR")

export function adviserCapacityConflict(error) {
  if (error?.response?.status !== 409) return null
  const payload = error?.response?.data?.data ?? error?.response?.data ?? {}
  return {
    payload,
    message: `ظرفیت این مشاور تکمیل است. ظرفیت کل: ${number(payload.capacity)}، تعداد فعال یکتا: ${number(payload.activeCount)}، ظرفیت باقی‌مانده: ${number(payload.remainingCapacity)}، تعداد درخواستی: ${number(payload.requested)}، دانش‌آموز جدید مصرف‌کننده ظرفیت: ${number(payload.newStudents)}.`,
  }
}

export function notifyCapacityChanged(formId) {
  window.dispatchEvent(new CustomEvent("adviser-form-capacity:refresh", { detail: { formId: String(formId) } }))
}
