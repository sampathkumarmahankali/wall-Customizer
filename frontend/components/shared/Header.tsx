"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Home, FileText, Edit, BarChart3, PlusCircle, Shield, Settings, HelpCircle, Info, Mail, UserCog, Share2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { authenticatedFetch } from "@/lib/auth";

interface HeaderProps {
  showLogout?: boolean;
  showProfile?: boolean;
  className?: string;
  announcement?: string;
}

export default function Header({ showLogout = true, showProfile = true, className = "", announcement }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState<false | 'settings'>(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Helper to check login state and admin role
  const checkLogin = () => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
      setIsAdmin(localStorage.getItem("userRole") === "admin");
    }
  };

  useEffect(() => {
    checkLogin();
    // Listen for storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "isLoggedIn") {
        checkLogin();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Update login state on route change
  useEffect(() => {
    checkLogin();
  }, [pathname]);

  useEffect(() => {
    if (menuOpen === 'settings') {
      const handleClickOutside = (event: MouseEvent) => {
        if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
          setMenuOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    window.location.reload();
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Create", href: "/create", icon: PlusCircle },
    { name: "Editor", href: "/editor", icon: Edit },
  ];

  return (
    <>
      {/* Announcement Bar */}
      {announcement && (
        <div className="w-full bg-green-100 text-green-900 text-center py-2 text-sm font-medium border-b border-green-200">
          {announcement}
        </div>
      )}
      <header className={`w-full bg-gradient-to-r from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] shadow-md px-4 md:px-10 py-3 flex items-center justify-between z-50 border-b border-[#FFD700]/30 ${className}`}> {/* Enhanced background and border */}
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push("/")}> 
          <div className="p-2 bg-gradient-to-r from-[#FFD700] via-[#C71585] to-[#8e44ad] rounded-lg shadow-md flex items-center justify-center">
            {/* Candle/altar SVG icon for memorial feel */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="14" cy="22" rx="8" ry="4" fill="#FFD700" fillOpacity="0.25" />
              <rect x="10" y="10" width="8" height="10" rx="4" fill="#C71585" fillOpacity="0.7" />
              <rect x="12.5" y="4" width="3" height="8" rx="1.5" fill="#FFD700" />
              <ellipse cx="14" cy="4" rx="1.5" ry="2.5" fill="#FFD700" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-[#FFD700] via-[#C71585] to-[#8e44ad] bg-clip-text text-transparent tracking-tight drop-shadow-sm group-hover:drop-shadow-lg transition">MIALTER</span>
        </div>
        {/* Navigation Links */}
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map(link => (
            <button
              key={link.name}
              onClick={() => router.push(link.href)}
              className={`flex items-center gap-1 font-medium transition-colors
                ${pathname === link.href ? 'text-indigo-600 font-bold underline underline-offset-4' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => router.push("/admin")}
              className={`flex items-center gap-1 font-medium transition-colors
                ${pathname === "/admin" ? 'text-indigo-600 font-bold underline underline-offset-4' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              <Shield className="h-5 w-5" />
              Admin
            </button>
          )}
        </nav>
        {/* CTA & User Menu */}
        <div className="flex items-center gap-2">
          {/* Settings Button with Dropdown */}
          <div className="relative" ref={settingsRef}>
            <Button
              className="flex items-center gap-1 rounded-full px-4 py-2 font-semibold bg-[#FFD700] text-[#8e44ad] hover:bg-[#FF9800] hover:text-white transition-all border-none"
              onClick={() => setMenuOpen(menuOpen === 'settings' ? false : 'settings')}
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Button>
            {menuOpen === 'settings' && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 flex flex-col py-2 animate-fade-in">
                <button
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-800 text-left"
                  onClick={() => { setMenuOpen(false); router.push('/settings/shared'); }}
                >
                  <Share2 className="h-4 w-4 text-[#FF9800]" />
                  Edit Shared Options
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-800 text-left"
                  onClick={() => { setMenuOpen(false); router.push('/profile'); }}
                >
                  <UserCog className="h-4 w-4 text-[#8e44ad]" />
                  Change Profile
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-800 text-left"
                  onClick={() => { setMenuOpen(false); router.push('/'); }}
                >
                  <Info className="h-4 w-4 text-[#FFD700]" />
                  About
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-800 text-left"
                  onClick={() => { setMenuOpen(false); router.push('/contact'); }}
                >
                  <Mail className="h-4 w-4 text-[#C71585]" />
                  Contact
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-800 text-left"
                  onClick={() => { setMenuOpen(false); router.push('/'); }}
                >
                  <HelpCircle className="h-4 w-4 text-[#FF9800]" />
                  Help
                </button>
              </div>
            )}
          </div>
          {isLoggedIn && showProfile && (
            <Button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-1 rounded-full px-5 py-2 font-semibold bg-[#FF9800] text-white hover:bg-[#fb8c00] transition-all border-none"
            >
              <User className="h-5 w-5" />
              Profile
            </Button>
          )}
          {isLoggedIn && showLogout && (
            <Button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-full px-5 py-2 font-semibold bg-[#FF9800] text-white hover:bg-[#fb8c00] transition-all border-none"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          )}
          {!isLoggedIn && (
            <Button
              onClick={handleLogin}
              className="flex items-center gap-1 rounded-full px-5 py-2 font-semibold bg-[#FF9800] text-white hover:bg-[#fb8c00] transition-all border-none"
            >
              Login
            </Button>
          )}
          {/* Mobile menu toggle */}
          <button className="md:hidden ml-2 p-2 rounded hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-lg flex flex-col items-center py-4 gap-4 md:hidden z-50 border-t">
            {navLinks.map(link => (
              <button
                key={link.name}
                onClick={() => { router.push(link.href); setMenuOpen(false); }}
                className={`flex items-center gap-2 text-lg font-medium w-full justify-center transition-colors
                  ${pathname === link.href ? 'text-indigo-600 font-bold underline underline-offset-4 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600'}`}
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => { router.push("/admin"); setMenuOpen(false); }}
                className={`flex items-center gap-2 text-lg font-medium w-full justify-center transition-colors
                  ${pathname === "/admin" ? 'text-indigo-600 font-bold underline underline-offset-4 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600'}`}
              >
                <Shield className="h-5 w-5" />
                Admin
              </button>
            )}
            {isLoggedIn && showProfile && (
              <Button
                onClick={() => { router.push("/profile"); setMenuOpen(false); }}
                className="flex items-center gap-1 w-full justify-center rounded-full px-5 py-2 font-semibold bg-[#FF9800] text-white hover:bg-[#fb8c00] transition-all border-none"
              >
                <User className="h-5 w-5" />
                Profile
              </Button>
            )}
            {isLoggedIn && showLogout && (
              <Button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="flex items-center gap-1 w-full justify-center rounded-full px-5 py-2 font-semibold bg-[#FF9800] text-white hover:bg-[#fb8c00] transition-all border-none"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            )}
            {!isLoggedIn && (
              <Button
                onClick={() => { handleLogin(); setMenuOpen(false); }}
                className="flex items-center gap-1 w-full justify-center rounded-full px-5 py-2 font-semibold bg-[#FF9800] text-white hover:bg-[#fb8c00] transition-all border-none"
              >
                Login
              </Button>
            )}
          </div>
        )}
      </header>
    </>
  );
} 