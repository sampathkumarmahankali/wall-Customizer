"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Footer from "@/components/shared/Footer"
import { setToken } from "@/lib/auth";

const API_URL = "http://localhost:4000/api"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Registration failed.")
        setLoading(false)
        return
      }
      if (data.token) {
        setToken(data.token);
      }
      setSuccess("Registration successful! Redirecting...")
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userEmail", email)
      const redirect = searchParams.get('redirect');
      setTimeout(() => {
        if (redirect) {
          router.replace(redirect);
        } else {
          router.replace("/");
        }
      }, 1000)
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] flex flex-col overflow-x-hidden"> {/* Light gold/cream background */}
      {/* Decorative background shapes */}
      <div className="absolute top-20 -left-8 w-64 h-64 bg-[#FFD700]/30 rounded-3xl rotate-6 z-0 pointer-events-none" /> {/* Gold */}
      <div className="absolute -bottom-8 right-8 w-32 h-32 bg-[#A0522D]/20 rounded-full z-0 pointer-events-none" /> {/* Brown */}
      <div className="absolute top-32 right-24 w-24 h-24 bg-[#C71585]/20 rounded-full z-0 pointer-events-none" /> {/* Rose */}
      <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-[#8e44ad]/20 rounded-full z-0 pointer-events-none" /> {/* Purple */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <Card className="w-full max-w-md shadow-lg mt-12">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-green-600 bg-clip-text text-transparent tracking-tight text-center">Register</CardTitle>
            <CardDescription className="text-center">Create a new account to use MIALTER</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm text-center">{success}</div>}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Registering..." : "Register"}</Button>
              <div className="text-xs text-gray-500 text-center mt-2">
                Already have an account? {(() => {
                  const redirect = searchParams.get('redirect');
                  const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';
                  return <a href={loginHref} className="text-blue-600 underline">Login</a>;
                })()}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
} 