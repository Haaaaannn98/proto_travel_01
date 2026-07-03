"use client"

import { useState } from "react"
import { Clock, MapPin, Route, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Trip } from "@/lib/types"
import { formatDateShort, formatMinutes } from "@/lib/format"
import { spotIcon } from "./category-icon"

export function TimelineView({ trip }: { trip: Trip }) {
  const [activeDay, setActiveDay] = useState(trip.days[0]?.id)
  const day = trip.days.find((d) => d.id === activeDay) ?? trip.days[0]

  const stayTotal = day.spots.reduce((s, sp) => s + sp.stayMinutes, 0)
  const travelTotal = day.spots.reduce((s, sp) => s + sp.travelMinutes, 0)
  const dayTotal = stayTotal + travelTotal

  return (
    <div className="space-y-5 pb-24">
      {/* 일자 선택 */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {trip.days.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setActiveDay(d.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              d.id === activeDay
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40",
            )}
          >
            {i + 1}일차 · {formatDateShort(d.date)}
          </button>
        ))}
      </div>

      {/* 하루 총 시간 요약 */}
      <Card className="grid grid-cols-3 divide-x divide-border p-0 text-center">
        <div className="px-2 py-4">
          <p className="text-xs text-muted-foreground">머문 시간</p>
          <p className="mt-1 font-display text-lg">{formatMinutes(stayTotal)}</p>
        </div>
        <div className="px-2 py-4">
          <p className="text-xs text-muted-foreground">이동 시간</p>
          <p className="mt-1 font-display text-lg">{formatMinutes(travelTotal)}</p>
        </div>
        <div className="bg-accent/50 px-2 py-4">
          <p className="text-xs text-muted-foreground">하루 총합</p>
          <p className="mt-1 font-display text-lg text-primary">{formatMinutes(dayTotal)}</p>
        </div>
      </Card>

      <p className="px-1 text-sm font-semibold text-muted-foreground">{day.label}</p>

      {/* 타임라인 */}
      <ol className="relative space-y-0">
        {day.spots.map((spot, i) => {
          const Icon = spotIcon[spot.category] ?? MapPin
          const isLast = i === day.spots.length - 1
          return (
            <li key={spot.id} className="relative pl-14">
              {/* 세로 선 */}
              {!isLast && (
                <span
                  className="absolute left-[22px] top-11 bottom-0 w-0.5 bg-border"
                  aria-hidden
                />
              )}
              {/* 시각 + 아이콘 */}
              <span className="absolute left-0 top-1 flex size-11 items-center justify-center rounded-full border-2 border-primary bg-card text-primary">
                <Icon className="size-5" />
              </span>

              <div className="pb-6">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-display text-sm text-primary">{spot.arrival}</span>
                  <Badge variant="secondary" className="text-[11px]">
                    {spot.category}
                  </Badge>
                </div>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium leading-snug">{spot.name}</h3>
                    {spot.rating && (
                      <span className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
                        <Star className="size-3.5 fill-chart-3 text-chart-3" />
                        {spot.rating}
                      </span>
                    )}
                  </div>
                  {spot.hours && (
                    <p className="mt-1.5 text-xs text-muted-foreground">영업 · {spot.hours}</p>
                  )}
                  {spot.memo && (
                    <p className="mt-1 text-xs text-muted-foreground">메모 · {spot.memo}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      소요 {formatMinutes(spot.stayMinutes)}
                    </span>
                    {!isLast && (
                      <span className="flex items-center gap-1">
                        <Route className="size-3.5" />
                        다음까지 {formatMinutes(spot.travelMinutes)}
                      </span>
                    )}
                  </div>
                </Card>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
