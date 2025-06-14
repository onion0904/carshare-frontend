import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <Hero />
      <Features />
      <HowItWorks />
    </div>
  )
}
