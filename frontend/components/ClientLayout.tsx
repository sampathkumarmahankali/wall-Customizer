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
      if (!isLoggedIn && pathname !== "/login" && pathname !== "/register") {
        router.replace("/login");
      }
      setIsReady(true);
    }
  }, [router, pathname]);

  if (!isReady) return null;
  return <>{children}</>;
} 