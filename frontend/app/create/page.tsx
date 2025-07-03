"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import WallCreator from "@/components/wall/WallCreator";

export default function CreatePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.replace("/login");
    }
  }, [router]);

  const handleWallSubmit = (settings: any) => {
    // Save wall settings to localStorage
    localStorage.setItem("wallSettings", JSON.stringify(settings));
    // Navigate to editor
    router.push("/editor");
  };

  return <WallCreator onSubmit={handleWallSubmit} />;
} 