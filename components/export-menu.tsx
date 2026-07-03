"use client"

import { useState } from "react"
import { Check, FileJson, FileSpreadsheet, ImageDown, Link2, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Trip } from "@/lib/types"
import {
  buildShareText,
  exportExpensesCSV,
  exportNodeAsImage,
  exportTripJSON,
} from "@/lib/export"

interface Props {
  trip: Trip
  /** 이미지로 캡처할 대상 노드 */
  captureRef: React.RefObject<HTMLDivElement | null>
}

export function ExportMenu({ trip, captureRef }: Props) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleShare() {
    const text = buildShareText(trip)
    const shareData = {
      title: trip.title,
      text,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // 사용자가 취소하면 링크 복사로 폴백
      }
    }
    await handleCopyLink()
  }

  async function handleCopyLink() {
    const text = `${buildShareText(trip)}\n${typeof window !== "undefined" ? window.location.href : ""}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // noop
    }
  }

  async function handleImage() {
    if (!captureRef.current) return
    setBusy(true)
    try {
      await exportNodeAsImage(captureRef.current, trip)
    } finally {
      setBusy(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="secondary" size="sm" className="gap-1.5" disabled={busy} />
        }
      >
        <Share2 className="size-4" />
        내보내기
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>파일로 저장</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => exportTripJSON(trip)}>
          <FileJson className="size-4" />
          여행 전체 (JSON)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportExpensesCSV(trip)}>
          <FileSpreadsheet className="size-4" />
          가계부 (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleImage}>
          <ImageDown className="size-4" />
          가계부 이미지 (PNG)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>공유</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="size-4" />
          공유하기
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
          {copied ? "복사됨!" : "링크 복사"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
