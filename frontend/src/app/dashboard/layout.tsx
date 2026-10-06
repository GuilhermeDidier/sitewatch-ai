"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { isDemoUser } from "@/lib/demo";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 pt-18 sm:p-6 sm:pt-20 lg:ml-64 lg:p-8 lg:pt-8">
        {isDemoUser(user.email) && (
          <p className="mb-6 rounded-lg border border-border bg-bg-card px-4 py-3 text-sm text-text-secondary">
            You are in the read-only demo. The competitors and their changes are fictional sample
            data, and scans and edits are turned off.{" "}
            <Link href="/register" className="text-accent hover:text-accent-hover">
              Create an account
            </Link>{" "}
            to monitor real sites.
          </p>
        )}
        {children}
      </main>
    </div>
  );
}
