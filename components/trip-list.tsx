"use client"

import { CalendarDays, ChevronRight, MapPin, Trash2, Wallet } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Trip } from "@/lib/types"
import { formatDateRange, formatKRW } from "@/lib/format"
import { AddTripDialog } from "./add-trip-dialog"

interface Props {
  trips: Trip[]
  onSelect: (id: string) => void
  onCreated: (id: string) => void
  onDeleteTrip: (id: string) => void
}

export function TripList({ trips, onSelect, onCreated, onDeleteTrip }: Props) {
  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-lg">내 여행</h2>
        <AddTripDialog onCreated={onCreated} />
      </div>

      {trips.length === 0 && (
        <Card className="p-10 text-center">
          <p className="text-sm text-muted-foreground">
            아직 여행이 없어요. &lsquo;새 여행&rsquo;으로 시작해 보세요.
          </p>
        </Card>
      )}

      {trips.map((trip) => {
        const total = trip.expenses.reduce((s, e) => s + e.amountKRW, 0)
        const spotCount = trip.days.reduce((s, d) => s + d.spots.length, 0)
        return (
          <Card
            key={trip.id}
            className="overflow-hidden p-0 transition-shadow hover:shadow-md"
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ backgroundColor: trip.coverColor }}
            >
              <button
                onClick={() => onSelect(trip.id)}
                className="min-w-0 flex-1 text-left text-primary-foreground"
              >
                <p className="text-xs opacity-90">
                  {trip.country ? `${trip.country} · ` : ""}
                  {trip.destination}
                </p>
                <h3 className="truncate font-display text-xl leading-tight">{trip.title}</h3>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`'${trip.title}' 여행을 삭제할까요?`)) onDeleteTrip(trip.id)
                  }}
                  aria-label="여행 삭제"
                  className="rounded-full p-1.5 text-primary-foreground/90 transition-colors hover:bg-black/10"
                >
                  <Trash2 className="size-4" />
                </button>
                <button onClick={() => onSelect(trip.id)} aria-label="여행 열기">
                  <ChevronRight className="size-5 text-primary-foreground/90" />
                </button>
              </div>
            </div>
            <button
              onClick={() => onSelect(trip.id)}
              className="grid w-full grid-cols-3 divide-x divide-border"
            >
              <Info
                icon={<CalendarDays className="size-4" />}
                label={formatDateRange(trip.startDate, trip.endDate).split(" · ")[1]}
              />
              <Info icon={<MapPin className="size-4" />} label={`${spotCount}곳`} />
              <Info icon={<Wallet className="size-4" />} label={formatKRW(total)} />
            </button>
          </Card>
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
