"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, Clock, Palette, LogOut, Home, ChevronDown } from "lucide-react";
import ProfileForm from "@/components/auth/ProfileForm";
import SessionList from '../../components/profile/SessionList';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import Footer from "@/components/shared/Footer";

const API_URL = "http://localhost:4000/api";

// Session data type
interface Session {
  id: string;
  name: string;
  updatedAt: string;
}

const fetchUserIdByEmail = async (email: string): Promise<string | null> => {
  const res = await fetch(`${API_URL}/userid-by-email/${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.userId;
};

const fetchUserSessions = async (userId: string): Promise<Session[]> => {
  if (!userId) return [];
  const res = await fetch(`${API_URL}/sessions/${userId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((s: any) => ({
    id: s.id.toString(),
    name: s.name,
    updatedAt: s.updated_at,
  }));
};

export default function ProfilePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  // Get user email for avatar fallback
  let email = "";
  if (typeof window !== "undefined") {
    email = localStorage.getItem("userEmail") || "";
  }

  useEffect(() => {
    const loadSessions = async () => {
      if (!email) {
        setLoading(false);
        return;
      }
      
      try {
        const userId = await fetchUserIdByEmail(email);
        if (userId) {
          const sessionData = await fetchUserSessions(userId);
          setSessions(sessionData);
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [email]);

  // Calculate active projects (sessions updated in the last 1 day)
  const getActiveProjects = () => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.updatedAt);
      return sessionDate > oneDayAgo;
    }).length;
  };

  // Get total sessions count
  const getTotalSessions = () => sessions.length;

  // Get account status (basic logic - can be enhanced)
  const getAccountStatus = () => {
    if (sessions.length >= 10) return "Premium";
    if (sessions.length >= 5) return "Pro";
    return "Basic";
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  const handleLogoClick = () => {
    router.push("/create");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex-1">
        {/* Top Navigation Bar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50 m-0 p-0">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo Section */}
              <div className="flex items-center gap-3 cursor-pointer group" onClick={handleLogoClick}>
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg group-hover:from-indigo-600 group-hover:to-purple-700 transition-all duration-200 shadow-lg group-hover:shadow-xl">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-200">
                    Wallora
                  </h1>
                  <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                    Wall Aura Creator
                  </p>
                </div>
              </div>
              {/* Profile Dropdown on the right */}
              <div className="flex items-center">
                <Popover open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
                  <PopoverTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                      onClick={() => setProfileMenuOpen((open) => !open)}
                    >
                      <User className="h-5 w-5 text-indigo-600" />
                      <span className="hidden sm:inline">{email}</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-48 p-2 bg-white rounded-xl shadow-lg border border-gray-200 mt-2">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all text-sm font-medium"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="p-4 pt-0">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Profile Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Manage your account and design sessions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card - Left */}
              <div className="lg:col-span-1">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-center mb-4">
                      <Avatar className="h-24 w-24 border-4 border-white/20">
                        <AvatarFallback className="text-2xl bg-white/20 text-white">
                          {email ? email[0].toUpperCase() : <User className="h-12 w-12" />}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-1">Welcome Back!</h2>
                      <p className="text-indigo-100">{email}</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <ProfileForm />
                  </CardContent>
                </Card>
              </div>

              {/* Sessions Card - Right */}
              <div className="lg:col-span-2">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Palette className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Design Sessions</h2>
                        <p className="text-blue-100">Continue your creative projects</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <SessionList />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-green-100 text-sm">Total Sessions</p>
                      <p className="text-2xl font-bold">
                        {loading ? "..." : getTotalSessions()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Settings className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-orange-100 text-sm">Active Projects</p>
                      <p className="text-2xl font-bold">
                        {loading ? "..." : getActiveProjects()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-lg rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-purple-100 text-sm">Account Status</p>
                      <p className="text-2xl font-bold">
                        {loading ? "..." : getAccountStatus()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 