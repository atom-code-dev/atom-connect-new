"use client";

import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRole } from "@prisma/client";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything during SSR or before mount
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentUser = user || session.user;

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to your Dashboard</CardTitle>
            <CardDescription>
              You are logged in as {currentUser.name || currentUser.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <strong>Name:</strong> {currentUser.name || "Not set"}
              </div>
              <div>
                <strong>Email:</strong> {currentUser.email}
              </div>
              <div>
                <strong>Role:</strong> {currentUser.role || "Not set"}
              </div>
              <div>
                <strong>Email Verified:</strong> {currentUser.emailVerified ? "Yes" : "No"}
              </div>
              {currentUser.image && (
                <div>
                  <strong>Profile Image:</strong>
                  <img 
                    src={currentUser.image} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full mt-2"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Go to Your Dashboard</CardTitle>
            <CardDescription>
              Navigate to your role-specific dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => {
                  signOut();
                  router.push("/login");
                }}
                variant="outline"
              >
                Sign Out
              </Button>
              
              {currentUser.role === UserRole.ADMIN && (
                <Button onClick={() => router.push("/admin")}>
                  Go to Admin Dashboard
                </Button>
              )}
              
              {currentUser.role === UserRole.ORGANIZATION && (
                <Button onClick={() => router.push("/organization")}>
                  Go to Organization Dashboard
                </Button>
              )}
              
              {currentUser.role === UserRole.MAINTAINER && (
                <Button onClick={() => router.push("/maintainer")}>
                  Go to Maintainer Dashboard
                </Button>
              )}
              
              {currentUser.role === UserRole.FREELANCER && (
                <Button onClick={() => router.push("/freelancer")}>
                  Go to Freelancer Dashboard
                </Button>
              )}
              
              {!currentUser.role && (
                <div className="text-muted-foreground">
                  No role assigned. Please contact administrator.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}