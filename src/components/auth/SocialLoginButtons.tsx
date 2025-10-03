"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Linkedin, Info } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface SocialLoginButtonsProps {
  className?: string
  onLinkedInLogin?: () => void
}

export function SocialLoginButtons({ className, onLinkedInLogin }: SocialLoginButtonsProps) {
  const [isPreviewEnvironment, setIsPreviewEnvironment] = useState(false)

  useEffect(() => {
    // Check if we're in a preview environment
    const isPreview = window.location.hostname.includes('space.z.ai') || 
                     window.location.hostname !== 'localhost'
    setIsPreviewEnvironment(isPreview)
  }, [])

  const handleSocialLogin = async (provider: string) => {
    try {
      console.log('Social login clicked for provider:', provider)
      
      if (provider === "linkedin") {
        if (isPreviewEnvironment) {
          toast.info("LinkedIn OAuth is not available in preview environment. Please use email/password login or test in localhost environment.", {
            duration: 5000,
            icon: <Info className="h-4 w-4" />
          })
          return
        }
        
        console.log('Attempting LinkedIn login...')
        if (onLinkedInLogin) {
          console.log('Calling onLinkedInLogin callback...')
          onLinkedInLogin()
        } else {
          console.log('No callback provided, redirecting directly...')
          // Direct redirect to BetterAuth social login endpoint
          window.location.href = `/api/auth/social/${provider}`
        }
      } else {
        toast.error(`Failed to sign in with ${provider}`)
      }
    } catch (error) {
      console.error('Social login error:', error)
      toast.error(`Failed to sign in with ${provider}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className={className}
    >
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-4">
        <Button
          variant="outline"
          type="button"
          className="w-full relative"
          onClick={() => handleSocialLogin("linkedin")}
          disabled={isPreviewEnvironment}
        >
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
          {isPreviewEnvironment && (
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-1">
              Preview
            </span>
          )}
        </Button>
        
        {isPreviewEnvironment && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            LinkedIn OAuth requires localhost environment. Use email/password for preview testing.
          </p>
        )}
      </div>
    </motion.div>
  )
}