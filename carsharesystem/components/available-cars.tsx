"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { graphqlClient } from "@/lib/graphql-client"
import { gql } from "graphql-request"
import Link from "next/link"
import { Car, MapPin, Calendar } from "lucide-react"

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
}

export function AvailableCars() {
  const [cars, setCars] = useState<CarType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const query = gql`
          query GetAvailableCars {
            cars(filter: { available: true }, limit: 4) {
              id
              name
              model
              year
              licensePlate
              location
              pricePerDay
              available
              imageUrl
            }
          }
        `

        const data = await graphqlClient.request(query)
        setCars(data.cars || [])
      } catch (err: any) {
        console.error("Failed to fetch cars:", err)
        setError("車の情報の取得に失敗しました。")
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [])

  if (error) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">利用可能な車</h2>
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">利用可能な車</h2>
          <Link href="/cars">
            <Button variant="outline">すべて見る</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array(4)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))
            : cars.map((car) => (
                <Card key={car.id} className="overflow-hidden">
                  <div className="h-48 bg-muted relative">
                    {car.imageUrl ? (
                      <img
                        src={car.imageUrl || "/placeholder.svg"}
                        alt={`${car.name} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
                      ¥{car.pricePerDay.toLocaleString()}/日
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-1">
                      {car.name} {car.model}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {car.year}年式 • {car.licensePlate}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{car.location}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Link href={`/cars/${car.id}`} className="w-full">
                      <Button className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        予約する
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
        </div>
      </div>
    </div>
  )
}
