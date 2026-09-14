export interface VoipDurationProcessingSettings {
  enabled: boolean
  workerCount: number
  concurrency: number
  updatedAt: string | null
}

export interface VoipDurationProcessingStatus {
  settings: VoipDurationProcessingSettings
  environmentEnabled: boolean
  effectiveEnabled: boolean
  total: number
  processed: number
  calculated: number
  invalid: number
  pending: number
  progressPercent: number
  estimatedRemainingSeconds: number | null
  recordsPerSecond: number
  lastRunAt: string | null
}

export interface VoipDurationProcessingLog {
  id?: number | string
  worker_id: string | number | null
  status: string
  scanned_count: number
  calculated_count: number
  invalid_count: number
  highest_history_id: number | null
  lowest_history_id: number | null
  duration_ms: number | null
  error_message: string | null
  started_at: string | null
  finished_at: string | null
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  lastPage: number
}

export interface ExecuteDurationProcessingResult {
  accepted: boolean
  processed: number
  reason: "disabled" | "busy" | string | null
}

export type UpdateDurationProcessingSettings = Pick<
  VoipDurationProcessingSettings,
  "enabled" | "workerCount" | "concurrency"
>
