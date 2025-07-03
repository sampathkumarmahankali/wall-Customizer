"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import WallEditor from "@/components/wall/WallEditor";

export default function EditorPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.replace("/login");
    }
  }, [router]);

  return <WallEditor />;
} 