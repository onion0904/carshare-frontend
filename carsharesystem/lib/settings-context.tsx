"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type SettingsContextType = {
  useMockData: boolean
  setUseMockData: (value: boolean) => void
  apiEndpoint: string
  setApiEndpoint: (value: string) => void
  resetToDefaults: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const DEFAULT_API_ENDPOINTS = [
  "https://my-go-api-onion0904-2d2c780f.koyeb.app/query",
  "http://localhost:8080/query",
  "https://api.example.com/graphql",
]

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [useMockData, setUseMockDataState] = useState(true)
  const [apiEndpoint, setApiEndpointState] = useState(DEFAULT_API_ENDPOINTS[0])

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUseMockData = localStorage.getItem("carshare_use_mock_data")
      const savedApiEndpoint = localStorage.getItem("carshare_api_endpoint")

      if (savedUseMockData !== null) {
        setUseMockDataState(savedUseMockData === "true")
      }
      if (savedApiEndpoint) {
        setApiEndpointState(savedApiEndpoint)
      }
    }
  }, [])

  const setUseMockData = (value: boolean) => {
    setUseMockDataState(value)
    if (typeof window !== "undefined") {
      localStorage.setItem("carshare_use_mock_data", value.toString())
    }
    console.log("🔧 Settings: Mock data mode changed to:", value)
  }

  const setApiEndpoint = (value: string) => {
    setApiEndpointState(value)
    if (typeof window !== "undefined") {
      localStorage.setItem("carshare_api_endpoint", value)
    }
    console.log("🔧 Settings: API endpoint changed to:", value)
  }

  const resetToDefaults = () => {
    setUseMockData(true)
    setApiEndpoint(DEFAULT_API_ENDPOINTS[0])
    if (typeof window !== "undefined") {
      localStorage.removeItem("carshare_use_mock_data")
      localStorage.removeItem("carshare_api_endpoint")
    }
    console.log("🔧 Settings: Reset to defaults")
  }

  return (
    <SettingsContext.Provider
      value={{
        useMockData,
        setUseMockData,
        apiEndpoint,
        setApiEndpoint,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
