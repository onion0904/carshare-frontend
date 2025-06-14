"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { executeGraphQL } from "@/lib/graphql-client"
import { gql } from "graphql-request"

interface CreateGroupFormProps {
  onGroupCreated: () => void
}

export function CreateGroupForm({ onGroupCreated }: CreateGroupFormProps) {
  const [groupName, setGroupName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log("Creating group with name:", groupName)

      const mutation = gql`
        mutation CreateGroup($input: CreateGroupInput!) {
          createGroup(input: $input) {
            id
            name
          }
        }
      `

      const variables = {
        input: {
          name: groupName,
        },
      }

      const result = await executeGraphQL<{ createGroup: { id: string; name: string } }>(mutation, variables)
      console.log("Group creation result:", result)

      setSuccess(true)
      setGroupName("")

      // 少し遅延してからリフレッシュ
      setTimeout(() => {
        onGroupCreated()
        setSuccess(false)
      }, 1000)
    } catch (err: any) {
      console.error("Group creation failed:", err)
      setError(err.message || "グループの作成に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>グループを作成しました。</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="group-name">グループ名</Label>
          <Input
            id="group-name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="例: 大学サークル"
            required
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" disabled={loading || !groupName.trim()}>
          {loading ? "作成中..." : "グループを作成"}
        </Button>
      </CardFooter>
    </form>
  )
}
