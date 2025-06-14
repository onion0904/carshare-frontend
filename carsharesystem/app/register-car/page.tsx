"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { graphqlClient } from "@/lib/graphql-client"
import { gql } from "graphql-request"

export default function RegisterCarPage() {
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    location: "",
    pricePerDay: 5000,
    description: "",
    imageUrl: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" || name === "pricePerDay" ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push("/login")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const mutation = gql`
        mutation RegisterCar($input: CreateCarInput!) {
          createCar(input: $input) {
            id
            name
            model
          }
        }
      `

      const variables = {
        input: formData,
      }

      await graphqlClient.request(mutation, variables)
      setSuccess(true)

      // Reset form
      setFormData({
        name: "",
        model: "",
        year: new Date().getFullYear(),
        licensePlate: "",
        location: "",
        pricePerDay: 5000,
        description: "",
        imageUrl: "",
      })
    } catch (err: any) {
      console.error("Car registration failed:", err)
      setError(err.message || "車の登録に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>車を登録するには、まずログインしてください。</CardDescription>
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
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>車を登録する</CardTitle>
          <CardDescription>あなたの車を共有して、収入を得ましょう。</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>車の登録が完了しました。</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">車名</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">モデル</Label>
                <Input id="model" name="model" value={formData.model} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">年式</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePlate">ナンバープレート</Label>
                <Input
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">場所</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="例: 東京都渋谷区"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerDay">1日あたりの料金 (円)</Label>
              <Input
                id="pricePerDay"
                name="pricePerDay"
                type="number"
                min="1000"
                step="100"
                value={formData.pricePerDay}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">画像URL (任意)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/car-image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明 (任意)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="車の特徴や状態などを記入してください"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登録中..." : "車を登録する"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
