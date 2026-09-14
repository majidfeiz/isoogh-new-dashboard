import React from "react"
import { act, render } from "@testing-library/react"
import { getDurationProcessingStatus } from "../../../services/voipDurationProcessingService"
import { STATUS_POLL_INTERVAL, useDurationProcessingStatus } from "./useDurationProcessingQueries"

jest.mock("../../../services/voipDurationProcessingService", () => ({ getDurationProcessingLogs: jest.fn(), getDurationProcessingStatus: jest.fn() }))

const Harness = () => { useDurationProcessingStatus(); return null }

test("polls every 15 seconds only while the tab is visible", async () => {
  jest.useFakeTimers()
  getDurationProcessingStatus.mockResolvedValue({ settings: {} })
  let visibility = "visible"
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => visibility })
  render(<Harness />)
  await act(async () => Promise.resolve())
  expect(getDurationProcessingStatus).toHaveBeenCalledTimes(1)
  await act(async () => { jest.advanceTimersByTime(STATUS_POLL_INTERVAL); await Promise.resolve() })
  expect(getDurationProcessingStatus).toHaveBeenCalledTimes(2)
  visibility = "hidden"
  await act(async () => { jest.advanceTimersByTime(STATUS_POLL_INTERVAL); await Promise.resolve() })
  expect(getDurationProcessingStatus).toHaveBeenCalledTimes(2)
  visibility = "visible"
  await act(async () => { document.dispatchEvent(new Event("visibilitychange")); await Promise.resolve() })
  expect(getDurationProcessingStatus).toHaveBeenCalledTimes(3)
  jest.useRealTimers()
})
