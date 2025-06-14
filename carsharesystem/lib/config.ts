const API_ENDPOINTS = [
  "https://my-go-api-onion0904-2d2c780f.koyeb.app/query",
  "http://localhost:8080/query",
  "https://api.example.com/graphql",
]

// 動的設定を取得する関数
export const getUseMockData = (): boolean => {
  if (typeof window === "undefined") return true
  const saved = localStorage.getItem("carshare_use_mock_data")
  return saved !== null ? saved === "true" : true
}

export const getApiEndpoint = (): string => {
  if (typeof window === "undefined") return API_ENDPOINTS[0]
  const saved = localStorage.getItem("carshare_api_endpoint")
  return saved || process.env.NEXT_PUBLIC_API_ENDPOINT || API_ENDPOINTS[0]
}

// 後方互換性のため
export const API_ENDPOINT = getApiEndpoint()
export const USE_MOCK_DATA = getUseMockData()

// アバターのURLマッピング
export const AVATAR_URLS = {
  1: "/placeholder.svg?height=64&width=64",
  2: "/placeholder.svg?height=64&width=64",
  3: "/placeholder.svg?height=64&width=64",
  4: "/placeholder.svg?height=64&width=64",
  5: "/placeholder.svg?height=64&width=64",
  6: "/placeholder.svg?height=64&width=64",
}

export const API_ENDPOINTS_LIST = API_ENDPOINTS
