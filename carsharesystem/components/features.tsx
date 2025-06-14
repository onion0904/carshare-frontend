import { Calendar, Share2, Users } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "簡単予約管理",
      description: "カレンダー形式で直感的に予約を管理。重要度に応じた予約の優先順位付けも可能です。",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "グループ管理",
      description: "QRコードや招待リンクで友達を簡単に招待。グループ内で車の共有をスムーズに行えます。",
    },
    {
      icon: <Share2 className="h-10 w-10 text-primary" />,
      title: "公平なシェアリング",
      description: "明確なルールに基づいた予約システムで、公平に車を共有できます。",
    },
  ]

  return (
    <div className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">FriendCarの特徴</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-background p-6 rounded-lg shadow-sm">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
