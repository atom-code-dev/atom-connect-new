"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FreelancerStepForm } from "@/components/auth/FreelancerStepForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useAuth } from "@/components/providers"

interface LinkedInUserData {
  name: string
  email: string
  profilePicture?: string
  linkedinUrl?: string
}

export default function CompleteFreelancerProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [linkedinData, setLinkedinData] = useState<LinkedInUserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      // Try to get LinkedIn data from URL params or localStorage
      const urlParams = new URLSearchParams(window.location.search)
      const linkedinName = urlParams.get('name') || localStorage.getItem('linkedin_name')
      const linkedinEmail = urlParams.get('email') || localStorage.getItem('linkedin_email')
      const linkedinPicture = urlParams.get('picture') || localStorage.getItem('linkedin_picture')
      
      if (linkedinName && linkedinEmail) {
        setLinkedinData({
          name: linkedinName,
          email: linkedinEmail,
          profilePicture: linkedinPicture || undefined
        })
        setIsLoading(false)
      } else {
        // Redirect to login if no LinkedIn data
        router.push("/")
      }
    } else {
      // User is authenticated, get their data
      setLinkedinData({
        name: user.name || "",
        email: user.email || ""
      })
      setIsLoading(false)
    }
  }, [user, router])

  const handleFormComplete = async (formData: any) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/freelancers/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          skills: JSON.stringify(formData.skills),
          trainerType: formData.trainerType
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Profile completed successfully!")
        router.push("/freelancer")
      } else {
        toast.error(result.error || "Failed to complete profile")
      }
    } catch (error) {
      toast.error("An error occurred while completing your profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your LinkedIn data...</p>
        </div>
      </div>
    )
  }

  if (!linkedinData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No LinkedIn Data Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in with LinkedIn to complete your profile.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Complete Your Freelancer Profile</h1>
          <p className="text-muted-foreground mt-2">
            Welcome {linkedinData.name}! Just a few more steps to get started.
          </p>
        </motion.div>

        {/* Step Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isSubmitting ? (
            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Creating your profile...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <FreelancerStepForm
              linkedinData={linkedinData}
              onComplete={handleFormComplete}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}