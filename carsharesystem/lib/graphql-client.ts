import { GraphQLClient } from "graphql-request"
import { getApiEndpoint, getUseMockData } from "./config"
import { executeMockGraphQL } from "./mock-graphql-client"

// 動的にクライアントを作成する関数
const createGraphQLClient = () => {
  const endpoint = getApiEndpoint()
  return new GraphQLClient(endpoint, {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000,
  })
}

// API接続テスト用の関数
export async function testApiConnection(): Promise<boolean> {
  if (getUseMockData()) return true

  try {
    const endpoint = getApiEndpoint()
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "{ __typename }",
      }),
    })
    return response.ok
  } catch (error) {
    console.error("API connection test failed:", error)
    return false
  }
}

// リクエストのエラーハンドリングを改善するラッパー関数
export async function executeGraphQL<T>(query: string, variables?: any): Promise<T> {
  const useMockData = getUseMockData()
  const endpoint = getApiEndpoint()

  const queryType = query.includes("UpdateProfile")
    ? "UpdateProfile"
    : query.includes("CreateEvent")
      ? "CreateEvent"
      : query.includes("GetMyGroups")
        ? "GetMyGroups"
        : "Unknown"

  console.log(`🔄 GraphQL Request (${queryType}):`, {
    useMockData,
    endpoint: useMockData ? "MOCK" : endpoint,
    query: query.replace(/\s+/g, " ").trim(),
    variables,
    timestamp: new Date().toISOString(),
  })

  // モックデータを使用する場合
  if (useMockData) {
    try {
      const result = await executeMockGraphQL<T>(query, variables)
      console.log(`✅ Mock GraphQL Response (${queryType}):`, result)
      return result
    } catch (error: any) {
      console.error(`❌ Mock GraphQL Error (${queryType}):`, {
        error,
        message: error.message,
        query: query.replace(/\s+/g, " ").trim(),
        variables,
      })
      throw error
    }
  }

  try {
    const graphqlClient = createGraphQLClient()
    const result = await graphqlClient.request<T>(query, variables)
    console.log(`✅ Real GraphQL Response (${queryType}):`, result)
    return result
  } catch (error: any) {
    console.error(`❌ Real GraphQL Error (${queryType}):`, {
      message: error.message,
      response: error.response,
      request: error.request,
      endpoint: endpoint,
      query: query.replace(/\s+/g, " ").trim(),
      variables,
    })

    if (!error.response) {
      const isConnected = await testApiConnection()
      if (!isConnected) {
        throw new Error(
          `APIサーバー（${endpoint}）に接続できません。\n` +
            "以下を確認してください：\n" +
            "1. インターネット接続\n" +
            "2. APIサーバーの稼働状況\n" +
            "3. ファイアウォール設定",
        )
      }
    }

    if (error.response?.errors) {
      const errorMessage = error.response.errors.map((e: any) => e.message).join(", ")
      throw new Error(errorMessage)
    }

    throw error
  }
}

// 認証トークンの設定（動的クライアント対応）
export const setAuthToken = (token: string) => {
  if (!getUseMockData()) {
    // 実際の実装では、トークンをローカルストレージに保存し、
    // リクエスト時に動的に設定する必要があります
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }
}

export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
  }
}

// 認証トークンを取得してヘッダーに設定する関数
export const getAuthHeaders = () => {
  if (getUseMockData()) return {}

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
  return {}
}
