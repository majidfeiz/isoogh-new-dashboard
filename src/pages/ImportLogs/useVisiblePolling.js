import { useEffect } from "react";

export const shouldPoll = (enabled, visibilityState) => Boolean(enabled) && visibilityState === "visible";

export default function useVisiblePolling(callback, enabled, interval = 5000) {
  useEffect(() => {
    if (!enabled) return undefined;
    const timer = setInterval(() => {
      if (shouldPoll(enabled, document.visibilityState)) callback();
    }, interval);
    return () => clearInterval(timer);
  }, [callback, enabled, interval]);
}
