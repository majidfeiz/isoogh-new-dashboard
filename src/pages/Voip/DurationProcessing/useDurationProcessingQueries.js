import { useCallback, useEffect, useRef, useState } from "react"
import { getDurationProcessingLogs, getDurationProcessingStatus } from "../../../services/voipDurationProcessingService"
import { errorText } from "./durationProcessingUtils"

export const durationProcessingQueryKeys = {
  all: ["voip", "duration-processing"],
  status: ["voip", "duration-processing", "status"],
  logs: (page, limit) => ["voip", "duration-processing", "logs", page, limit],
}

export const STATUS_POLL_INTERVAL = 15000

export function useDurationProcessingStatus() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const mounted = useRef(true)
  const hasData = useRef(false)

  const refetch = useCallback(async ({ background = false } = {}) => {
    background ? setRefreshing(true) : setLoading((current) => hasData.current ? current : true)
    try {
      const result = await getDurationProcessingStatus({ silent: true })
      if (mounted.current) { hasData.current = true; setData(result); setError("") }
      return result
    } catch (caught) {
      if (mounted.current) setError(errorText(caught, "دریافت وضعیت پردازش ناموفق بود."))
      throw caught
    } finally {
      if (mounted.current) { setLoading(false); setRefreshing(false) }
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    refetch().catch(() => {})
    const poll = () => { if (document.visibilityState === "visible") refetch({ background: true }).catch(() => {}) }
    const timer = window.setInterval(poll, STATUS_POLL_INTERVAL)
    const onVisibility = () => { if (document.visibilityState === "visible") poll() }
    document.addEventListener("visibilitychange", onVisibility)
    return () => { mounted.current = false; window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisibility) }
  }, [refetch])

  return { data, loading, refreshing, error, refetch }
}

export function useDurationProcessingLogs(page, limit) {
  const [state, setState] = useState({ items: [], meta: { page, limit, total: 0, lastPage: 1 }, loading: true, error: "" })
  const controllerRef = useRef(null)
  const refetch = useCallback(async () => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setState((old) => ({ ...old, loading: true, error: "" }))
    try {
      const result = await getDurationProcessingLogs({ page, limit, signal: controller.signal })
      setState({ ...result, loading: false, error: "" })
    } catch (caught) {
      if (caught?.code !== "ERR_CANCELED") setState((old) => ({ ...old, loading: false, error: errorText(caught, "دریافت لاگ‌ها ناموفق بود.") }))
    }
  }, [page, limit])
  useEffect(() => { refetch(); return () => controllerRef.current?.abort() }, [refetch])
  return { ...state, refetch }
}
