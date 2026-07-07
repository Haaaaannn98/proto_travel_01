import type { Currency, Expense, ExpenseCategory, Spot, SpotCategory, Trip } from "@/lib/types"
import type { DbExpense, DbSpot, DbTripSummary, DbTripWithRelations } from "./types"

export function mapSpot(row: DbSpot): Spot {
  return {
    id: row.id,
    name: row.name,
    category: row.category as SpotCategory,
    stayMinutes: row.stay_minutes,
    travelMinutes: row.travel_minutes,
    arrival: row.arrival,
    hours: row.hours ?? undefined,
    rating: row.rating ?? undefined,
    address: row.address ?? undefined,
    memo: row.memo ?? undefined,
  }
}

export function mapExpense(row: DbExpense): Expense {
  return {
    id: row.id,
    date: row.date,
    category: row.category as ExpenseCategory,
    title: row.title,
    amount: Number(row.amount),
    currency: row.currency as Currency,
    amountKRW: row.amount_krw,
    memo: row.memo ?? undefined,
  }
}

export function mapTrip(row: DbTripWithRelations): Trip {
  const days = [...row.days]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((day) => ({
      id: day.id,
      date: day.date,
      label: day.label,
      spots: [...day.spots].sort((a, b) => a.sort_order - b.sort_order).map(mapSpot),
    }))

  const expenses = [...row.expenses]
    .sort((a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at))
    .map(mapExpense)

  return {
    id: row.id,
    title: row.title,
    destination: row.destination,
    country: row.country,
    startDate: row.start_date,
    endDate: row.end_date,
    coverColor: row.cover_color,
    budgetKRW: row.budget_krw,
    days,
    expenses,
  }
}

export function mapTripSummary(row: DbTripSummary): Trip {
  const days = row.days.map((day) => ({
    id: day.id,
    date: "",
    label: "",
    spots: day.spots.map((s) => ({
      id: s.id,
      name: "",
      category: "관광지" as SpotCategory,
      stayMinutes: 0,
      travelMinutes: 0,
      arrival: "00:00",
    })),
  }))

  const expenses = row.expenses.map((e, i) => ({
    id: `summary-${i}`,
    date: "",
    category: "기타" as ExpenseCategory,
    title: "",
    amount: 0,
    currency: "KRW" as Currency,
    amountKRW: e.amount_krw,
  }))

  return {
    id: row.id,
    title: row.title,
    destination: row.destination,
    country: row.country,
    startDate: row.start_date,
    endDate: row.end_date,
    coverColor: row.cover_color,
    budgetKRW: row.budget_krw,
    days,
    expenses,
  }
}
