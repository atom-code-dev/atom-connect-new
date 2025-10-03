"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Users, BookOpen, Building, Settings } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">Atom Connect</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-4">
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/register-organization" className="text-muted-foreground hover:text-foreground transition-colors">
                Register Organization
              </Link>
            </nav>
            <div className="bg-background/80 backdrop-blur-sm border border-border rounded-full p-1 shadow-sm">
              <AnimatedThemeToggler className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Connect Trainers & Organizations
          </motion.h2>
          <motion.p 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            A comprehensive platform for trainers, organizations, and maintainers to collaborate and manage training programs.
          </motion.p>
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center space-x-4"
          >
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/register-organization">Register Organization</Link>
            </Button>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>For Trainers</CardTitle>
              <CardDescription>
                Create and manage training programs, track availability, and connect with organizations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Building className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>For Organizations</CardTitle>
              <CardDescription>
                Find qualified trainers, manage training programs, and track organizational progress.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Settings className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>For Maintainers</CardTitle>
              <CardDescription>
                Review and approve training programs, manage system configurations, and ensure quality standards.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>For Admins</CardTitle>
              <CardDescription>
                Manage users, organizations, and system-wide settings with comprehensive admin tools.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ready to get started?</CardTitle>
              <CardDescription>
                Join our platform today and start connecting with trainers and organizations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center space-x-4">
                <Button asChild>
                  <Link href="/register-organization">Register Organization</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Atom Connect. Built with Next.js and better-auth.</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}