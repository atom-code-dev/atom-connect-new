import NextAuth from "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: UserRole | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role?: UserRole | null
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    id: string
    role?: UserRole | null
  }
}