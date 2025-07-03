import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Mock session data type
interface Session {
  id: string;
  name: string;
  updatedAt: string;
}

const fetchUserIdByEmail = async (email: string): Promise<string | null> => {
  const res = await fetch(`http://localhost:4000/api/userid-by-email/${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.userId;
};

// Mock fetch function (replace with real API later)
const fetchUserSessions = async (userId: string): Promise<Session[]> => {
  if (!userId) return [];
  const res = await fetch(`http://localhost:4000/api/sessions/${userId}`);
  if (!res.ok) return [];
  const data = await res.json();
  // Map backend fields to frontend Session type
  return data.map((s: any) => ({
    id: s.id.toString(),
    name: s.name,
    updatedAt: s.updated_at,
  }));
};

const SessionList: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    console.log("DEBUG: userEmail from localStorage:", email);
    if (!email) {
      setSessions([]);
      setLoading(false);
      setError("No user email found.");
      return;
    }
    fetchUserIdByEmail(email).then((userId) => {
      console.log("DEBUG: userId fetched from backend:", userId);
      if (!userId) {
        setSessions([]);
        setLoading(false);
        setError("User not found for email: " + email);
        return;
      }
      fetchUserSessions(userId).then((data) => {
        setSessions(data);
        setLoading(false);
      });
    });
  }, []);

  const handleSessionClick = (sessionId: string) => {
    router.push(`/editor?sessionId=${sessionId}`);
  };

  // Debug log to verify sessions before rendering
  console.log("DEBUG: sessions to render:", sessions);

  if (loading) return <div>Loading sessions...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-2">Your Edit Sessions</h2>
      {sessions.length === 0 ? (
        <div>No sessions found.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="py-2 cursor-pointer hover:bg-gray-100 rounded px-2"
              onClick={() => handleSessionClick(session.id)}
            >
              <div className="font-medium">{session.name}</div>
              <div className="text-xs text-gray-500">Last edited: {session.updatedAt}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SessionList; 