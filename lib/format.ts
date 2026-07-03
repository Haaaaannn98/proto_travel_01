import { CURRENCY_INFO, type Currency, type SpotCategory } from "./types"

export function formatKRW(value: number): string {
  return "₩" + Math.round(value).toLocaleString("ko-KR")
}

export function formatCurrency(value: number, currency: Currency): string {
  const info = CURRENCY_INFO[currency]
  return info.symbol + Math.round(value).toLocaleString("ko-KR")
}

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  const days = ["일", "월", "화", "수", "목", "금", "토"]
  return `${d.getMonth() + 1}.${d.getDate()} (${days[d.getDay()]})`
}

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start + "T00:00:00")
  const e = new Date(end + "T00:00:00")
  const nights = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
  return `${s.getMonth() + 1}.${s.getDate()} - ${e.getMonth() + 1}.${e.getDate()} · ${nights}박 ${nights + 1}일`
}

export const SPOT_CATEGORY_EMOJI_TOKEN: Record<SpotCategory, string> = {
  관광지: "var(--chart-3)",
  맛집: "var(--chart-1)",
  카페: "var(--chart-5)",
  숙소: "var(--chart-4)",
  교통: "var(--chart-2)",
  쇼핑: "var(--chart-5)",
}
