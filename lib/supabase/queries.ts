import type { Expense, Spot, SpotCategory, Trip } from "@/lib/types"
import { createSupabaseClient } from "./client"
import { mapExpense, mapSpot, mapTrip, mapTripSummary } from "./mappers"
import type { DbTripSummary, DbTripWithRelations } from "./types"

const TRIP_SELECT = `
  *,
  days (
    *,
    spots (*)
  ),
  expenses (*)
`

const TRIP_LIST_SELECT = `
  *,
  days ( id, spots ( id ) ),
  expenses ( amount_krw )
`

export async function fetchTrips(): Promise<Trip[]> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from("trips")
    .select(TRIP_LIST_SELECT)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as DbTripSummary[]).map(mapTripSummary)
}

export async function fetchTrip(id: string): Promise<Trip | null> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from("trips")
    .select(TRIP_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapTrip(data as DbTripWithRelations)
}

export interface CreateTripInput {
  title: string
  destination: string
  country: string
  startDate: string
  endDate: string
  coverColor: string
  budgetKRW: number
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function buildDayRows(tripId: string, startDate: string, endDate: string) {
  const rows: { trip_id: string; date: string; label: string; sort_order: number }[] = []
  const start = new Date(startDate + "T00:00:00")
  const end = new Date(endDate + "T00:00:00")
  let i = 0
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    i += 1
    rows.push({
      trip_id: tripId,
      date: toISODate(d),
      label: `${i}일차`,
      sort_order: i - 1,
    })
  }
  return rows
}

export async function createTrip(input: CreateTripInput): Promise<string> {
  const supabase = createSupabaseClient()

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      title: input.title,
      destination: input.destination,
      country: input.country,
      start_date: input.startDate,
      end_date: input.endDate,
      cover_color: input.coverColor,
      budget_krw: input.budgetKRW,
    })
    .select("id")
    .single()

  if (tripError) throw tripError

  const dayRows = buildDayRows(trip.id, input.startDate, input.endDate)
  if (dayRows.length > 0) {
    const { error: daysError } = await supabase.from("days").insert(dayRows)
    if (daysError) throw daysError
  }

  return trip.id
}

export async function deleteTrip(id: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase.from("trips").delete().eq("id", id)
  if (error) throw error
}

export async function addExpense(tripId: string, expense: Omit<Expense, "id">): Promise<Expense> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      trip_id: tripId,
      date: expense.date,
      category: expense.category,
      title: expense.title,
      amount: expense.amount,
      currency: expense.currency,
      amount_krw: expense.amountKRW,
      memo: expense.memo ?? null,
    })
    .select("*")
    .single()

  if (error) throw error
  return mapExpense(data)
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId)
  if (error) throw error
}
export interface SpotInput {
  name: string
  category: SpotCategory
  stayMinutes: number
  travelMinutes: number
  arrival: string
  hours?: string
  rating?: number
  address?: string
  memo?: string
}

function toDbSpot(dayId: string, spot: SpotInput, sortOrder: number) {
  return {
    day_id: dayId,
    name: spot.name,
    category: spot.category,
    stay_minutes: spot.stayMinutes,
    travel_minutes: spot.travelMinutes,
    arrival: spot.arrival,
    hours: spot.hours ?? null,
    rating: spot.rating ?? null,
    address: spot.address ?? null,
    memo: spot.memo ?? null,
    sort_order: sortOrder,
  }
}

export async function addSpot(
  dayId: string,
  spot: SpotInput,
  sortOrder: number,
): Promise<Spot> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from("spots")
    .insert(toDbSpot(dayId, spot, sortOrder))
    .select("*")
    .single()

  if (error) throw error
  return mapSpot(data)
}

export async function updateSpot(spotId: string, spot: SpotInput): Promise<Spot> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from("spots")
    .update({
      name: spot.name,
      category: spot.category,
      stay_minutes: spot.stayMinutes,
      travel_minutes: spot.travelMinutes,
      arrival: spot.arrival,
      hours: spot.hours ?? null,
      rating: spot.rating ?? null,
      address: spot.address ?? null,
      memo: spot.memo ?? null,
    })
    .eq("id", spotId)
    .select("*")
    .single()

  if (error) throw error
  return mapSpot(data)
}

export async function deleteSpot(spotId: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase.from("spots").delete().eq("id", spotId)
  if (error) throw error
}
