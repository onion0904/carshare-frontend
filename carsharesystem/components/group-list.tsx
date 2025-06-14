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
}

interface GroupListProps {
  groups: Group[]
  loading: boolean
  onRefresh: () => void
}

export function GroupList({ groups, loading, onRefresh }: GroupListProps) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const { toast } = useToast()

  const handleCopyInviteLink = (groupId: string) => {
    const inviteLink = `${window.location.origin}/invite/${groupId}`
    navigator.clipboard.writeText(inviteLink)
    toast({
      title: "招待リンクをコピーしました",
      description: "友達に共有して、グループに招待しましょう。",
    })
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

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">グループがありません</h3>
          <p className="text-muted-foreground mb-4">グループを作成するか、招待を受けて参加しましょう。</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle>{group.name}</CardTitle>
            <CardDescription>メンバー: {group.members.length}人</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {group.members.map((member) => (
                <Avatar key={member.id} className="h-10 w-10">
                  <AvatarImage src={`/avatars/avatar-${member.avatarId}.png`} alt={member.name} />
                  <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
              ))}
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
                  <QRCode value={`${window.location.origin}/invite/${group.id}`} size={200} level="H" />
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={() => handleCopyInviteLink(group.id)}>
              <Share2 className="h-4 w-4 mr-2" />
              招待リンク
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
