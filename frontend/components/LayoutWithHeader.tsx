"use client";
import React from "react";
import { usePathname } from "next/navigation";

export default function LayoutWithHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <>{children}</>;
} 