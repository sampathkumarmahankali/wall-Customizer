"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
        {/* Left Side: About Section */}
        <div className="hidden md:flex flex-col justify-center h-full p-10 rounded-l-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 shadow-xl">
          <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Welcome to Wallora</h1>
          <p className="text-lg text-gray-700 mb-6">
            <span className="font-semibold text-indigo-600">Wallora</span> is your creative space to design, customize, and visualize beautiful wall layouts. Upload your own images, drag and arrange them, experiment with backgrounds, and save your favorite designs. Whether you're planning a gallery wall, decorating a room, or just exploring ideas, Wallora makes it easy and fun!
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Upload and arrange your own images</li>
            <li>Choose from stunning wall backgrounds</li>
            <li>Save and revisit your wall designs</li>
            <li>Export your creations for sharing or printing</li>
          </ul>
        </div>
        {/* Right Side: Login Card */}
        <div className="flex justify-center items-center md:justify-end h-full p-6">
          <Card className="w-full max-w-md shadow-2xl rounded-2xl">
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
    </div>
  )
} 