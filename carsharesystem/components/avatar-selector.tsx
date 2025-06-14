"use client"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// アバターの選択肢
const avatarOptions = [
  { id: 1, src: "/avatars/avatar-1.png", alt: "Avatar 1", fallback: "A1" },
  { id: 2, src: "/avatars/avatar-2.png", alt: "Avatar 2", fallback: "A2" },
  { id: 3, src: "/avatars/avatar-3.png", alt: "Avatar 3", fallback: "A3" },
  { id: 4, src: "/avatars/avatar-4.png", alt: "Avatar 4", fallback: "A4" },
  { id: 5, src: "/avatars/avatar-5.png", alt: "Avatar 5", fallback: "A5" },
  { id: 6, src: "/avatars/avatar-6.png", alt: "Avatar 6", fallback: "A6" },
]

interface AvatarSelectorProps {
  selectedId: number
  onSelect: (id: number) => void
}

export function AvatarSelector({ selectedId, onSelect }: AvatarSelectorProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
      {avatarOptions.map((avatar) => (
        <div
          key={avatar.id}
          className={cn(
            "cursor-pointer p-2 rounded-lg transition-all",
            selectedId === avatar.id ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted",
          )}
          onClick={() => onSelect(avatar.id)}
        >
          <Avatar className="h-16 w-16 mx-auto">
            <AvatarImage src={avatar.src || "/placeholder.svg"} alt={avatar.alt} />
            <AvatarFallback>{avatar.fallback}</AvatarFallback>
          </Avatar>
        </div>
      ))}
    </div>
  )
}
