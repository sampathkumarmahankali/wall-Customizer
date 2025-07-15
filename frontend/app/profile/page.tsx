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
import ProfilePhotoUpload from "@/components/auth/ProfilePhotoUpload";
import SessionList from '../../components/profile/SessionList';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import Footer from "@/components/shared/Footer";
import { authenticatedFetch } from "@/lib/auth";

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
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Get user email for avatar fallback
  let email = "";
  if (typeof window !== "undefined") {
    email = localStorage.getItem("userEmail") || "";
  }

  useEffect(() => {
    const loadData = async () => {
      if (!email) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch sessions
        const userId = await fetchUserIdByEmail(email);
        if (userId) {
          const sessionData = await fetchUserSessions(userId);
          setSessions(sessionData);
        }

        // Fetch profile photo and role
        const token = localStorage.getItem("token");
        if (token) {
          const profileResponse = await fetch(`${API_URL}/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.user && profileData.user.profile_photo) {
              setProfilePhoto(profileData.user.profile_photo);
            }
            if (profileData.user && profileData.user.role === "admin") {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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


  const handlePhotoUpdate = (photoPath: string) => {
    setProfilePhoto(photoPath);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] relative overflow-x-hidden"> {/* Light gold/cream background */}
      {/* Decorative background shapes */}
      <div className="absolute -top-8 -left-8 w-64 h-64 bg-[#FFD700]/30 rounded-3xl rotate-6 z-0 pointer-events-none" /> {/* Gold */}
      <div className="absolute bottom-20 -right-8 w-32 h-32 bg-[#A0522D]/20 rounded-full z-0 pointer-events-none" /> {/* Brown */}
      <div className="absolute top-24 right-24 w-24 h-24 bg-[#C71585]/20 rounded-full z-0 pointer-events-none" /> {/* Rose */}
      <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-[#8e44ad]/20 rounded-full z-0 pointer-events-none" /> {/* Purple */}
      <div className="flex-1 relative z-10">
        {/* Main Content */}
        <div className="p-4 pt-0">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFD700] to-[#8e44ad] bg-clip-text text-transparent mb-2">
                Profile Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Manage your account and design sessions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card - Left */}
              <div className="lg:col-span-1">
                <Card className="bg-[#FFF9F3] border border-gray-200 shadow rounded-2xl overflow-hidden"> {/* Soft light gold/cream background */}
                  <div className="p-6 flex flex-col items-center justify-center">
                    <ProfilePhotoUpload
                      currentPhoto={profilePhoto}
                      userEmail={email}
                      onPhotoUpdate={handlePhotoUpdate}
                    />
                    <div className="text-center mt-2">
                      <h2 className="text-2xl font-bold mb-1 text-gray-800">Welcome Back!</h2>
                      <p className="text-gray-500">{email}</p>
                    </div>
                  </div>
                  <CardContent className="p-6 bg-[#FFF9F3] rounded-b-2xl"> {/* Soft light gold/cream background */}
                    <ProfileForm />
                  </CardContent>
                </Card>
              </div>

              {/* Sessions Card - Right */}
              <div className="lg:col-span-2">
                <Card className="bg-[#FFF9F3] border border-gray-200 shadow rounded-2xl"> {/* Soft light gold/cream background */}
                  <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Palette className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Design Sessions</h2>
                      <p className="text-gray-500">Continue your creative projects</p>
                    </div>
                  </div>
                  <CardContent className="p-6 bg-[#FFF9F3] rounded-b-2xl"> {/* Soft light gold/cream background */}
                    <SessionList />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="bg-[#FFF9F3] text-gray-900 border border-gray-200 shadow rounded-2xl"> {/* Soft light gold/cream background */}
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/30 rounded-lg">
                      <Clock className="h-6 w-6 text-[#A0522D]" />
                    </div>
                    <div>
                      <p className="text-[#A0522D] text-sm">Total Sessions</p>
                      <p className="text-2xl font-bold">
                        {loading ? "..." : getTotalSessions()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#FFF9F3] text-gray-900 border border-gray-200 shadow rounded-2xl"> {/* Soft light gold/cream background */}
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/30 rounded-lg">
                      <Settings className="h-6 w-6 text-[#8e44ad]" />
                    </div>
                    <div>
                      <p className="text-[#8e44ad] text-sm">Active Projects</p>
                      <p className="text-2xl font-bold">
                        {loading ? "..." : getActiveProjects()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#FFF9F3] text-gray-900 border border-gray-200 shadow rounded-2xl"> {/* Soft light gold/cream background */}
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/30 rounded-lg">
                      <User className="h-6 w-6 text-[#C71585]" />
                    </div>
                    <div>
                      <p className="text-[#C71585] text-sm">Account Status</p>
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