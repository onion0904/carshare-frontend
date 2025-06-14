import Link from "next/link"
import { Calendar } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <span className="text-xl font-bold">FriendCar</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              友達同士で車をシェアして、より便利で効率的な移動手段を提供します。
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">リンク</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/calendar" className="text-muted-foreground hover:text-primary">
                  カレンダー
                </Link>
              </li>
              <li>
                <Link href="/group" className="text-muted-foreground hover:text-primary">
                  グループ
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-primary">
                  プロフィール
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">お問い合わせ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  お問い合わせフォーム
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary">
                  よくある質問
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FriendCar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
