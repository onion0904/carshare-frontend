import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <div className="py-16 md:py-24 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
        友達と
        <br className="md:hidden" />
        <span className="text-primary">車をシェア</span>
        しよう
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
        FriendCarは、友達同士で車をシェアするためのプラットフォームです。 簡単に予約を管理し、効率的に車を共有できます。
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href="/register">
          <Button size="lg">今すぐ始める</Button>
        </Link>
        <Link href="#how-it-works">
          <Button size="lg" variant="outline">
            使い方を見る
          </Button>
        </Link>
      </div>
    </div>
  )
}
