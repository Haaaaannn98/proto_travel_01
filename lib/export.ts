import type { Trip } from "./types"
import { formatKRW } from "./format"

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function safeName(trip: Trip): string {
  return trip.title.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "")
}

/** 여행 전체를 JSON 파일로 내보내기 */
export function exportTripJSON(trip: Trip) {
  download(`${safeName(trip)}.json`, JSON.stringify(trip, null, 2), "application/json")
}

/** 가계부 내역을 CSV 파일로 내보내기 */
export function exportExpensesCSV(trip: Trip) {
  const header = ["날짜", "카테고리", "내용", "금액", "통화", "원화환산", "메모"]
  const rows = [...trip.expenses]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => [
      e.date,
      e.category,
      e.title,
      String(e.amount),
      e.currency,
      String(e.amountKRW),
      e.memo ?? "",
    ])
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n")
  // 엑셀 한글 깨짐 방지용 BOM
  download(`${safeName(trip)}_가계부.csv`, "\uFEFF" + csv, "text/csv;charset=utf-8")
}

/** 공유용 텍스트 요약 생성 */
export function buildShareText(trip: Trip): string {
  const total = trip.expenses.reduce((s, e) => s + e.amountKRW, 0)
  const spotCount = trip.days.reduce((s, d) => s + d.spots.length, 0)
  const lines = [
    `[${trip.title}]`,
    `${trip.country} · ${trip.destination}`,
    `${trip.startDate} ~ ${trip.endDate}`,
    `장소 ${spotCount}곳 · 총 지출 ${formatKRW(total)} / 예산 ${formatKRW(trip.budgetKRW)}`,
  ]
  return lines.join("\n")
}

/** 노드를 PNG 이미지로 저장 */
export async function exportNodeAsImage(node: HTMLElement, trip: Trip) {
  const { toPng } = await import("html-to-image")
  const bg = getComputedStyle(document.body).backgroundColor || "#ffffff"
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: bg,
    cacheBust: true,
  })
  const a = document.createElement("a")
  a.href = dataUrl
  a.download = `${safeName(trip)}_가계부.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
