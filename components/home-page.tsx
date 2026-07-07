"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Trip } from "@/lib/types"
import { fetchTrips, deleteTrip } from "@/lib/supabase/queries"
import { TripList } from "./trip-list"

const APP_NAME = "여행 플래너"
const APP_TAGLINE = "하루를 알차게 채우는 여행 계획"

export function HomePage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTrips = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchTrips()
      setTrips(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "여행 목록을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTrips()
  }, [loadTrips])

  async function handleDeleteTrip(tripId: string) {
    try {
      await deleteTrip(tripId)
      setTrips((prev) => prev.filter((t) => t.id !== tripId))
    } catch (e) {
      alert(e instanceof Error ? e.message : "여행 삭제에 실패했습니다.")
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
        <h1 className="font-display text-2xl leading-none text-primary">{APP_NAME}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{APP_TAGLINE}</p>
      </header>

      <main className="flex-1 px-4 py-5">
        {loading && (
          <p className="py-24 text-center text-sm text-muted-foreground">불러오는 중…</p>
        )}
        {error && (
          <div className="space-y-3 py-12 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => {
                setLoading(true)
                loadTrips()
              }}
              className="text-sm font-medium text-primary underline"
            >
              다시 시도
            </button>
          </div>
        )}
        {!loading && !error && (
          <TripList
            trips={trips}
            onSelect={(id) => router.push(`/trip/${id}`)}
            onCreated={(id) => router.push(`/trip/${id}`)}
            onDeleteTrip={handleDeleteTrip}
          />
        )}
      </main>
    </div>
  )
}
