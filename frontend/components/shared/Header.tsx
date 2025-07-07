"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/constants";

interface HeaderProps {
  showLogout?: boolean;
  showProfile?: boolean;
  className?: string;
}

export default function Header({ showLogout = true, showProfile = true, className = "" }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    router.replace("/login");
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <div className={`flex items-center justify-between p-4 bg-white ${className}`}>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          {APP_NAME}
        </h1>
      </div>

      <div className="flex items-center gap-2">
      </div>
    </div>
  );
} 