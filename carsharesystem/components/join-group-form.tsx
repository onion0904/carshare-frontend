"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { graphqlClient } from "@/lib/graphql-client"
import { gql } from "graphql-request"

interface JoinGroupFormProps {
  onGroupJoined: () => void
}

export function JoinGroupForm({ onGroupJoined }: JoinGroupFormProps) {
  const [inviteCode, setInviteCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

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
      setInviteCode("")
      onGroupJoined()
    } catch (err: any) {
      console.error("Group joining failed:", err)
      setError(err.message || "グループへの参加に失敗しました。")
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
            <AlertDescription>グループに参加しました。</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="invite-code">招待コード</Label>
          <Input
            id="invite-code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="例: abc123"
            required
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "参加中..." : "グループに参加"}
        </Button>
      </CardFooter>
    </form>
  )
}
