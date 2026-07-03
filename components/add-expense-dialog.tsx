"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
import {
  CURRENCY_INFO,
  EXPENSE_CATEGORIES,
  type Currency,
  type Expense,
  type ExpenseCategory,
} from "@/lib/types"
import { formatKRW } from "@/lib/format"
import { cn } from "@/lib/utils"
import { expenseIcon } from "./category-icon"

interface Props {
  dates: string[]
  defaultCurrency: Currency
  onAdd: (expense: Omit<Expense, "id">) => void
}

export function AddExpenseDialog({ dates, defaultCurrency, onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<ExpenseCategory>("식비")
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<Currency>(defaultCurrency)
  const [date, setDate] = useState(dates[0])
  const [memo, setMemo] = useState("")

  const amountNum = Number.parseFloat(amount) || 0
  const krw = amountNum * CURRENCY_INFO[currency].toKRW

  function reset() {
    setCategory("식비")
    setTitle("")
    setAmount("")
    setCurrency(defaultCurrency)
    setDate(dates[0])
    setMemo("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || amountNum <= 0) return
    onAdd({
      date,
      category,
      title: title.trim(),
      amount: amountNum,
      currency,
      amountKRW: Math.round(krw),
      memo: memo.trim() || undefined,
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
      <DialogTrigger render={<Button size="lg" className="gap-2 rounded-full shadow-lg" />}>
        <Plus className="size-5" />
        지출 추가
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">지출 직접 입력</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>카테고리</Label>
            <div className="grid grid-cols-3 gap-2">
              {EXPENSE_CATEGORIES.map((c) => {
                const Icon = expenseIcon[c]
                const active = c === category
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
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
            <Label htmlFor="title">내용</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 이치란 라멘"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">금액</Label>
              <Input
                id="amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>통화</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CURRENCY_INFO) as Currency[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      {CURRENCY_INFO[c].symbol} {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {currency !== "KRW" && amountNum > 0 && (
            <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              원화 환산 약{" "}
              <span className="font-bold text-foreground">{formatKRW(krw)}</span>
            </p>
          )}

          <div className="space-y-2">
            <Label>결제 날짜</Label>
            <Select value={date} onValueChange={setDate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dates.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">메모 (선택)</Label>
            <Input
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="현금 결제 등"
              autoComplete="off"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose render={<Button type="button" variant="ghost" />}>
              취소
            </DialogClose>
            <Button type="submit" disabled={!title.trim() || amountNum <= 0}>
              추가하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
