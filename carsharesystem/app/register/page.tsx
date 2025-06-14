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
import { AvatarSelector } from "@/components/avatar-selector"

// アバターのURLマッピング
const avatarUrls = {
  1: "https://example.com/avatar-1.png",
  2: "https://example.com/avatar-2.png",
  3: "https://example.com/avatar-3.png",
  4: "https://example.com/avatar-4.png",
  5: "https://example.com/avatar-5.png",
  6: "https://example.com/avatar-6.png",
}

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [avatarId, setAvatarId] = useState(1)
  const [verificationCode, setVerificationCode] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [verificationSent, setVerificationSent] = useState(false)
  const { sendVerificationCode, signup, loading, error } = useAuth()
  const router = useRouter()

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (password !== confirmPassword) {
      setFormError("パスワードが一致しません。")
      return
    }

    try {
      await sendVerificationCode(email)
      setVerificationSent(true)
      setStep(2)
    } catch (err) {
      // エラーはuseAuthのerrorステートで処理されます
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    try {
      // @ts-ignore - TypeScriptエラーを無視（実際のアプリでは型を適切に定義する）
      const icon = avatarUrls[avatarId] || avatarUrls[1]
      await signup(firstName, lastName, email, password, icon, verificationCode)
      router.push("/profile")
    } catch (err) {
      // エラーはuseAuthのerrorステートで処理されます
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-16rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">新規登録</CardTitle>
          <CardDescription>アカウントを作成して、車のシェアを始めましょう</CardDescription>
        </CardHeader>

        {step === 1 ? (
          <form onSubmit={handleSendVerificationCode}>
            <CardContent className="space-y-4">
              {(error || formError) && (
                <Alert variant="destructive">
                  <AlertDescription>{formError || error}</AlertDescription>
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
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">パスワード（確認）</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>アイコン</Label>
                <AvatarSelector selectedId={avatarId} onSelect={setAvatarId} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "認証コード送信中..." : "認証コードを送信"}
              </Button>
              <div className="text-center text-sm">
                すでにアカウントをお持ちの方は{" "}
                <Link href="/login" className="text-primary hover:underline">
                  ログイン
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              {(error || formError) && (
                <Alert variant="destructive">
                  <AlertDescription>{formError || error}</AlertDescription>
                </Alert>
              )}

              {verificationSent && (
                <Alert>
                  <AlertDescription>{email}に認証コードを送信しました。</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="verification-code">認証コード</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="認証コードを入力"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "登録中..." : "登録する"}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                戻る
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
