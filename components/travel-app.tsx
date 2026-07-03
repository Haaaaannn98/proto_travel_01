"use client"

import { useMemo, useState } from "react"
import { CalendarClock, Home, Map as MapIcon, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockTrips } from "@/lib/mock-data"
import type { Expense, Trip } from "@/lib/types"
import { formatDateRange } from "@/lib/format"
import { TripList } from "./trip-list"
import { TimelineView } from "./timeline-view"
import { MapView } from "./map-view"
import { ExpenseTracker } from "./expense-tracker"

type Tab = "home" | "timeline" | "map" | "expense"

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "여행", icon: Home },
  { id: "timeline", label: "일정", icon: CalendarClock },
  { id: "map", label: "지도", icon: MapIcon },
  { id: "expense", label: "가계부", icon: Wallet },
]

const APP_NAME = "여행 플래너"
const APP_TAGLINE = "하루를 알차게 채우는 여행 계획"

export function TravelApp() {
  const [trips, setTrips] = useState<Trip[]>(mockTrips)
  const [activeTripId, setActiveTripId] = useState(mockTrips[0]?.id ?? "")
  const [tab, setTab] = useState<Tab>("expense")

  const trip = useMemo(
    () => trips.find((t) => t.id === activeTripId) ?? trips[0],
    [trips, activeTripId],
  )

  function handleAddExpense(expense: Omit<Expense, "id">) {
    if (!trip) return
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id
          ? { ...t, expenses: [...t.expenses, { ...expense, id: `e-${Date.now()}` }] }
          : t,
      ),
    )
  }

  function handleDeleteExpense(expenseId: string) {
    if (!trip) return
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id
          ? { ...t, expenses: t.expenses.filter((e) => e.id !== expenseId) }
          : t,
      ),
    )
  }

  function handleAddTrip(newTrip: Trip) {
    setTrips((prev) => [newTrip, ...prev])
    setActiveTripId(newTrip.id)
  }

  function handleDeleteTrip(tripId: string) {
    setTrips((prev) => {
      const next = prev.filter((t) => t.id !== tripId)
      if (tripId === activeTripId && next.length > 0) {
        setActiveTripId(next[0].id)
      }
      return next
    })
  }

  const titleMap: Record<Tab, string> = {
    home: APP_NAME,
    timeline: "일자별 일정",
    map: "지도",
    expense: "가계부",
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
        {tab === "home" || !trip ? (
          <div>
            <h1 className="font-display text-2xl leading-none text-primary">{APP_NAME}</h1>
            <p className="mt-1 text-xs text-muted-foreground">{APP_TAGLINE}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{titleMap[tab]}</p>
              <h1 className="truncate font-display text-lg leading-tight">{trip.title}</h1>
            </div>
            <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {formatDateRange(trip.startDate, trip.endDate).split(" · ")[1]}
            </span>
          </div>
        )}
      </header>

      {/* 콘텐츠 */}
      <main className="flex-1 px-4 py-5">
        {tab === "home" && (
          <TripList
            trips={trips}
            activeTripId={activeTripId}
            onSelect={(id) => {
              setActiveTripId(id)
              setTab("timeline")
            }}
            onAddTrip={handleAddTrip}
            onDeleteTrip={handleDeleteTrip}
          />
        )}
        {tab !== "home" && !trip && (
          <div className="py-24 text-center text-sm text-muted-foreground">
            여행이 없습니다. &lsquo;여행&rsquo; 탭에서 새 여행을 만들어 보세요.
          </div>
        )}
        {tab === "timeline" && trip && <TimelineView trip={trip} />}
        {tab === "map" && trip && <MapView trip={trip} />}
        {tab === "expense" && trip && (
          <ExpenseTracker
            trip={trip}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
      </main>

      {/* 하단 네비게이션 */}
      <nav className="sticky bottom-0 z-30 mx-auto grid w-full max-w-md grid-cols-4 border-t border-border bg-background/95 backdrop-blur">
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
