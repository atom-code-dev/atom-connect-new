import NextAuth from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import LinkedInProvider from "next-auth/providers/linkedin"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            freelancerProfile: true,
            organizationProfile: true,
            adminProfile: true,
            maintainerProfile: true
          }
        })

        if (!user || !user.password) {
          return null
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          emailVerified: user.emailVerified,
        }
      }
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: { scope: "openid profile email" }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    encryption: true,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and user id to the token right after signin
      if (account && user) {
        token.accessToken = account.access_token
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from the token
      session.accessToken = token.accessToken as string
      session.user.id = token.id as string
      session.user.role = token.role as UserRole
      
      return session
    },
    async redirect({ url, baseUrl }) {
      // If it's a relative URL, construct the full URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      
      // If it's on the same origin, allow it
      else if (new URL(url).origin === baseUrl) {
        return url
      }
      
      // Default fallback to dashboard after login
      return `${baseUrl}/dashboard`
    }
  },
  pages: {
    signIn: "/login",
    signUp: "/register",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
}

// Export the NextAuth handler
const handler = NextAuth(authOptions)

export { handler as auth }