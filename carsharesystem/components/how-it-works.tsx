import { Check } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "アカウント登録",
      description: "メールアドレスで簡単に登録し、プロフィールを設定します。",
    },
    {
      number: "02",
      title: "グループ作成・参加",
      description: "車をシェアする友達とグループを作成するか、招待を受けて参加します。",
    },
    {
      number: "03",
      title: "予約の作成",
      description: "カレンダーから日時を選び、重要度やメモを追加して予約を作成します。",
    },
    {
      number: "04",
      title: "車の利用",
      description: "予約した日時に車を利用します。ルールに従って公平に共有しましょう。",
    },
  ]

  return (
    <div className="py-16" id="how-it-works">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">利用の流れ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-primary font-bold">{step.number}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-16 w-[calc(100%-2rem)] h-0.5 bg-primary/20">
                  <Check className="absolute right-0 top-1/2 -translate-y-1/2 text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
