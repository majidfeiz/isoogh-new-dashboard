export const faNumber = (value, options) => value == null || Number.isNaN(Number(value)) ? "—" : Number(value).toLocaleString("fa-IR", options)

export const formatEta = (seconds) => {
  if (seconds == null || !Number.isFinite(Number(seconds))) return "نامشخص"
  const value = Math.max(0, Math.round(Number(seconds)))
  if (value === 0) return "کمتر از یک دقیقه"
  const days = Math.floor(value / 86400)
  const hours = Math.floor((value % 86400) / 3600)
  const minutes = Math.floor((value % 3600) / 60) || (!days && !hours ? 1 : 0)
  return [days && `${faNumber(days)} روز`, hours && `${faNumber(hours)} ساعت`, minutes && `${faNumber(minutes)} دقیقه`].filter(Boolean).join(" و ")
}

export const formatDate = (value) => value ? new Date(value).toLocaleString("fa-IR") : "—"

export const validateSettings = ({ workerCount, concurrency }) => {
  const errors = {}
  if (!Number.isInteger(Number(workerCount)) || Number(workerCount) < 1 || Number(workerCount) > 20) errors.workerCount = "تعداد worker باید عددی بین ۱ تا ۲۰ باشد."
  if (!Number.isInteger(Number(concurrency)) || Number(concurrency) < 1 || Number(concurrency) > 500) errors.concurrency = "Concurrency باید عددی بین ۱ تا ۵۰۰ باشد."
  return errors
}

export const errorText = (error, fallback) => error?.response?.status === 403 ? "مجوز لازم برای انجام این عملیات را ندارید." : error?.code === "ERR_NETWORK" ? "ارتباط با سرور برقرار نشد." : fallback
