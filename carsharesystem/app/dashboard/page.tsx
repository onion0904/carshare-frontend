"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { graphqlClient } from "@/lib/graphql-client"
import { gql } from "graphql-request"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Car, Calendar, MapPin } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

type UserStats = {
  totalCars: number
  totalReservations: number
  upcomingReservations: number
}

type CarType = {
  id: string
  name: string
  model: string
  location: string
  pricePerDay: number
  available: boolean
  imageUrl: string
}

type ReservationType = {
  id: string
  startDate: string
  endDate: string
  totalPrice: number
  status: string
  car: {
    id: string
    name: string
    model: string
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [cars, setCars] = useState<CarType[]>([])
  const [reservations, setReservations] = useState<ReservationType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchDashboardData = async () => {
      try {
        const query = gql`
          query GetDashboardData {
            userStats {
              totalCars
              totalReservations
              upcomingReservations
            }
            myCars(limit: 3) {
              id
              name
              model
              location
              pricePerDay
              available
              imageUrl
            }
            myReservations(limit: 3) {
              id
              startDate
              endDate
              totalPrice
              status
              car {
                id
                name
                model
              }
            }
          }
        `

        const data = await graphqlClient.request(query)
        setStats(data.userStats)
        setCars(data.myCars || [])
        setReservations(data.myReservations || [])
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err)
        setError(err.message || "データの取得に失敗しました。")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, router])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>ダッシュボードを表示するには、まずログインしてください。</CardDescription>
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
      <h1 className="text-3xl font-bold mb-8">マイページ</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">登録した車</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalCars || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">予約総数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalReservations || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">今後の予約</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.upcomingReservations || 0}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">私の車</h2>
            <Link href="/register-car">
              <Button variant="outline" size="sm">
                車を登録する
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : cars.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">車が登録されていません</h3>
                <p className="text-muted-foreground mb-4">まだ車を登録していません。車を登録して収入を得ましょう。</p>
                <Button onClick={() => router.push("/register-car")}>車を登録する</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cars.map((car) => (
                <Card key={car.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {car.imageUrl ? (
                          <img
                            src={car.imageUrl || "/placeholder.svg"}
                            alt={`${car.name} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {car.name} {car.model}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{car.location}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium">¥{car.pricePerDay.toLocaleString()}/日</span>
                          <Link href={`/cars/${car.id}`}>
                            <Button variant="ghost" size="sm">
                              詳細
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {cars.length > 0 && (
                <div className="text-center mt-4">
                  <Link href="/my-cars">
                    <Button variant="link">すべての車を見る</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">最近の予約</h2>
            <Link href="/reservations">
              <Button variant="outline" size="sm">
                すべての予約
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : reservations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">予約がありません</h3>
                <p className="text-muted-foreground mb-4">まだ車の予約をしていません。</p>
                <Button onClick={() => router.push("/cars")}>車を探す</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-8 w-8 text-primary" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {reservation.car.name} {reservation.car.model}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          {new Date(reservation.startDate).toLocaleDateString()} -{" "}
                          {new Date(reservation.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                              reservation.status === "CONFIRMED"
                                ? "bg-green-100 text-green-800"
                                : reservation.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {reservation.status === "CONFIRMED"
                              ? "確認済み"
                              : reservation.status === "CANCELLED"
                                ? "キャンセル済み"
                                : "保留中"}
                          </span>
                          <Link href="/reservations">
                            <Button variant="ghost" size="sm">
                              詳細
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {reservations.length > 0 && (
                <div className="text-center mt-4">
                  <Link href="/reservations">
                    <Button variant="link">すべての予約を見る</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
