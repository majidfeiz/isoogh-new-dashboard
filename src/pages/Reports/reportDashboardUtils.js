export function currentJalaliMonthRange(now = new Date(), timeZone = "Asia/Tehran") {
  const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", { timeZone, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now)
  const value = (type) => Number(parts.find((part) => part.type === type)?.value)
  const year = value("year"); const month = value("month")
  const nextYear = month === 12 ? year + 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  const pad = (number) => String(number).padStart(2, "0")
  return { from: `${year}/${pad(month)}/01`, to: `${nextYear}/${pad(nextMonth)}/01` }
}

export const validDashboardRange = ({ from, to } = {}) => Boolean(/^\d{4}\/\d{2}\/\d{2}$/.test(from || "") && /^\d{4}\/\d{2}\/\d{2}$/.test(to || "") && from < to)

export const canceledReportError = (error) => error?.name === "AbortError" || error?.name === "CanceledError" || error?.code === "ERR_CANCELED"

export function reportErrorMessage(error) {
  const status = error?.response?.status
  if (status === 400) return "برای مشاهده گزارش، مجموعه را انتخاب کنید"
  if (status === 403) return "این مجموعه خارج از محدوده دسترسی شماست"
  if (status === 503 || error?.code === "ECONNABORTED") return "سرویس گزارش موقتاً در دسترس نیست؛ دوباره تلاش کنید."
  return error?.response?.data?.message || "دریافت گزارش با خطا مواجه شد."
}

export const reportRoleNames = (user) => [
  ...(user?.roles || []),
  user?.role,
  user?.accountType,
  user?.account_type,
]
  .map((role) => typeof role === "string" ? role : role?.name || role?.slug)
  .filter(Boolean)
  .map((role) => String(role).toLowerCase())

export const isReportManager = (user) => reportRoleNames(user).includes("manager")

export const normalizeReportSchools = (user, selectedSchoolId = "") => {
  const raw = Array.isArray(user?.schools) ? user.schools : user?.school ? [user.school] : []
  const schools = raw.map((school) => ({
    ...school,
    id: school?.id ?? school?.schoolId ?? school?.school_id,
    name: school?.name ?? school?.schoolName ?? school?.school_name ?? school?.title,
  })).filter((school) => school.id != null)
  const directId = user?.schoolId ?? user?.school_id ?? selectedSchoolId
  if (!schools.length && directId) schools.push({ id: directId, name: user?.schoolName || user?.school_name || "مجموعه من" })
  return schools
}
