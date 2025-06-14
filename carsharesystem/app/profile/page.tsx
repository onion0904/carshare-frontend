"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { graphqlClient } from "@/lib/graphql-client"
import { gql } from "graphql-request"
import { AvatarSelector } from "@/components/avatar-selector"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// アバターのURLマッピング
const avatarUrls = {
  1: "https://example.com/avatar-1.png",
  2: "https://example.com/avatar-2.png",
  3: "https://example.com/avatar-3.png",
  4: "https://example.com/avatar-4.png",
  5: "https://example.com/avatar-5.png",
  6: "https://example.com/avatar-6.png",
}

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [avatarId, setAvatarId] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    setFirstName(user.firstName || "")
    setLastName(user.lastName || "")

    // アイコンURLからアバターIDを逆引き
    const avatarEntry = Object.entries(avatarUrls).find(([_, url]) => url === user.icon)
    setAvatarId(avatarEntry ? Number.parseInt(avatarEntry[0]) : 1)
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const mutation = gql`
        mutation UpdateProfile($input: UpdateProfileInput!) {
          updateProfile(input: $input) {
            id
            firstName
            lastName
            icon
          }
        }
      `

      // @ts-ignore - TypeScriptエラーを無視（実際のアプリでは型を適切に定義する）
      const icon = avatarUrls[avatarId] || avatarUrls[1]

      const variables = {
        input: {
          firstName,
          lastName,
          icon,
        },
      }

      await graphqlClient.request(mutation, variables)
      setSuccess(true)
    } catch (err: any) {
      console.error("Profile update failed:", err)
      setError(err.message || "プロフィールの更新に失敗しました。")
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
            <CardDescription>プロフィールを表示するには、まずログインしてください。</CardDescription>
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
        <CardHeader className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user.icon || "/placeholder.svg"} alt={`${user.lastName} ${user.firstName}`} />
            <AvatarFallback className="text-xl">{`${user.lastName.charAt(0)}${user.firstName.charAt(0)}`}</AvatarFallback>
          </Avatar>
          <CardTitle>{`${user.lastName} ${user.firstName}`}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>プロフィールを更新しました。</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">姓</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">名</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-4">
              <Label>アイコン</Label>
              <AvatarSelector selectedId={avatarId} onSelect={setAvatarId} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "更新中..." : "プロフィールを更新する"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
