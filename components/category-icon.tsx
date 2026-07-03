import {
  BedDouble,
  Bus,
  Camera,
  Coffee,
  MapPin,
  ShoppingBag,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import type { ExpenseCategory, SpotCategory } from "@/lib/types"

export const expenseIcon: Record<ExpenseCategory, LucideIcon> = {
  숙박: BedDouble,
  식비: Utensils,
  교통: Bus,
  관광: Camera,
  쇼핑: ShoppingBag,
  기타: Wallet,
}

export const spotIcon: Record<SpotCategory, LucideIcon> = {
  관광지: Camera,
  맛집: Utensils,
  카페: Coffee,
  숙소: BedDouble,
  교통: Bus,
  쇼핑: ShoppingBag,
}

export function SpotMarker({ category }: { category: SpotCategory }) {
  const Icon = spotIcon[category] ?? MapPin
  return <Icon className="size-4" aria-hidden />
}
