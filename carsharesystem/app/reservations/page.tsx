"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { graphqlClient } from "@/lib/graphql-client"
import { gql } from "graphql-request"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { AlertCircle, Calendar, Car, MapPin } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Reservation = {
  id: string
  startDate: string
  endDate: string
  totalPrice: number
  status: string
  car: {
    id: string
    name: string
    model: string
    location: string
    imageUrl: string
  }
  user: {
    id: string
    name: string
    email: string
  }
}

export default function ReservationsPage() {
  const [myReservations, setMyReservations] = useState<Reservation[]>([])
  const [carReservations, setCarReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelReservationId, setCancelReservationId] = useState<string | null>(null)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchReservations = async () => {
      try {
        const query = gql`
          query GetReservations {
            myReservations {
              id
              startDate
              endDate
              totalPrice
              status
              car {
                id
                name
                model
                location
                imageUrl
              }
            }
            carReservations {
              id
              startDate
              endDate
              totalPrice
              status
              car {
                id
                name
                model
                location
                imageUrl
              }
              user {
                id
                name
                email
              }
            }
          }
        `

        const data = await graphqlClient.request(query)
        setMyReservations(data.myReservations || [])
        setCarReservations(data.carReservations || [])
      } catch (err: any) {
        console.error("Failed to fetch reservations:", err)
        setError(err.message || "予約情報の取得に失敗しました。")
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [user, router, cancelSuccess])

  const handleCancelReservation = async () => {
    if (!cancelReservationId) return

    try {
      const mutation = gql`
        mutation CancelReservation($id: ID!) {
          cancelReservation(id: $id) {
            id
            status
          }
        }
      `

      const variables = {
        id: cancelReservationId,
      }

      await graphqlClient.request(mutation, variables)
      setCancelSuccess(true)
      setCancelReservationId(null)
    } catch (err: any) {
      console.error("Failed to cancel reservation:", err)
      setError(err.message || "予約のキャンセルに失敗しました。")
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>予約状況を確認するには、まずログインしてください。</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/login")}>ログインする</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">予約状況</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {cancelSuccess && (
        <Alert className="mb-6">
          <AlertTitle>予約をキャンセルしました</AlertTitle>
          <AlertDescription>予約のキャンセルが完了しました。</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="my-reservations">
        <TabsList className="mb-6">
          <TabsTrigger value="my-reservations">私の予約</TabsTrigger>
          <TabsTrigger value="car-reservations">私の車の予約</TabsTrigger>
        </TabsList>

        <TabsContent value="my-reservations">
          {loading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <Skeleton className="h-32 w-32 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : myReservations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">予約がありません</h3>
                <p className="text-muted-foreground mb-4">まだ車の予約をしていません。</p>
                <Button onClick={() => router.push("/cars")}>車を探す</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myReservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="h-32 w-32 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {reservation.car.imageUrl ? (
                          <img
                            src={reservation.car.imageUrl || "/placeholder.svg"}
                            alt={`${reservation.car.name} ${reservation.car.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          {reservation.car.name} {reservation.car.model}
                        </h3>

                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{reservation.car.location}</span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                          <div className="text-sm">
                            <span className="font-medium">期間:</span>{" "}
                            {format(new Date(reservation.startDate), "yyyy/MM/dd", { locale: ja })} -{" "}
                            {format(new Date(reservation.endDate), "yyyy/MM/dd", { locale: ja })}
                          </div>

                          <div className="text-sm">
                            <span className="font-medium">料金:</span> ¥{reservation.totalPrice.toLocaleString()}
                          </div>

                          <div className="text-sm">
                            <span className="font-medium">ステータス:</span>{" "}
                            <span
                              className={`font-medium ${
                                reservation.status === "CONFIRMED"
                                  ? "text-green-600"
                                  : reservation.status === "CANCELLED"
                                    ? "text-red-600"
                                    : "text-yellow-600"
                              }`}
                            >
                              {reservation.status === "CONFIRMED"
                                ? "確認済み"
                                : reservation.status === "CANCELLED"
                                  ? "キャンセル済み"
                                  : "保留中"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/cars/${reservation.car.id}`)}
                          >
                            詳細を見る
                          </Button>

                          {reservation.status !== "CANCELLED" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setCancelReservationId(reservation.id)}
                                >
                                  キャンセル
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>予約をキャンセルしますか？</DialogTitle>
                                  <DialogDescription>
                                    この操作は取り消せません。本当に予約をキャンセルしますか？
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setCancelReservationId(null)}>
                                    戻る
                                  </Button>
                                  <Button variant="destructive" onClick={handleCancelReservation}>
                                    キャンセルする
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="car-reservations">
          {loading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <Skeleton className="h-32 w-32 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : carReservations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">予約がありません</h3>
                <p className="text-muted-foreground mb-4">あなたの車にはまだ予約がありません。</p>
                <Button onClick={() => router.push("/register-car")}>車を登録する</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {carReservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="h-32 w-32 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {reservation.car.imageUrl ? (
                          <img
                            src={reservation.car.imageUrl || "/placeholder.svg"}
                            alt={`${reservation.car.name} ${reservation.car.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          {reservation.car.name} {reservation.car.model}
                        </h3>

                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{reservation.car.location}</span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
                          <div className="text-sm">
                            <span className="font-medium">期間:</span>{" "}
                            {format(new Date(reservation.startDate), "yyyy/MM/dd", { locale: ja })} -{" "}
                            {format(new Date(reservation.endDate), "yyyy/MM/dd", { locale: ja })}
                          </div>

                          <div className="text-sm">
                            <span className="font-medium">料金:</span> ¥{reservation.totalPrice.toLocaleString()}
                          </div>

                          <div className="text-sm">
                            <span className="font-medium">ステータス:</span>{" "}
                            <span
                              className={`font-medium ${
                                reservation.status === "CONFIRMED"
                                  ? "text-green-600"
                                  : reservation.status === "CANCELLED"
                                    ? "text-red-600"
                                    : "text-yellow-600"
                              }`}
                            >
                              {reservation.status === "CONFIRMED"
                                ? "確認済み"
                                : reservation.status === "CANCELLED"
                                  ? "キャンセル済み"
                                  : "保留中"}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm mb-4">
                          <span className="font-medium">予約者:</span> {reservation.user.name} ({reservation.user.email}
                          )
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/cars/${reservation.car.id}`)}
                          >
                            車の詳細
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
