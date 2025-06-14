"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { executeGraphQL } from "@/lib/graphql-client"
import { gql } from "graphql-request"
import { CalendarView } from "@/components/calendar-view"
import { CreateEventDialog } from "@/components/create-event-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks } from "date-fns"
import { ja } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { USE_MOCK_DATA } from "@/lib/config"

type Group = {
  id: string
  name: string
}

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

export default function CalendarPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchGroups()
  }, [user, router])

  useEffect(() => {
    if (selectedGroupId) {
      fetchEvents()
    }
  }, [selectedGroupId, currentWeekStart])

  const fetchGroups = async () => {
    try {
      setError(null)
      setLoading(true)

      console.log("📅 Calendar: Fetching groups for user:", user?.id)

      const query = gql`
        query GetMyGroups {
          myGroups {
            id
            name
          }
        }
      `

      console.log("📅 Calendar: Executing GraphQL query:", query)

      const data = await executeGraphQL<{ myGroups: Group[] }>(query)
      console.log("📅 Calendar: Received groups data:", data)

      const groupsData = data.myGroups || []
      setGroups(groupsData)

      // 最初のグループを自動選択
      if (groupsData.length > 0 && !selectedGroupId) {
        setSelectedGroupId(groupsData[0].id)
        console.log("📅 Calendar: Auto-selected first group:", groupsData[0].id)
      }
    } catch (err: any) {
      console.error("📅 Calendar: Failed to fetch groups:", err)
      setError(err.message || "グループの取得に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    if (!selectedGroupId) {
      console.log("📅 Calendar: No group selected, skipping events fetch")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })

      console.log("📅 Calendar: Fetching events for group:", selectedGroupId)

      const query = gql`
        query GetGroupEvents($input: GroupEventsInput!) {
          groupEvents(input: $input) {
            id
            title
            startTime
            endTime
            isImportant
            isCommute
            note
            userId
            userName
            userAvatarId
          }
        }
      `

      const variables = {
        input: {
          groupId: selectedGroupId,
          startDate: format(currentWeekStart, "yyyy-MM-dd"),
          endDate: format(weekEnd, "yyyy-MM-dd"),
        },
      }

      console.log("📅 Calendar: Events query variables:", variables)

      const data = await executeGraphQL<{ groupEvents: Event[] }>(query, variables)
      console.log("📅 Calendar: Received events data:", data)

      setEvents(data.groupEvents || [])
    } catch (err: any) {
      console.error("📅 Calendar: Failed to fetch events:", err)
      setError(err.message || "予約の取得に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  const handleEventCreated = () => {
    console.log("📅 Calendar: Event created, refreshing events")
    fetchEvents()
  }

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1))
  }

  const handleCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>カレンダーを表示するには、まずログインしてください。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")}>ログインする</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  const weekRangeText = `${format(currentWeekStart, "yyyy年MM月dd日", { locale: ja })} - ${format(
    weekEnd,
    "yyyy年MM月dd日",
    { locale: ja },
  )}`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">カレンダー</h1>

        <div className="flex items-center space-x-2">
          {groups.length > 0 && (
            <Select value={selectedGroupId || ""} onValueChange={setSelectedGroupId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="グループを選択" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedGroupId && <CreateEventDialog groupId={selectedGroupId} onEventCreated={handleEventCreated} />}
        </div>
      </div>

      {USE_MOCK_DATA && (
        <Alert className="mb-6">
          <AlertDescription>
            <strong>モックデータモード:</strong> テスト用データで動作しています
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {groups.length === 0 && !loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">グループがありません</h3>
            <p className="text-muted-foreground mb-4">
              カレンダーを使用するには、まずグループを作成または参加してください。
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.push("/group")}>グループページへ</Button>
              <Button variant="outline" onClick={fetchGroups}>
                再読み込み
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{weekRangeText}</span>
                  <Button variant="ghost" size="sm" onClick={handleCurrentWeek}>
                    今週
                  </Button>
                </div>
                <Button variant="outline" size="icon" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <CalendarView weekStart={currentWeekStart} events={events} loading={loading} onRefresh={fetchEvents} />
        </>
      )}

      {USE_MOCK_DATA && (
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-medium mb-2">🐛 デバッグ情報</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(
              {
                groupsCount: groups.length,
                selectedGroupId,
                eventsCount: events.length,
                loading,
                error,
                userId: user?.id,
                userName: user ? `${user.lastName} ${user.firstName}` : null,
              },
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  )
}
