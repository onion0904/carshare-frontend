"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { ApiStatus } from "@/components/api-status"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const { login, loading, error } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    try {
      await login(email, password)
      // エラーがなければリダイレクト
      if (!error) {
        router.push("/calendar")
      }
    } catch (err: any) {
      setFormError(err.message || "ログイン処理中にエラーが発生しました。")
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-16rem)] py-8">
      <div className="w-full max-w-md">
        <ApiStatus />

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">ログイン</CardTitle>
            <CardDescription>アカウントにログインして、車のシェアを始めましょう</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {(error || formError) && (
                <Alert variant="destructive">
                  <AlertDescription>{formError || error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">パスワード</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    パスワードをお忘れですか？
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "ログイン中..." : "ログイン"}
              </Button>
              <div className="text-center text-sm">
                アカウントをお持ちでない方は{" "}
                <Link href="/register" className="text-primary hover:underline">
                  新規登録
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
