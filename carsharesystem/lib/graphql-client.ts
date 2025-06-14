import { GraphQLClient } from "graphql-request"
import { API_ENDPOINT } from "./config"

// 設定ファイルからエンドポイントを取得
const endpoint = API_ENDPOINT

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    // 必要なヘッダーを追加
  },
  // タイムアウトを設定
  timeout: 30000,
})

// リクエストのエラーハンドリングを改善するラッパー関数
export async function executeGraphQL<T>(query: string, variables?: any): Promise<T> {
  try {
    return await graphqlClient.request<T>(query, variables)
  } catch (error: any) {
    // エラーの詳細をログに出力
    console.error("GraphQL request failed:", {
      message: error.message,
      response: error.response,
      request: error.request,
    })

    // ネットワークエラーの場合
    if (!error.response) {
      throw new Error("APIサーバーに接続できません。ネットワーク接続を確認してください。")
    }

    // GraphQLエラーの場合
    if (error.response?.errors) {
      const errorMessage = error.response.errors.map((e: any) => e.message).join(", ")
      throw new Error(errorMessage)
    }

    // その他のエラー
    throw error
  }
}

// Add authentication token to headers when user is logged in
export const setAuthToken = (token: string) => {
  graphqlClient.setHeader("Authorization", `Bearer ${token}`)
}

// Remove authentication token when user logs out
export const removeAuthToken = () => {
  graphqlClient.setHeaders({})
}
