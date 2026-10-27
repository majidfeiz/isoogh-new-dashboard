export const adviserSchool = (adviser, schoolId) => (adviser?.schools || []).find((school) => String(school?.id ?? school?.schoolId ?? school?.school_id) === String(schoolId)) || null
export const adviserAccountActive = (adviser, schoolId) => {
  const school = adviserSchool(adviser, schoolId)
  if (!school) return null
  const value = school.is_active ?? school.isActive
  return value === true || value === 1 || value === "1"
}
export const withAdviserAccountStatus = (adviser, schoolId, isActive) => ({
  ...adviser,
  schools: (adviser?.schools || []).map((school) => String(school?.id ?? school?.schoolId ?? school?.school_id) === String(schoolId)
    ? { ...school, is_active: Boolean(isActive), isActive: Boolean(isActive) }
    : school),
})
export const adviserAccountErrorMessage = (error) => {
  const message = error?.response?.data?.message ?? error?.response?.data?.error
  if (Array.isArray(message)) return message.join("، ")
  if (message) return message
  if (error?.response?.status === 403) return "اجازه تغییر وضعیت حساب این مشاور را ندارید."
  if (error?.response?.status === 404) return "مشاور یا مجموعه موردنظر یافت نشد."
  return "تغییر وضعیت حساب مشاور انجام نشد."
}
export const INACTIVE_CONFIRMATION = "با غیرفعال‌سازی، ایجاد تماس ورودی و خروجی جدید برای این مشاور در این مجموعه مسدود می‌شود. سوابق حذف نمی‌شوند و تماس جاری یا تماس‌های از قبل در صف قطع نخواهند شد. ادامه می‌دهید؟"
