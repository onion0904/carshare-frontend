"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { setAuthToken, removeAuthToken, executeGraphQL } from "@/lib/graphql-client"
import { gql } from "graphql-request"

type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  icon: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  sendVerificationCode: (email: string) => Promise<void>
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    icon: string,
    vcode: string,
  ) => Promise<void>
  logout: () => void
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("auth_token")
    if (token) {
      setAuthToken(token)
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const query = gql`
        query GetCurrentUser {
          me {
            id
            firstName
            lastName
            email
            icon
          }
        }
      `

      const data = await executeGraphQL<{ me: User }>(query)
      if (data.me) {
        setUser(data.me)
      }
    } catch (err: any) {
      console.error("Failed to fetch user:", err)
      localStorage.removeItem("auth_token")
      removeAuthToken()
      setError(err.message || "ユーザー情報の取得に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const mutation = gql`
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              id
              firstName
              lastName
              email
              icon
            }
          }
        }
      `

      const variables = {
        input: {
          email,
          password,
        },
      }

      const data = await executeGraphQL<{
        login: { token: string; user: User }
      }>(mutation, variables)

      if (data.login.token) {
        localStorage.setItem("auth_token", data.login.token)
        setAuthToken(data.login.token)
        setUser(data.login.user)
      }
    } catch (err: any) {
      console.error("Login failed:", err)
      setError(err.message || "ログインに失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  const sendVerificationCode = async (email: string) => {
    setLoading(true)
    setError(null)

    try {
      const mutation = gql`
        mutation SendVerificationCode($email: String!) {
          sendVerificationCode(email: $email)
        }
      `

      const variables = {
        email,
      }

      await executeGraphQL<{ sendVerificationCode: boolean }>(mutation, variables)
    } catch (err: any) {
      console.error("Verification code sending failed:", err)
      setError(err.message || "認証コードの送信に失敗しました。")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    icon: string,
    vcode: string,
  ) => {
    setLoading(true)
    setError(null)

    try {
      const mutation = gql`
        mutation Signup($input: SignupInput!, $vcode: String!) {
          signup(input: $input, vcode: $vcode) {
            token
            User {
              id
              firstName
              lastName
              email
              icon
            }
          }
        }
      `

      const variables = {
        input: {
          firstName,
          lastName,
          email,
          password,
          icon,
        },
        vcode,
      }

      const data = await executeGraphQL<{
        signup: { token: string; User: User }
      }>(mutation, variables)

      if (data.signup.token) {
        localStorage.setItem("auth_token", data.signup.token)
        setAuthToken(data.signup.token)
        setUser(data.signup.User)
      }
    } catch (err: any) {
      console.error("Signup failed:", err)
      setError(err.message || "登録に失敗しました。")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    removeAuthToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, sendVerificationCode, signup, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
