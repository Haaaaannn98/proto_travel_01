"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Trip } from "@/lib/types"

interface Props {
  onAdd: (trip: Trip) => void
}

const COVER_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export function AddTripDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [country, setCountry] = useState("")
  const [destination, setDestination] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [budget, setBudget] = useState("")

  const valid = title.trim() && startDate && endDate && startDate <= endDate

  function reset() {
    setTitle("")
    setCountry("")
    setDestination("")
    setStartDate("")
    setEndDate("")
    setBudget("")
  }

  function buildDays(): Trip["days"] {
    const days: Trip["days"] = []
    const start = new Date(startDate + "T00:00:00")
    const end = new Date(endDate + "T00:00:00")
    let i = 0
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      i += 1
      const iso = d.toISOString().slice(0, 10)
      days.push({ id: `day-${Date.now()}-${i}`, date: iso, label: `${i}일차`, spots: [] })
    }
    return days
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    const id = `trip-${Date.now()}`
    onAdd({
      id,
      title: title.trim(),
      destination: destination.trim() || "미정",
      country: country.trim() || "",
      startDate,
      endDate,
      coverColor: COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)],
      budgetKRW: Number.parseInt(budget) * 10000 || 0,
      days: buildDays(),
      expenses: [],
    })
    reset()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger render={<Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" />}>
        <Plus className="size-4" />새 여행
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">새 여행 만들기</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trip-title">여행 이름</Label>
            <Input
              id="trip-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 오사카 먹킷리스트 여행"
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="country">나라</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="일본"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">도시</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="오사카"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start">시작일</Label>
              <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">종료일</Label>
              <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">예산 (만원)</Label>
            <Input
              id="budget"
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="90"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose render={<Button type="button" variant="ghost" />}>취소</DialogClose>
            <Button type="submit" disabled={!valid}>
              만들기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
