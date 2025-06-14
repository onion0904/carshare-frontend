"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { USE_MOCK_DATA } from "@/lib/config"

interface DebugInfoProps {
  data: any
  title: string
}

export function DebugInfo({ data, title }: DebugInfoProps) {
  if (!USE_MOCK_DATA) return null

  return (
    <Card className="mt-4 border-dashed">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">🐛 Debug: {title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">{JSON.stringify(data, null, 2)}</pre>
      </CardContent>
    </Card>
  )
}
