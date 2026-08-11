import { toGregorian } from "jalaali-js";
import type { BackupDateRange, BackupSection } from "./backupService";

export interface BackupDateDraft { from: string; to: string }

const TEHRAN_OFFSET_MS = 3.5 * 60 * 60 * 1000;
const latin = (value: string) => value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));

function jalaliStartIso(value: string, addDays = 0) {
  const parts = latin(value).split("/").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) throw new Error("تاریخ واردشده معتبر نیست");
  const gregorian = toGregorian(parts[0], parts[1], parts[2]);
  return new Date(Date.UTC(gregorian.gy, gregorian.gm - 1, gregorian.gd + addDays) - TEHRAN_OFFSET_MS).toISOString();
}

export function buildBackupDateRanges(
  selectedSections: BackupSection[],
  drafts: Record<BackupSection, BackupDateDraft>,
) {
  const ranges: Partial<Record<BackupSection, BackupDateRange>> = {};
  const errors: Partial<Record<BackupSection, string>> = {};
  selectedSections.forEach((section) => {
    const draft = drafts[section];
    if (!draft?.from && !draft?.to) return;
    if (!draft?.from || !draft?.to) {
      errors[section] = "هر دو تاریخ شروع و پایان را وارد کنید";
      return;
    }
    try {
      const from = jalaliStartIso(draft.from);
      const to = jalaliStartIso(draft.to, 1);
      if (Date.parse(from) >= Date.parse(to)) errors[section] = "بازه تاریخ معکوس است";
      else ranges[section] = { from, to };
    } catch (error) {
      errors[section] = error instanceof Error ? error.message : "بازه تاریخ معتبر نیست";
    }
  });
  return { ranges, errors };
}
