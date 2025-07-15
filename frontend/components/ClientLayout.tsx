"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      // Only restrict /create, /editor, /profile
      const protectedRoutes = ["/create", "/editor", "/profile"];
      if (!isLoggedIn && protectedRoutes.some(route => pathname.startsWith(route))) {
        router.replace("/login");
      }
      setIsReady(true);
    }
  }, [router, pathname]);

  if (!isReady) return null;
  return <>{children}</>;
} 