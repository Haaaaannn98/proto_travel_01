"use client"

import { useEffect, useState } from "react"
import { Pencil, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Spot, SpotCategory } from "@/lib/types"
import { cn } from "@/lib/utils"
import { spotIcon } from "./category-icon"
import type { SpotInput } from "@/lib/supabase/queries"

const SPOT_CATEGORIES: SpotCategory[] = ["관광지", "맛집", "카페", "숙소", "교통", "쇼핑"]

interface Props {
  /** 있으면 수정 모드, 없으면 추가 모드 */
  spot?: Spot
  onSave: (input: SpotInput) => void | Promise<void>
  onDelete?: () => void | Promise<void>
}

function emptyForm(): SpotInput {
  return {
    name: "",
    category: "관광지",
    stayMinutes: 60,
    travelMinutes: 15,
    arrival: "09:00",
    hours: "",
    rating: undefined,
    address: "",
    memo: "",
  }
}

function spotToForm(spot: Spot): SpotInput {
  return {
    name: spot.name,
    category: spot.category,
    stayMinutes: spot.stayMinutes,
    travelMinutes: spot.travelMinutes,
    arrival: spot.arrival,
    hours: spot.hours ?? "",
    rating: spot.rating,
    address: spot.address ?? "",
    memo: spot.memo ?? "",
  }
}

export function AddSpotDialog({ spot, onSave, onDelete }: Props) {
  const isEdit = !!spot
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<SpotInput>(spot ? spotToForm(spot) : emptyForm())

  useEffect(() => {
    if (open) {
      setForm(spot ? spotToForm(spot) : emptyForm())
    }
  }, [open, spot])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    await onSave({
      ...form,
      name: form.name.trim(),
      hours: form.hours?.trim() || undefined,
      address: form.address?.trim() || undefined,
      memo: form.memo?.trim() || undefined,
      rating: form.rating || undefined,
    })
    setOpen(false)
  }

  async function handleDelete() {
    if (!onDelete) return
    if (!confirm("이 장소를 삭제할까요?")) return
    await onDelete()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon" className="size-8 shrink-0" />
          ) : (
            <Button size="lg" className="w-full gap-2 rounded-full shadow-lg" />
          )
        }
      >
        {isEdit ? <Pencil className="size-4" /> : <Plus className="size-5" />}
        {!isEdit && "장소 추가"}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "장소 수정" : "새 장소 추가"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>카테고리</Label>
            <div className="grid grid-cols-3 gap-2">
              {SPOT_CATEGORIES.map((c) => {
                const Icon = spotIcon[c]
                const active = c === form.category
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: c }))}
                    aria-pressed={active}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    <Icon className="size-5" />
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spot-name">장소 이름</Label>
            <Input
              id="spot-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="예: 도톤보리"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="arrival">도착 시각</Label>
              <Input
                id="arrival"
                type="time"
                value={form.arrival}
                onChange={(e) => setForm((f) => ({ ...f, arrival: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">평점 (선택)</Label>
              <Input
                id="rating"
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    rating: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                  }))
                }
                placeholder="4.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="stay">머문 시간 (분)</Label>
              <Input
                id="stay"
                type="number"
                min={0}
                value={form.stayMinutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stayMinutes: Number.parseInt(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="travel">다음까지 이동시간 (분)</Label>
              <Input
                id="travel"
                type="number"
                min={0}
                value={form.travelMinutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, travelMinutes: Number.parseInt(e.target.value) || 0 }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">영업시간 (선택)</Label>
            <Input
              id="hours"
              value={form.hours}
              onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
              placeholder="예: 10:00 - 20:00"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">주소 (선택)</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="지도 연동 전까지는 참고용"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spot-memo">메모 (선택)</Label>
            <Input
              id="spot-memo"
              value={form.memo}
              onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
              placeholder="예: 예약 필요"
              autoComplete="off"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            {isEdit && onDelete && (
              <Button type="button" variant="destructive" onClick={handleDelete} className="mr-auto">
                삭제
              </Button>
            )}
            <DialogClose render={<Button type="button" variant="ghost" />}>취소</DialogClose>
            <Button type="submit" disabled={!form.name.trim()}>
              {isEdit ? "저장" : "추가하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}