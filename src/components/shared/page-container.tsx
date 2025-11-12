"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const authedLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Events", href: "/events" },
  { label: "Sessions", href: "/sessions" },
  { label: "Leaderboard", href: "/leaderboard" },
];

const adminLinks = [
  { label: "Admin", href: "/admin" },
];

export const PageContainer = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show admin links for both admin and mentor roles
  const showAdminLinks = user?.role === "admin" || user?.role === "mentor";
  
  const navigationLinks = isAuthenticated 
    ? [...authedLinks, ...(showAdminLinks ? adminLinks : [])]
    : [{ label: "Home", href: "/" }];

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    // Exact match for dashboard to avoid highlighting on /dashboard/profile
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    // For other routes, check if pathname starts with the href
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-[#010107] text-white">
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#010107]/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-sm uppercase tracking-[0.4em] text-white/70 hover:text-cyan-400 transition-colors">
            CODE 4O4 Dev Club
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            {navigationLinks.map(
              (link) => {
                const isActive = isActiveLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-3 py-1 transition-colors duration-200 ${
                      isActive 
                        ? "text-cyan-400 font-semibold bg-cyan-400/10" 
                        : "hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              },
            )}
            {isAuthenticated && user && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Logout
                </Button>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-white/80 transition hover:border-cyan-400/50 hover:text-white"
                >
                  {user.avatar ? (
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-sm font-semibold text-black">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{user.name.split(" ")[0]}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
};
