"use client"

import { useState } from "react"
import { MapPin, Route } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Trip } from "@/lib/types"
import { formatDateShort, formatMinutes } from "@/lib/format"
import { spotIcon } from "./category-icon"

export function MapView({ trip }: { trip: Trip }) {
  const [activeDay, setActiveDay] = useState(trip.days[0]?.id)
  const day = trip.days.find((d) => d.id === activeDay) ?? trip.days[0]

  // 마커를 지도 위에 흩어놓기 위한 목업 좌표 (실제 API 연동 시 Place 좌표로 대체)
  const positions = [
    { top: "22%", left: "18%" },
    { top: "35%", left: "58%" },
    { top: "58%", left: "30%" },
    { top: "48%", left: "74%" },
    { top: "72%", left: "55%" },
    { top: "30%", left: "40%" },
  ]

  return (
    <div className="space-y-4 pb-24">
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

      {/* 지도 (목업) */}
      <Card className="relative aspect-[4/5] overflow-hidden p-0">
        <img
          src="/map-placeholder.png"
          alt="여행 경로 지도"
          className="absolute inset-0 size-full object-cover opacity-90"
        />
        {day.spots.map((spot, i) => {
          const pos = positions[i % positions.length]
          return (
            <div
              key={spot.id}
              className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
              style={{ top: pos.top, left: pos.left }}
            >
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary font-display text-sm text-primary-foreground shadow-md">
                {i + 1}
              </span>
              <span className="mt-1 max-w-24 truncate rounded-full bg-card/90 px-2 py-0.5 text-[11px] font-medium shadow-sm">
                {spot.name}
              </span>
            </div>
          )
        })}

        <div className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
          <MapPin className="mr-1 inline size-3.5 text-primary" />
          Google Maps 연동 예정 · 현재는 미리보기
        </div>
      </Card>

      {/* 경로 리스트 */}
      <Card className="p-4">
        <h3 className="mb-3 font-display text-base">이동 경로</h3>
        <ol className="space-y-1">
          {day.spots.map((spot, i) => {
            const Icon = spotIcon[spot.category] ?? MapPin
            const isLast = i === day.spots.length - 1
            return (
              <li key={spot.id}>
                <div className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="flex-1 truncate text-sm font-medium">{spot.name}</span>
                  <Badge variant="secondary" className="text-[11px]">
                    {spot.category}
                  </Badge>
                </div>
                {!isLast && (
                  <div className="flex items-center gap-1 py-1 pl-3 text-xs text-muted-foreground">
                    <Route className="size-3.5" />
                    {formatMinutes(spot.travelMinutes)} 이동
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </Card>
    </div>
  )
}
