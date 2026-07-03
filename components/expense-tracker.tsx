"use client"

import { useMemo, useRef } from "react"
import { Trash2, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  CURRENCY_INFO,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_COLOR,
  type Expense,
  type Trip,
} from "@/lib/types"
import { formatCurrency, formatDateShort, formatKRW } from "@/lib/format"
import { expenseIcon } from "./category-icon"
import { AddExpenseDialog } from "./add-expense-dialog"
import { ExportMenu } from "./export-menu"

interface Props {
  trip: Trip
  onAddExpense: (expense: Omit<Expense, "id">) => void
  onDeleteExpense: (expenseId: string) => void
}

export function ExpenseTracker({ trip, onAddExpense, onDeleteExpense }: Props) {
  const captureRef = useRef<HTMLDivElement>(null)

  const total = useMemo(
    () => trip.expenses.reduce((sum, e) => sum + e.amountKRW, 0),
    [trip.expenses],
  )

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of trip.expenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amountKRW)
    }
    return EXPENSE_CATEGORIES.map((c) => ({
      category: c,
      amount: map.get(c) ?? 0,
    })).filter((c) => c.amount > 0)
  }, [trip.expenses])

  const byDate = useMemo(() => {
    const map = new Map<string, Expense[]>()
    for (const e of trip.expenses) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [trip.expenses])

  const budgetPct = trip.budgetKRW > 0 ? Math.min(100, Math.round((total / trip.budgetKRW) * 100)) : 0
  const remaining = trip.budgetKRW - total
  const tripDates = trip.days.map((d) => d.date)
  const defaultCurrency = trip.expenses[0]?.currency ?? "KRW"

  return (
    <div className="space-y-5 pb-28">
      {/* 내보내기 / 공유 */}
      <div className="flex justify-end">
        <ExportMenu trip={trip} captureRef={captureRef} />
      </div>

      {/* 이미지 캡처 대상: 예산 + 카테고리 요약 */}
      <div ref={captureRef} className="space-y-5">
        {/* 예산 요약 */}
        <Card className="overflow-hidden border-none bg-primary p-6 text-primary-foreground shadow-md">
          <p className="text-sm font-medium opacity-90">{trip.title} · 총 지출</p>
          <p className="mt-1 font-display text-4xl tracking-tight">{formatKRW(total)}</p>
          <div className="mt-4 space-y-2">
            <Progress
              value={budgetPct}
              className="h-2.5 bg-primary-foreground/25 [&>*]:bg-primary-foreground"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-90">예산 {formatKRW(trip.budgetKRW)}</span>
              <span className="font-semibold">
                {remaining >= 0 ? `${formatKRW(remaining)} 남음` : `${formatKRW(-remaining)} 초과`}
              </span>
            </div>
          </div>
        </Card>

        {/* 카테고리별 지출 */}
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <h2 className="font-display text-lg">카테고리별 지출</h2>
          </div>

          {/* 비율 바 */}
          {total > 0 && (
            <div className="mb-4 flex h-3 w-full overflow-hidden rounded-full bg-muted">
              {byCategory.map((c) => (
                <div
                  key={c.category}
                  style={{
                    width: `${(c.amount / total) * 100}%`,
                    backgroundColor: EXPENSE_CATEGORY_COLOR[c.category],
                  }}
                />
              ))}
            </div>
          )}

          <ul className="space-y-3">
            {byCategory.map((c) => {
              const Icon = expenseIcon[c.category]
              const pct = total > 0 ? Math.round((c.amount / total) * 100) : 0
              return (
                <li key={c.category} className="flex items-center gap-3">
                  <span
                    className="flex size-9 items-center justify-center rounded-full text-primary-foreground"
                    style={{ backgroundColor: EXPENSE_CATEGORY_COLOR[c.category] }}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{c.category}</span>
                      <span className="text-sm font-semibold">{formatKRW(c.amount)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                </li>
              )
            })}
            {byCategory.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                아직 입력된 지출이 없어요
              </li>
            )}
          </ul>
        </Card>
      </div>

      {/* 날짜별 내역 */}
      <div className="space-y-4">
        {byDate.map(([date, expenses]) => {
          const dayTotal = expenses.reduce((s, e) => s + e.amountKRW, 0)
          return (
            <div key={date}>
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-muted-foreground">
                  {formatDateShort(date)}
                </h3>
                <span className="text-sm font-semibold text-muted-foreground">
                  {formatKRW(dayTotal)}
                </span>
              </div>
              <Card className="divide-y divide-border p-0">
                {expenses.map((e) => {
                  const Icon = expenseIcon[e.category]
                  return (
                    <div key={e.id} className="group flex items-center gap-3 px-4 py-3">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-primary-foreground"
                        style={{ backgroundColor: EXPENSE_CATEGORY_COLOR[e.category] }}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{e.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.category}
                          {e.memo ? ` · ${e.memo}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">{formatKRW(e.amountKRW)}</p>
                        {e.currency !== "KRW" && (
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(e.amount, e.currency)}{" "}
                            {CURRENCY_INFO[e.currency].label}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteExpense(e.id)}
                        aria-label={`${e.title} 삭제`}
                        className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )
                })}
              </Card>
            </div>
          )
        })}
      </div>

      {/* 지출 추가 버튼 (고정) */}
      <div className="fixed inset-x-0 bottom-20 z-30 mx-auto flex max-w-md justify-center px-4">
        <AddExpenseDialog
          dates={tripDates}
          defaultCurrency={defaultCurrency}
          onAdd={onAddExpense}
        />
      </div>
    </div>
  )
}
