export interface DbTrip {
  id: string
  title: string
  destination: string
  country: string
  start_date: string
  end_date: string
  cover_color: string
  budget_krw: number
  created_at: string
  updated_at: string
}

export interface DbDay {
  id: string
  trip_id: string
  date: string
  label: string
  sort_order: number
  created_at: string
}

export interface DbSpot {
  id: string
  day_id: string
  name: string
  category: string
  stay_minutes: number
  travel_minutes: number
  arrival: string
  hours: string | null
  rating: number | null
  address: string | null
  memo: string | null
  sort_order: number
  created_at: string
}

export interface DbExpense {
  id: string
  trip_id: string
  date: string
  category: string
  title: string
  amount: number
  currency: string
  amount_krw: number
  memo: string | null
  created_at: string
}

export interface DbTripWithRelations extends DbTrip {
  days: (DbDay & { spots: DbSpot[] })[]
  expenses: DbExpense[]
}

export interface DbTripSummary extends DbTrip {
  days: { id: string; spots: { id: string }[] }[]
  expenses: { amount_krw: number }[]
}
