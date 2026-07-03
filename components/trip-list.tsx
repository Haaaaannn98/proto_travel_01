"use client"

import { CalendarDays, ChevronRight, MapPin, Plus, Wallet } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Trip } from "@/lib/types"
import { formatDateRange, formatKRW } from "@/lib/format"

interface Props {
  trips: Trip[]
  activeTripId: string
  onSelect: (id: string) => void
}

export function TripList({ trips, activeTripId, onSelect }: Props) {
  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-lg">내 여행</h2>
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
          <Plus className="size-4" />새 여행
        </Button>
      </div>

      {trips.map((trip) => {
        const total = trip.expenses.reduce((s, e) => s + e.amountKRW, 0)
        const spotCount = trip.days.reduce((s, d) => s + d.spots.length, 0)
        const active = trip.id === activeTripId
        return (
          <button key={trip.id} onClick={() => onSelect(trip.id)} className="block w-full text-left">
            <Card
              className="overflow-hidden p-0 transition-shadow hover:shadow-md"
              style={active ? { outline: "2px solid var(--primary)" } : undefined}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ backgroundColor: trip.coverColor }}
              >
                <div className="text-primary-foreground">
                  <p className="text-xs opacity-90">
                    {trip.country} · {trip.destination}
                  </p>
                  <h3 className="font-display text-xl leading-tight">{trip.title}</h3>
                </div>
                <ChevronRight className="size-5 text-primary-foreground/90" />
              </div>
              <div className="grid grid-cols-3 divide-x divide-border">
                <Info icon={<CalendarDays className="size-4" />} label={formatDateRange(trip.startDate, trip.endDate).split(" · ")[1]} />
                <Info icon={<MapPin className="size-4" />} label={`${spotCount}곳`} />
                <Info icon={<Wallet className="size-4" />} label={formatKRW(total)} />
              </div>
            </Card>
          </button>
        )
      })}
    </div>
  )
}

function Info({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 py-3 text-center">
      <span className="text-primary">{icon}</span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}
