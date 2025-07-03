"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/shared/Header";

export default function LayoutWithHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = pathname === "/login" || pathname === "/register";
  return (
    <>
      {!hideHeader && <Header />}
      {children}
    </>
  );
} 