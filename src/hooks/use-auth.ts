"use client"

import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"

interface UseAuthReturn {
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role?: UserRole | null
  } | null
  session: {
    accessToken?: string
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: UserRole | null
    }
  } | null
  isAuthenticated: boolean
  isLoading: boolean
  isPending: boolean
  status: "loading" | "authenticated" | "unauthenticated"
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()

  return {
    user: session?.user || null,
    session: session || null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isPending: status === "loading",
    status
  }
}