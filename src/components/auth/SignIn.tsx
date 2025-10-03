"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useTransition } from "react";
import { Loader2, Building2, Users, Shield, Briefcase } from "lucide-react";
import { signIn, getProviders } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, startTransition] = useTransition();
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Successfully signed in");
          const callbackURL = params.get("callbackURL") || "/dashboard";
          router.push(callbackURL);
        }
      } catch (error) {
        toast.error("An error occurred during sign in");
      }
    });
  };

  const handleLinkedInSignIn = async () => {
    try {
      const result = await signIn("linkedin", {
        callbackURL: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        toast.error("LinkedIn sign in failed");
      }
    } catch (error) {
      toast.error("An error occurred during LinkedIn sign in");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Information */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col justify-center space-y-6"
        >
          <div className="text-center lg:text-left">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Welcome to Atom Connect</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Connect trainers, organizations, and maintainers in one comprehensive platform.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Organizations & Admins</h3>
                <p className="text-sm text-muted-foreground">
                  Sign in with your organization credentials to access the dashboard and manage training programs.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Freelancers</h3>
                <p className="text-sm text-muted-foreground">
                  Sign in with LinkedIn to quickly join as a freelancer and start connecting with organizations.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">Maintainers</h3>
                <p className="text-sm text-muted-foreground">
                  Access your maintenance dashboard with your organization credentials.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <p className="text-sm text-muted-foreground">
              Don't have an organization account?{" "}
              <Link href="/register-organization" className="text-primary hover:underline font-medium">
                Register your organization
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="max-w-md mx-auto lg:mx-0 rounded-none">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Choose your sign-in method below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {/* Freelancer LinkedIn Login */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-medium text-sm">For Freelancers</h4>
                  </div>
                  <Button
                    variant="outline"
                    className={cn("w-full gap-2 flex relative")}
                    onClick={handleLinkedInSignIn}
                    disabled={loading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      />
                    </svg>
                    <span>Sign in with LinkedIn (Freelancers)</span>
                  </Button>
                </div>

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

                {/* Organization/Admin/Maintainer Credentials Login */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-medium text-sm">Organizations, Admins & Maintainers</h4>
                  </div>
                  
                  <form onSubmit={handleCredentialsSignIn} className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="organization@company.com"
                        required
                        onChange={(e) => {
                          setEmail(e.target.value);
                        }}
                        value={email}
                      />
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link
                          href="/forget-password"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>

                      <Input
                        id="password"
                        type="password"
                        placeholder="password"
                        autoComplete="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => {
                          setRememberMe(checked as boolean);
                        }}
                      />
                      <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full flex items-center justify-center"
                      disabled={loading}
                    >
                      <div className="flex items-center justify-center w-full relative">
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          "Sign In with Credentials"
                        )}
                      </div>
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}