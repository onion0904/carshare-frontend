"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Share2, QrCode } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import QRCode from "qrcode.react"

type Member = {
  id: string
  name: string
  avatarId: number
}

type Group = {
  id: string
  name: string
  members: Member[]
  inviteCode?: string
}

interface GroupListProps {
  groups: Group[]
  loading: boolean
  onRefresh: () => void
}

export function GroupList({ groups, loading, onRefresh }: GroupListProps) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const { toast } = useToast()

  // デバッグ用
  console.log("GroupList rendering:", {
    groupsCount: groups.length,
    loading,
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      memberCount: g.members?.length || 0,
      members: g.members?.map((m) => ({ id: m.id, name: m.name, avatarId: m.avatarId })),
    })),
  })

  const handleCopyInviteLink = (group: Group) => {
    const inviteCode = group.inviteCode || group.id
    const inviteLink = `${window.location.origin}/invite/${inviteCode}`
    navigator.clipboard.writeText(inviteLink)
    toast({
      title: "招待リンクをコピーしました",
      description: "友達に共有して、グループに招待しましょう。",
    })
  }

  const getDisplayName = (member: Member): string => {
    if (!member) return "不明なユーザー"
    if (member.name) return member.name
    return `ユーザー ${member.id.substring(0, 8)}`
  }

  const getAvatarFallback = (member: Member): string => {
    if (!member) return "?"
    if (member.name && member.name.length >= 2) {
      return member.name.substring(0, 2)
    }
    return member.id ? member.id.substring(0, 2).toUpperCase() : "?"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(2)
          .fill(0)
          .map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-10 w-10 rounded-full" />
                    ))}
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
      </div>
    )
  }

  if (!groups || groups.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">グループがありません</h3>
          <p className="text-muted-foreground mb-4">グループを作成するか、招待を受けて参加しましょう。</p>
          <Button onClick={onRefresh}>再読み込み</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle>{group.name || "名前なしグループ"}</CardTitle>
            <CardDescription>
              メンバー: {group.members?.length || 0}人{group.inviteCode && ` • 招待コード: ${group.inviteCode}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {group.members && group.members.length > 0 ? (
                group.members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/avatars/avatar-${member.avatarId || 1}.png`} alt={getDisplayName(member)} />
                      <AvatarFallback>{getAvatarFallback(member)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground hidden sm:inline">{getDisplayName(member)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">メンバーがいません</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setSelectedGroup(group)}>
                  <QrCode className="h-4 w-4 mr-2" />
                  QRコード
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{group.name} - 招待QRコード</DialogTitle>
                  <DialogDescription>このQRコードをスキャンして、グループに参加できます。</DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-4">
                  <QRCode
                    value={`${window.location.origin}/invite/${group.inviteCode || group.id}`}
                    size={200}
                    level="H"
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  招待コード: {group.inviteCode || group.id}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={() => handleCopyInviteLink(group)}>
              <Share2 className="h-4 w-4 mr-2" />
              招待リンク
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
