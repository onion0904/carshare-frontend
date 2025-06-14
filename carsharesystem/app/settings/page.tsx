"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { testApiConnection } from "@/lib/graphql-client"
import { API_ENDPOINTS_LIST } from "@/lib/config"
import { Settings, Database, Globe, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const { useMockData, setUseMockData, apiEndpoint, setApiEndpoint, resetToDefaults } = useSettings()
  const [customEndpoint, setCustomEndpoint] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "failed">("unknown")
  const [showCustomEndpoint, setShowCustomEndpoint] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
  }, [user, router])

  useEffect(() => {
    // カスタムエンドポイントかどうかを判定
    setShowCustomEndpoint(!API_ENDPOINTS_LIST.includes(apiEndpoint))
    setCustomEndpoint(apiEndpoint)
  }, [apiEndpoint])

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus("unknown")

    try {
      const isConnected = await testApiConnection()
      setConnectionStatus(isConnected ? "connected" : "failed")
    } catch (error) {
      setConnectionStatus("failed")
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleEndpointChange = (value: string) => {
    if (value === "custom") {
      setShowCustomEndpoint(true)
    } else {
      setShowCustomEndpoint(false)
      setApiEndpoint(value)
      setCustomEndpoint(value)
    }
  }

  const handleCustomEndpointSave = () => {
    if (customEndpoint.trim()) {
      setApiEndpoint(customEndpoint.trim())
      setShowCustomEndpoint(false)
    }
  }

  const handleMockDataToggle = (checked: boolean) => {
    setUseMockData(checked)
    setConnectionStatus("unknown")
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>設定を変更するには、まずログインしてください。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")}>ログインする</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <Settings className="h-8 w-8 mr-3" />
          <h1 className="text-3xl font-bold">設定</h1>
        </div>

        <div className="space-y-6">
          {/* データソース設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                データソース
              </CardTitle>
              <CardDescription>アプリケーションのデータソースを選択します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mock-data">モックデータを使用</Label>
                  <p className="text-sm text-muted-foreground">テスト用のダミーデータを使用します（開発・デモ用）</p>
                </div>
                <Switch id="mock-data" checked={useMockData} onCheckedChange={handleMockDataToggle} />
              </div>

              {useMockData && (
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <strong>モックデータモード:</strong> すべての機能がテスト用データで動作します。
                    実際のAPIサーバーには接続されません。
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* API設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                API設定
              </CardTitle>
              <CardDescription>バックエンドAPIサーバーの設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-endpoint">APIエンドポイント</Label>
                <Select
                  value={showCustomEndpoint ? "custom" : apiEndpoint}
                  onValueChange={handleEndpointChange}
                  disabled={useMockData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="エンドポイントを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {API_ENDPOINTS_LIST.map((endpoint) => (
                      <SelectItem key={endpoint} value={endpoint}>
                        {endpoint}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">カスタムエンドポイント...</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showCustomEndpoint && (
                <div className="space-y-2">
                  <Label htmlFor="custom-endpoint">カスタムエンドポイント</Label>
                  <div className="flex gap-2">
                    <Input
                      id="custom-endpoint"
                      value={customEndpoint}
                      onChange={(e) => setCustomEndpoint(e.target.value)}
                      placeholder="https://api.example.com/graphql"
                      disabled={useMockData}
                    />
                    <Button onClick={handleCustomEndpointSave} disabled={useMockData}>
                      保存
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={useMockData || isTestingConnection}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isTestingConnection ? "animate-spin" : ""}`} />
                  接続テスト
                </Button>

                {connectionStatus === "connected" && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">接続成功</span>
                  </div>
                )}

                {connectionStatus === "failed" && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">接続失敗</span>
                  </div>
                )}
              </div>

              {!useMockData && (
                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    <strong>リアルAPIモード:</strong> 実際のバックエンドサーバーに接続します。
                    <br />
                    現在のエンドポイント: {apiEndpoint}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* リセット */}
          <Card>
            <CardHeader>
              <CardTitle>設定のリセット</CardTitle>
              <CardDescription>すべての設定をデフォルト値に戻します</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={resetToDefaults}>
                デフォルトに戻す
              </Button>
            </CardContent>
          </Card>

          {/* 現在の設定情報 */}
          <Card>
            <CardHeader>
              <CardTitle>現在の設定</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>データソース:</span>
                  <span className="font-medium">{useMockData ? "モックデータ" : "リアルAPI"}</span>
                </div>
                <div className="flex justify-between">
                  <span>APIエンドポイント:</span>
                  <span className="font-medium text-xs break-all">{apiEndpoint}</span>
                </div>
                <div className="flex justify-between">
                  <span>ユーザーID:</span>
                  <span className="font-medium">{user.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
