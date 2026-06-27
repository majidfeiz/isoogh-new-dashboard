import { useState, useCallback } from "react"
import { useNavigationType } from "react-router-dom"

export function useListState(key) {
  const navigationType = useNavigationType()

  const [saved] = useState(() => {
    if (navigationType !== "POP") return null
    try {
      const raw = sessionStorage.getItem(`list:${key}`)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const saveState = useCallback(
    (state) => {
      try {
        sessionStorage.setItem(`list:${key}`, JSON.stringify(state))
      } catch {}
    },
    [key]
  )

  return { saved, saveState }
}
