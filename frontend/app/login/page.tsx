"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Footer from "@/components/shared/Footer"
import { setToken } from "@/lib/auth";

const API_URL = "http://localhost:4000/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Login failed.")
        setLoading(false)
        return
      }
      if (data.token) {
        setToken(data.token);
      }
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userEmail", data.user.email)
      router.replace("/")
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="flex-1 flex flex-col justify-center items-center w-full px-2 py-8">
        {/* Welcome Card and Login Card Side by Side */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Welcome Card */}
          <div>
            <Card className="h-full min-h-[400px] md:min-h-[500px] shadow-2xl rounded-2xl flex flex-col justify-center bg-gradient-to-br from-indigo-200 via-purple-100 to-blue-100 border-0">
              <CardHeader>
                <CardTitle className="text-4xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Welcome to Wallora</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 text-center mb-4">
                  Unleash your creativity! Wallora lets you design, customize, and visualize beautiful wall layouts. Plan your gallery wall, decorate your room, or just explore ideas with ease and fun.
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Upload and arrange your own images</li>
                  <li>Choose from stunning wall backgrounds</li>
                  <li>Save and revisit your wall designs</li>
                  <li>Export your creations for sharing or printing</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          {/* Login Card */}
          <div>
            <Card className="w-full min-h-[400px] md:min-h-[500px] shadow-2xl rounded-2xl flex flex-col justify-center">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">Wallora Login</CardTitle>
                <CardDescription className="text-center">Sign in to access your wall editor</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
                  <div className="text-xs text-gray-500 text-center mt-2">
                    New user? <a href="/register" className="text-blue-600 underline">Register here</a>.
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Bottom Row: How to Use Wallora Card with Real Preview Image */}
        <div className="w-full max-w-2xl flex flex-col items-center">
          <Card className="w-full shadow-xl rounded-2xl flex flex-col items-center p-6 bg-gradient-to-br from-indigo-200 via-purple-100 to-blue-100 border-0">
            <img
              src="/uploads/mona-lisa.jpg"
              alt="Wallora wall design preview"
              className="w-full max-w-xl h-64 object-cover mx-auto mb-4 rounded-xl shadow-lg border border-gray-200 bg-white"
            />
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2 text-indigo-700">How to Use Wallora</h2>
              <p className="text-gray-600 text-base mb-2">
                1. <span className="font-semibold">Login</span> or register to get started.<br />
                2. <span className="font-semibold">Add images</span> and <span className="font-semibold">decor</span> to your wall.<br />
                3. <span className="font-semibold">Drag, resize, and arrange</span> items as you like.<br />
                4. <span className="font-semibold">Export</span> your design or save it for later!
              </p>
              <p className="text-gray-500 text-sm">The image above is a sample preview of what you can create with Wallora—arrange art, photos, and decor on beautiful backgrounds.</p>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
} 