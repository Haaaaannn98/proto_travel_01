"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { CalendarClock, ChevronLeft, Map as MapIcon, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Expense, Trip } from "@/lib/types"
import { formatDateRange } from "@/lib/format"
import {
  fetchTrip,
  addExpense,
  deleteExpense,
  addSpot,
  updateSpot,
  deleteSpot,
  type SpotInput,
} from "@/lib/supabase/queries"
import { TimelineView } from "./timeline-view"
import { MapView } from "./map-view"
import { ExpenseTracker } from "./expense-tracker"

type Tab = "timeline" | "map" | "expense"

const TABS: { id: Tab; label: string; icon: typeof CalendarClock }[] = [
  { id: "timeline", label: "일정", icon: CalendarClock },
  { id: "map", label: "지도", icon: MapIcon },
  { id: "expense", label: "가계부", icon: Wallet },
]

const titleMap: Record<Tab, string> = {
  timeline: "일자별 일정",
  map: "지도",
  expense: "가계부",
}

interface Props {
  tripId: string
}

export function TripDetailApp({ tripId }: Props) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>("expense")

  const loadTrip = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchTrip(tripId)
      if (!data) {
        setError("여행을 찾을 수 없습니다.")
        setTrip(null)
      } else {
        setTrip(data)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "여행을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    setLoading(true)
    loadTrip()
  }, [loadTrip])

  async function handleAddExpense(expense: Omit<Expense, "id">) {
    if (!trip) return
    try {
      const created = await addExpense(trip.id, expense)
      setTrip((prev) =>
        prev ? { ...prev, expenses: [...prev.expenses, created] } : prev,
      )
    } catch (e) {
      alert(e instanceof Error ? e.message : "지출 추가에 실패했습니다.")
    }
  }

  async function handleDeleteExpense(expenseId: string) {
    if (!trip) return
    try {
      await deleteExpense(expenseId)
      setTrip((prev) =>
        prev
          ? { ...prev, expenses: prev.expenses.filter((e) => e.id !== expenseId) }
          : prev,
      )
    } catch (e) {
      alert(e instanceof Error ? e.message : "지출 삭제에 실패했습니다.")
    }
  }
  async function handleAddSpot(dayId: string, input: SpotInput) {
    if (!trip) return
    try {
      const day = trip.days.find((d) => d.id === dayId)
      const sortOrder = day ? day.spots.length : 0
      const created = await addSpot(dayId, input, sortOrder)
      setTrip((prev) =>
        prev
          ? {
              ...prev,
              days: prev.days.map((d) =>
                d.id === dayId ? { ...d, spots: [...d.spots, created] } : d,
              ),
            }
          : prev,
      )
    } catch (e) {
      alert(e instanceof Error ? e.message : "장소 추가에 실패했습니다.")
    }
  }

  async function handleUpdateSpot(spotId: string, dayId: string, input: SpotInput) {
    if (!trip) return
    try {
      const updated = await updateSpot(spotId, input)
      setTrip((prev) =>
        prev
          ? {
              ...prev,
              days: prev.days.map((d) =>
                d.id === dayId
                  ? { ...d, spots: d.spots.map((s) => (s.id === spotId ? updated : s)) }
                  : d,
              ),
            }
          : prev,
      )
    } catch (e) {
      alert(e instanceof Error ? e.message : "장소 수정에 실패했습니다.")
    }
  }

  async function handleDeleteSpot(spotId: string, dayId: string) {
    if (!trip) return
    try {
      await deleteSpot(spotId)
      setTrip((prev) =>
        prev
          ? {
              ...prev,
              days: prev.days.map((d) =>
                d.id === dayId ? { ...d, spots: d.spots.filter((s) => s.id !== spotId) } : d,
              ),
            }
          : prev,
      )
    } catch (e) {
      alert(e instanceof Error ? e.message : "장소 삭제에 실패했습니다.")
    }
  }
  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">불러오는 중…</p>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-sm text-muted-foreground">{error ?? "여행을 찾을 수 없습니다."}</p>
        <Link href="/" className="text-sm font-medium text-primary underline">
          여행 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
        <div className="mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            여행 목록
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{titleMap[tab]}</p>
            <h1 className="truncate font-display text-lg leading-tight">{trip.title}</h1>
          </div>
          <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {formatDateRange(trip.startDate, trip.endDate).split(" · ")[1]}
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 py-5">
      {tab === "timeline" && (
          <TimelineView
            trip={trip}
            onAddSpot={handleAddSpot}
            onUpdateSpot={handleUpdateSpot}
            onDeleteSpot={handleDeleteSpot}
          />
        )}        {tab === "map" && <MapView trip={trip} />}
        {tab === "expense" && (
          <ExpenseTracker
            trip={trip}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
      </main>

      <nav className="sticky bottom-0 z-30 mx-auto grid w-full max-w-md grid-cols-3 border-t border-border bg-background/95 backdrop-blur">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "fill-primary/10")} />
              {label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
