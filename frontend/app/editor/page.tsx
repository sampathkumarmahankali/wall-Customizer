"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import WallEditor from "@/components/wall/WallEditor";

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [initialSettings, setInitialSettings] = useState<any>(null);
  const [loading, setLoading] = useState(!!sessionId);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (sessionId) {
      setLoading(true);
      fetch(`http://localhost:4000/api/session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setInitialSettings(data.data); // .data because backend returns { data: ... }
          setLoading(false);
        });
    }
  }, [sessionId]);

  if (loading) return <div>Loading session...</div>;

  return <WallEditor initialSettings={initialSettings} />;
} 