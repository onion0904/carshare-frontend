"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { testApiConnection } from "@/lib/graphql-client"
import { API_ENDPOINT, USE_MOCK_DATA } from "@/lib/config"
import { AlertCircle, CheckCircle, RefreshCw, Database } from "lucide-react"

export function ApiStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    const connected = await testApiConnection()
    setIsConnected(connected)
    setIsChecking(false)
  }

  useEffect(() => {
    if (!USE_MOCK_DATA) {
      checkConnection()
    }
  }, [])

  if (USE_MOCK_DATA) {
    return (
      <Alert className="mb-4">
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>モックデータモード</strong>: すべての機能がテスト用データで動作します
        </AlertDescription>
      </Alert>
    )
  }

  if (isConnected === null && !isChecking) {
    return null
  }

  return (
    <Alert variant={isConnected ? "default" : "destructive"} className="mb-4">
      {isConnected ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <AlertDescription className="flex items-center justify-between">
        <span>
          {isChecking
            ? "API接続を確認中..."
            : isConnected
              ? `APIサーバーに接続済み (${API_ENDPOINT})`
              : `APIサーバーに接続できません (${API_ENDPOINT})`}
        </span>
        <Button variant="outline" size="sm" onClick={checkConnection} disabled={isChecking}>
          <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
