"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { graphqlClient } from "@/lib/graphql-client"
import { gql } from "graphql-request"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle, Calendar, School } from "lucide-react"

type Event = {
  id: string
  title: string
  startTime: string
  endTime: string
  isImportant: boolean
  isCommute: boolean
  note: string
  userId: string
  userName: string
  userAvatarId: number
}

interface EventDetailsDialogProps {
  event: Event
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventUpdated: () => void
}

export function EventDetailsDialog({ event, open, onOpenChange, onEventUpdated }: EventDetailsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const handleDeleteEvent = async () => {
    if (!user || user.id !== event.userId) return

    setLoading(true)
    setError(null)

    try {
      const mutation = gql`
        mutation DeleteEvent($id: ID!) {
          deleteEvent(id: $id)
        }
      `

      const variables = {
        id: event.id,
      }

      await graphqlClient.request(mutation, variables)
      onOpenChange(false)
      onEventUpdated()
    } catch (err: any) {
      console.error("Event deletion failed:", err)
      setError(err.message || "予約の削除に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return format(date, "yyyy年MM月dd日 HH:mm", { locale: ja })
  }

  const isOwner = user && user.id === event.userId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>予約の詳細情報</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center mb-4">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={`/avatars/avatar-${event.userAvatarId}.png`} alt={event.userName} />
              <AvatarFallback>{event.userName.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{event.userName}</div>
              <div className="text-sm text-muted-foreground">予約者</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">日時</div>
                <div className="text-sm text-muted-foreground">
                  {formatDateTime(event.startTime)} - {format(new Date(event.endTime), "HH:mm", { locale: ja })}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {event.isImportant && <Badge>重要な用事</Badge>}
              {event.isCommute && (
                <Badge variant="outline" className="flex items-center">
                  <School className="h-3 w-3 mr-1" />
                  通学
                </Badge>
              )}
            </div>

            {event.note && (
              <div className="mt-4">
                <div className="font-medium mb-1">メモ</div>
                <div className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{event.note}</div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          {isOwner && (
            <Button variant="destructive" onClick={handleDeleteEvent} disabled={loading}>
              {loading ? "削除中..." : "予約を削除"}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
