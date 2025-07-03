"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const API_URL = "http://localhost:4000/api";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Get current user from localStorage
    if (typeof window !== "undefined") {
      const userEmail = localStorage.getItem("userEmail") || "";
      setEmail(userEmail);
    }
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // First, verify current password
      const verifyRes = await fetch(`${API_URL}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: currentPassword })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.valid) {
        setError("Current password is incorrect.");
        setLoading(false);
        return;
      }
      // If valid, update password
      const res = await fetch(`${API_URL}/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password.");
        setLoading(false);
        return;
      }
      setSuccess("Password updated successfully!");
      setNewPassword("");
      setCurrentPassword("");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <Card className="w-full max-w-md shadow-lg">
        <div className="flex justify-end p-4">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
        </div>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">User Profile</CardTitle>
          <CardDescription className="text-center">Manage your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label className="block mb-1">Email</Label>
            <Input value={email} disabled className="mb-2" />
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center">{success}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Updating..." : "Update Password"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 