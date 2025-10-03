"use client";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  );
}

// Re-export useAuth from the hook
export { useAuth } from "@/hooks/use-auth";

// Export auth client for server-side use
export const authClient = {
  getSession: async () => {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    return getServerSession(authOptions);
  },
};