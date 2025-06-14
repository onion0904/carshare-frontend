"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { usePathname } from "next/navigation"
import { Calendar, Menu, X } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    { name: "ホーム", href: "/" },
    { name: "カレンダー", href: "/calendar" },
    { name: "グループ", href: "/group" },
  ]

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <span className="text-xl font-bold">FriendCar</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <ModeToggle />
            {user ? (
              <>
                <Link href="/profile" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.icon || "/placeholder.svg"} alt={`${user.lastName} ${user.firstName}`} />
                    <AvatarFallback>{`${user.lastName.charAt(0)}${user.firstName.charAt(0)}`}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{`${user.lastName} ${user.firstName}`}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  ログアウト
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    ログイン
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">新規登録</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-2 text-base font-medium ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block py-2 text-base font-medium text-muted-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  プロフィール
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-0 py-2 h-auto font-medium"
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                >
                  ログアウト
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2 text-base font-medium text-muted-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="block py-2 text-base font-medium text-muted-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
