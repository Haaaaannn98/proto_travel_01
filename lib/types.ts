export type SpotCategory = "관광지" | "맛집" | "카페" | "숙소" | "교통" | "쇼핑"

export type ExpenseCategory = "숙박" | "식비" | "교통" | "관광" | "쇼핑" | "기타"

export type Currency = "JPY" | "USD" | "EUR" | "KRW" | "THB" | "VND"

export interface Spot {
  id: string
  name: string
  category: SpotCategory
  /** 예상 소요시간 (분) - 직접 입력 */
  stayMinutes: number
  /** 다음 장소까지 이동시간 (분) - API 자동 계산 가정 */
  travelMinutes: number
  /** 도착 예정 시각 "HH:MM" */
  arrival: string
  /** 영업정보 (직접 확인 입력) */
  hours?: string
  /** 평점 (API 참고) */
  rating?: number
  address?: string
  memo?: string
}

export interface Day {
  id: string
  date: string // ISO date
  label: string
  spots: Spot[]
}

export interface Expense {
  id: string
  date: string // ISO date
  category: ExpenseCategory
  title: string
  /** 결제 통화 기준 금액 */
  amount: number
  currency: Currency
  /** 원화 환산 금액 */
  amountKRW: number
  memo?: string
}

export interface Trip {
  id: string
  title: string
  destination: string
  country: string
  startDate: string
  endDate: string
  coverColor: string
  budgetKRW: number
  days: Day[]
  expenses: Expense[]
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "숙박",
  "식비",
  "교통",
  "관광",
  "쇼핑",
  "기타",
]

export const CURRENCY_INFO: Record<Currency, { symbol: string; label: string; toKRW: number }> = {
  JPY: { symbol: "¥", label: "엔", toKRW: 9.1 },
  USD: { symbol: "$", label: "달러", toKRW: 1370 },
  EUR: { symbol: "€", label: "유로", toKRW: 1480 },
  KRW: { symbol: "₩", label: "원", toKRW: 1 },
  THB: { symbol: "฿", label: "바트", toKRW: 39 },
  VND: { symbol: "₫", label: "동", toKRW: 0.055 },
}

/** 카테고리별 색상 토큰 (globals.css의 chart 토큰과 매핑) */
export const EXPENSE_CATEGORY_COLOR: Record<ExpenseCategory, string> = {
  숙박: "var(--chart-4)",
  식비: "var(--chart-1)",
  교통: "var(--chart-2)",
  관광: "var(--chart-3)",
  쇼핑: "var(--chart-5)",
  기타: "var(--muted-foreground)",
}
