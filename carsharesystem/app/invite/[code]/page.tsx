"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { graphqlClient } from "@/lib/graphql-client"
import { gql } from "graphql-request"
import { Users } from "lucide-react"

export default function InvitePage({ params }: { params: { code: string } }) {
  const [groupName, setGroupName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const inviteCode = params.code

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/invite/${inviteCode}`)
      return
    }

    fetchGroupInfo()
  }, [user, router, inviteCode])

  const fetchGroupInfo = async () => {
    try {
      const query = gql`
        query GetGroupByInviteCode($inviteCode: String!) {
          groupByInviteCode(inviteCode: $inviteCode) {
            id
            name
          }
        }
      `

      const variables = {
        inviteCode,
      }

      const data = await graphqlClient.request(query, variables)
      setGroupName(data.groupByInviteCode.name)
    } catch (err: any) {
      console.error("Failed to fetch group info:", err)
      setError(err.message || "グループ情報の取得に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!user) return

    setJoining(true)
    setError(null)

    try {
      const mutation = gql`
        mutation JoinGroup($input: JoinGroupInput!) {
          joinGroup(input: $input) {
            id
            name
          }
        }
      `

      const variables = {
        input: {
          inviteCode,
        },
      }

      await graphqlClient.request(mutation, variables)
      setSuccess(true)
      setTimeout(() => {
        router.push("/group")
      }, 2000)
    } catch (err: any) {
      console.error("Group joining failed:", err)
      setError(err.message || "グループへの参加に失敗しました。")
    } finally {
      setJoining(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>グループに参加するには、まずログインしてください。</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push(`/login?redirect=/invite/${inviteCode}`)}>ログインする</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-16rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>グループ招待</CardTitle>
          <CardDescription>友達のグループに参加しましょう</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>グループに参加しました。グループページに移動します...</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p>グループ情報を読み込み中...</p>
            </div>
          ) : groupName ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{groupName}</h3>
              <p className="text-muted-foreground">このグループに参加しますか？</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-500">無効な招待コードです。</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/group")}>
            キャンセル
          </Button>
          <Button onClick={handleJoinGroup} disabled={loading || joining || !groupName || success}>
            {joining ? "参加中..." : "参加する"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
