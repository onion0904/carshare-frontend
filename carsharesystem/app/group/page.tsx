"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { graphqlClient } from "@/lib/graphql-client"
import { gql } from "graphql-request"
import { GroupList } from "@/components/group-list"
import { CreateGroupForm } from "@/components/create-group-form"
import { JoinGroupForm } from "@/components/join-group-form"

type Group = {
  id: string
  name: string
  members: {
    id: string
    name: string
    avatarId: number
  }[]
}

export default function GroupPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchGroups()
  }, [user, router])

  const fetchGroups = async () => {
    try {
      const query = gql`
        query GetMyGroups {
          myGroups {
            id
            name
            members {
              id
              name
              avatarId
            }
          }
        }
      `

      const data = await graphqlClient.request(query)
      setGroups(data.myGroups || [])
    } catch (err: any) {
      console.error("Failed to fetch groups:", err)
      setError(err.message || "グループの取得に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  const handleGroupCreated = () => {
    fetchGroups()
  }

  const handleGroupJoined = () => {
    fetchGroups()
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>グループを表示するには、まずログインしてください。</CardDescription>
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
      <h1 className="text-3xl font-bold mb-8">グループ管理</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GroupList groups={groups} loading={loading} onRefresh={fetchGroups} />
        </div>

        <div>
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">作成</TabsTrigger>
              <TabsTrigger value="join">参加</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>グループを作成</CardTitle>
                  <CardDescription>新しいグループを作成して友達を招待しましょう</CardDescription>
                </CardHeader>
                <CreateGroupForm onGroupCreated={handleGroupCreated} />
              </Card>
            </TabsContent>
            <TabsContent value="join">
              <Card>
                <CardHeader>
                  <CardTitle>グループに参加</CardTitle>
                  <CardDescription>招待コードを入力してグループに参加しましょう</CardDescription>
                </CardHeader>
                <JoinGroupForm onGroupJoined={handleGroupJoined} />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
