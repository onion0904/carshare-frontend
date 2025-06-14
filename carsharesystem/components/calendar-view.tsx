"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { format, addDays, isSameDay } from "date-fns"
import { ja } from "date-fns/locale"
import { School } from "lucide-react"
import { EventDetailsDialog } from "@/components/event-details-dialog"

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

interface CalendarViewProps {
  weekStart: Date
  events: Event[]
  loading: boolean
  onRefresh: () => void
}

export function CalendarView({ weekStart, events, loading, onRefresh }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.startTime), date))
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
  }

  const handleEventUpdated = () => {
    onRefresh()
    setSelectedEvent(null)
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Day headers */}
      {days.map((day, index) => (
        <div key={`header-${index}`} className="p-2 text-center font-medium border-b">
          <div className="text-sm">{format(day, "EEE", { locale: ja })}</div>
          <div className="text-lg">{format(day, "d", { locale: ja })}</div>
        </div>
      ))}

      {/* Calendar cells */}
      {days.map((day, dayIndex) => (
        <div key={`cell-${dayIndex}`} className="min-h-[150px] border rounded-md p-2 bg-background">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              {getEventsForDay(day).map((event) => (
                <Card
                  key={event.id}
                  className={`cursor-pointer hover:bg-muted/50 ${event.isImportant ? "border-primary" : ""}`}
                  onClick={() => handleEventClick(event)}
                >
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-1">
                          <AvatarImage src={`/avatars/avatar-${event.userAvatarId}.png`} alt={event.userName} />
                          <AvatarFallback>{event.userName.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium truncate max-w-[80px]">{event.userName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {event.isImportant && (
                          <Badge variant="default" className="text-[0.6rem] px-1 py-0">
                            重要
                          </Badge>
                        )}
                        {event.isCommute && <School className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </div>
                    <div className="text-xs truncate">{event.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(event.startTime), "HH:mm", { locale: ja })} -
                      {format(new Date(event.endTime), "HH:mm", { locale: ja })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}

      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={() => setSelectedEvent(null)}
          onEventUpdated={handleEventUpdated}
        />
      )}
    </div>
  )
}
