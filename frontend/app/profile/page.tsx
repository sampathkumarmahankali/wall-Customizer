"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import ProfileForm from "@/components/auth/ProfileForm";
import SessionList from '../../components/profile/SessionList';

const API_URL = "http://localhost:4000/api";

export default function ProfilePage() {
  const router = useRouter();
  // Get user email for avatar fallback
  let email = "";
    if (typeof window !== "undefined") {
    email = localStorage.getItem("userEmail") || "";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-4 flex items-center justify-end">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sessions Card - Left */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 min-w-0">
            <div className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Your Edit Sessions
            </div>
            <SessionList />
          </div>
          {/* Profile Card - Right */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center flex-1 min-w-0">
            <Avatar className="h-20 w-20 mb-4">
              {/* You can add AvatarImage here if you have user image */}
              <AvatarFallback className="text-3xl">
                {email ? email[0].toUpperCase() : <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="text-xl font-bold mb-1">User Profile</div>
            <div className="text-gray-500 mb-4">Manage your account</div>
            <ProfileForm />
          </div>
            </div>
            </div>
    </div>
  );
} 