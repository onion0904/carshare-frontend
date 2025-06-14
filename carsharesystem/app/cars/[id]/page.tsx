"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { graphqlClient } from "@/lib/graphql-client"
import { gql } from "graphql-request"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { CalendarIcon, Car, MapPin, User, Clock, AlertCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type CarType = {
  id: string
  name: string
  model: string
  year: number
  licensePlate: string
  location: string
  pricePerDay: number
  available: boolean
  imageUrl: string
  owner: {
    id: string
    name: string
  }
}

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const [car, setCar] = useState<CarType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [reservationError, setReservationError] = useState<string | null>(null)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const query = gql`
          query GetCar($id: ID!) {
            car(id: $id) {
              id
              name
              model
              year
              licensePlate
              location
              pricePerDay
              available
              imageUrl
              owner {
                id
                name
              }
            }
          }
        `

        const variables = {
          id: params.id,
        }

        const data = await graphqlClient.request(query, variables)
        setCar(data.car)
      } catch (err: any) {
        console.error("Failed to fetch car:", err)
        setError("車の情報の取得に失敗しました。")
      } finally {
        setLoading(false)
      }
    }

    fetchCar()
  }, [params.id])

  const handleReservation = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!startDate || !endDate) {
      setReservationError("予約の開始日と終了日を選択してください。")
      return
    }

    try {
      const mutation = gql`
        mutation CreateReservation($input: CreateReservationInput!) {
          createReservation(input: $input) {
            id
            startDate
            endDate
            totalPrice
          }
        }
      `

      const variables = {
        input: {
          carId: params.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      }

      await graphqlClient.request(mutation, variables)
      setReservationSuccess(true)
      setReservationError(null)
    } catch (err: any) {
      console.error("Reservation failed:", err)
      setReservationError(err.message || "予約に失敗しました。")
    }
  }

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateTotalPrice = () => {
    if (!car) return 0
    const days = calculateTotalDays()
    return car.pricePerDay * days
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error || "車の情報が見つかりませんでした。"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-muted rounded-lg overflow-hidden h-[400px]">
            {car.imageUrl ? (
              <img
                src={car.imageUrl || "/placeholder.svg"}
                alt={`${car.name} ${car.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="h-24 w-24 text-muted-foreground/50" />
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-2">
              {car.name} {car.model}
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              {car.year}年式 • {car.licensePlate}
            </p>

            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>{car.location}</span>
              </div>

              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>オーナー: {car.owner.name}</span>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>1日あたり: ¥{car.pricePerDay.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">予約する</h3>

              {reservationSuccess ? (
                <Alert className="mb-4">
                  <AlertTitle>予約が完了しました</AlertTitle>
                  <AlertDescription>予約の詳細は予約状況ページでご確認いただけます。</AlertDescription>
                </Alert>
              ) : (
                <>
                  {reservationError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{reservationError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">開始日</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !startDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "PPP", { locale: ja }) : "日付を選択"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                              disabled={(date) => date < new Date() || (endDate ? date > endDate : false)}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">終了日</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !endDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "PPP", { locale: ja }) : "日付を選択"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                              disabled={(date) => date < new Date() || (startDate ? date < startDate : false)}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {startDate && endDate && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex justify-between">
                          <span>日数</span>
                          <span>{calculateTotalDays()}日</span>
                        </div>
                        <div className="flex justify-between">
                          <span>1日あたりの料金</span>
                          <span>¥{car.pricePerDay.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold">
                          <span>合計</span>
                          <span>¥{calculateTotalPrice().toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleReservation}
                      disabled={!startDate || !endDate || !car.available}
                    >
                      {!car.available ? "現在利用できません" : "予約する"}
                    </Button>

                    {!user && (
                      <p className="text-sm text-muted-foreground text-center">
                        予約するには、まず
                        <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/login")}>
                          ログイン
                        </Button>
                        してください。
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
