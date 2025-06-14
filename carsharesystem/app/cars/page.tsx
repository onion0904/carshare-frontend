"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { graphqlClient } from "@/lib/graphql-client"
import { gql } from "graphql-request"
import Link from "next/link"
import { Car, MapPin, Calendar, Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

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

export default function CarsPage() {
  const [cars, setCars] = useState<CarType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("priceAsc")
  const [filterAvailable, setFilterAvailable] = useState(true)

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const query = gql`
          query GetCars($filter: CarFilter) {
            cars(filter: $filter) {
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

        const variables = {
          filter: {
            available: filterAvailable,
          },
        }

        const data = await graphqlClient.request(query, variables)
        let filteredCars = data.cars || []

        // Client-side filtering by search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          filteredCars = filteredCars.filter(
            (car: CarType) =>
              car.name.toLowerCase().includes(term) ||
              car.model.toLowerCase().includes(term) ||
              car.location.toLowerCase().includes(term),
          )
        }

        // Client-side sorting
        filteredCars.sort((a: CarType, b: CarType) => {
          switch (sortBy) {
            case "priceAsc":
              return a.pricePerDay - b.pricePerDay
            case "priceDesc":
              return b.pricePerDay - a.pricePerDay
            case "newest":
              return b.year - a.year
            case "oldest":
              return a.year - b.year
            default:
              return 0
          }
        })

        setCars(filteredCars)
      } catch (err: any) {
        console.error("Failed to fetch cars:", err)
        setError("車の情報の取得に失敗しました。")
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [searchTerm, sortBy, filterAvailable])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The search is already handled by the useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">利用可能な車を探す</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="車名、モデル、場所で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        <div className="flex gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priceAsc">料金: 安い順</SelectItem>
              <SelectItem value="priceDesc">料金: 高い順</SelectItem>
              <SelectItem value="newest">年式: 新しい順</SelectItem>
              <SelectItem value="oldest">年式: 古い順</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                フィルター
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>フィルター</SheetTitle>
                <SheetDescription>条件を指定して車を絞り込みます</SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="available">利用可能な車のみ表示</Label>
                  <Select
                    value={filterAvailable ? "true" : "false"}
                    onValueChange={(value) => setFilterAvailable(value === "true")}
                  >
                    <SelectTrigger id="available">
                      <SelectValue placeholder="利用可能な車のみ表示" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">はい</SelectItem>
                      <SelectItem value="false">すべて表示</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional filters can be added here */}

                <Button className="w-full mt-4">適用する</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array(8)
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
          ) : cars.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Car className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">車が見つかりませんでした</h3>
              <p className="text-muted-foreground">検索条件を変更してお試しください。</p>
            </div>
          ) : (
            cars.map((car) => (
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
                  {!car.available && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-md font-medium">
                        利用不可
                      </span>
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
                    <Button className="w-full" disabled={!car.available}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {car.available ? "予約する" : "利用不可"}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
