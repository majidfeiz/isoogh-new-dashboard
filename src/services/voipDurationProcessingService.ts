import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx"
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx"
import type {
  ExecuteDurationProcessingResult,
  UpdateDurationProcessingSettings,
  VoipDurationProcessingLog,
  VoipDurationProcessingStatus,
} from "./voipDurationProcessingService.types"

const unwrap = <T>(response: any): T => response?.data?.data

export async function getDurationProcessingStatus(config: Record<string, any> = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.voip.durationProcessingStatus), config)
  return unwrap<VoipDurationProcessingStatus>(response)
}

export async function getDurationProcessingLogs({ page = 1, limit = 20, signal }: { page?: number; limit?: number; signal?: AbortSignal } = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.voip.durationProcessingLogs), {
    params: { page, limit },
    signal,
  })
  const data = unwrap<any>(response) || {}
  const items: VoipDurationProcessingLog[] = Array.isArray(data.items) ? data.items : []
  const meta = data.meta || {}
  return {
    items: [...items].sort((a, b) => Date.parse(b.started_at || "") - Date.parse(a.started_at || "")),
    meta: {
      page: Number(meta.page ?? page),
      limit: Number(meta.limit ?? limit),
      total: Number(meta.total ?? items.length),
      lastPage: Number(meta.lastPage ?? meta.last_page ?? Math.max(1, Math.ceil(Number(meta.total || 0) / limit))),
    },
  }
}

export async function updateDurationProcessingSettings(payload: UpdateDurationProcessingSettings) {
  const response = await apiPatch(getApiUrl(API_ROUTES.voip.durationProcessingSettings), payload)
  return unwrap<VoipDurationProcessingStatus | UpdateDurationProcessingSettings>(response)
}

export async function executeDurationProcessing() {
  const response = await apiPost(getApiUrl(API_ROUTES.voip.durationProcessingExecute))
  return unwrap<ExecuteDurationProcessingResult>(response)
}
