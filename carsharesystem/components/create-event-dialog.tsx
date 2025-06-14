"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { graphqlClient } from "@/lib/graphql-client"
import { gql } from "graphql-request"
import { Plus } from "lucide-react"
import { format } from "date-fns"

interface CreateEventDialogProps {
  groupId: string
  onEventCreated: () => void
}

export function CreateEventDialog({ groupId, onEventCreated }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [isImportant, setIsImportant] = useState(false)
  const [isCommute, setIsCommute] = useState(false)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setTitle("")
    setDate(format(new Date(), "yyyy-MM-dd"))
    setStartTime("09:00")
    setEndTime("10:00")
    setIsImportant(false)
    setIsCommute(false)
    setNote("")
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const startDateTime = `${date}T${startTime}:00`
      const endDateTime = `${date}T${endTime}:00`

      const mutation = gql`
        mutation CreateEvent($input: CreateEventInput!) {
          createEvent(input: $input) {
            id
            title
          }
        }
      `

      const variables = {
        input: {
          groupId,
          title,
          startTime: startDateTime,
          endTime: endDateTime,
          isImportant,
          isCommute,
          note,
        },
      }

      await graphqlClient.request(mutation, variables)
      setOpen(false)
      resetForm()
      onEventCreated()
    } catch (err: any) {
      console.error("Event creation failed:", err)
      setError(err.message || "予約の作成に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          予約作成
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>予約を作成</DialogTitle>
            <DialogDescription>車の利用予約を作成します。重要な用事は優先されます。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="title">タイトル</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="date">日付</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="start-time">開始時間</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="end-time">終了時間</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="important"
                checked={isImportant}
                onCheckedChange={(checked) => setIsImportant(checked === true)}
              />
              <Label htmlFor="important" className="cursor-pointer">
                重要な用事
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="commute"
                checked={isCommute}
                onCheckedChange={(checked) => setIsCommute(checked === true)}
              />
              <Label htmlFor="commute" className="cursor-pointer">
                通学で使用
              </Label>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="note">メモ</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="任意のメモを入力してください"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "作成中..." : "予約を作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
