"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, User, Briefcase, MapPin, Phone, FileText, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface FreelancerFormData {
  name: string
  email: string
  phone: string
  skills: string[]
  experience: string
  bio: string
  location: string
  trainerType: "UNIVERSITY" | "CORPORATE" | "BOTH"
}

interface FreelancerStepFormProps {
  linkedinData: {
    name: string
    email: string
    profilePicture?: string
    linkedinUrl?: string
  }
  onComplete: (data: FreelancerFormData) => void
}

export function FreelancerStepForm({ linkedinData, onComplete }: FreelancerStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FreelancerFormData>({
    name: linkedinData.name || "",
    email: linkedinData.email || "",
    phone: "",
    skills: [],
    experience: "",
    bio: "",
    location: "",
    trainerType: "BOTH"
  })
  const [skillInput, setSkillInput] = useState("")

  const steps = [
    {
      title: "Basic Information",
      icon: User,
      description: "Tell us about yourself"
    },
    {
      title: "Professional Details",
      icon: Briefcase,
      description: "Your skills and experience"
    },
    {
      title: "Location & Contact",
      icon: MapPin,
      description: "Where are you based?"
    },
    {
      title: "Review & Complete",
      icon: CheckCircle,
      description: "Review your information"
    }
  ]

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepComplete = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== "" && formData.email.trim() !== ""
      case 1:
        return formData.skills.length > 0 && formData.experience.trim() !== ""
      case 2:
        return formData.location.trim() !== ""
      case 3:
        return true
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself and your expertise..."
                rows={3}
              />
            </div>
          </motion.div>
        )

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="skills">Skills *</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill (e.g., React, Node.js)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Description *</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="Describe your experience and expertise..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Trainer Type</Label>
              <div className="flex gap-2">
                {[
                  { value: "UNIVERSITY", label: "University" },
                  { value: "CORPORATE", label: "Corporate" },
                  { value: "BOTH", label: "Both" }
                ].map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={formData.trainerType === type.value ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, trainerType: type.value as any }))}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State/Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Personal Information</h4>
                <p className="text-sm">{formData.name}</p>
                <p className="text-sm text-muted-foreground">{formData.email}</p>
                {formData.phone && <p className="text-sm text-muted-foreground">{formData.phone}</p>}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Professional Details</h4>
                <p className="text-sm">{formData.trainerType} Trainer</p>
                <p className="text-sm text-muted-foreground">{formData.location}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {formData.bio && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Bio</h4>
                <p className="text-sm">{formData.bio}</p>
              </div>
            )}

            {formData.experience && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Experience</h4>
                <p className="text-sm">{formData.experience}</p>
              </div>
            )}
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Complete Your Freelancer Profile</CardTitle>
            <CardDescription>
              Just a few more details to get you started
            </CardDescription>
          </div>
          {linkedinData.profilePicture && (
            <img
              src={linkedinData.profilePicture}
              alt="LinkedIn Profile"
              className="w-12 h-12 rounded-full"
            />
          )}
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      index < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
          <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
        </div>
        
        <div className="mb-6">
          {renderStep()}
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isStepComplete()}
          >
            {currentStep === steps.length - 1 ? (
              <>
                Complete Profile
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}