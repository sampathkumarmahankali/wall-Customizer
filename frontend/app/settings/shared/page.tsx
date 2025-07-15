'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllSharedSessions } from '@/lib/shared';

export default function SharedSettingsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAllSharedSessions()
      .then((data) => {
        setSessions(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load shared sessions');
        setSessions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Shared Sessions Management</h1>
      <div className="overflow-x-auto rounded-xl shadow border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#FFF8E1]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Session</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Shared By</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Edited By</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Edited At</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created At</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Viewers</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Editors</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-red-400">{error}</td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">No shared sessions yet.</td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{session.session_name || ''}</td>
                  <td className="px-4 py-3">
                    <Badge variant={session.type === 'public' ? 'default' : 'secondary'} className={session.type === 'public' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                      {session.type ? session.type.charAt(0).toUpperCase() + session.type.slice(1) : ''}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{session.shared_by_email || ''}</td>
                  <td className="px-4 py-3 text-gray-700">{session.last_edited_by_email || ''}</td>
                  <td className="px-4 py-3 text-gray-700">{session.last_edited_at ? new Date(session.last_edited_at).toLocaleString() : ''}</td>
                  <td className="px-4 py-3 text-gray-700">{session.created_at ? new Date(session.created_at).toLocaleString() : ''}</td>
                  <td className="px-4 py-3 text-gray-700">{Array.isArray(session.viewers) ? session.viewers.length : ''}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {Array.isArray(session.editors)
                      ? session.editors.map((editor: string) => (
                          <span key={editor} className="inline-block bg-[#FFD700]/20 text-[#C71585] rounded px-2 py-1 text-xs mr-1 mb-1">
                            {editor}
                          </span>
                        ))
                      : session.editors
                      ? JSON.parse(session.editors).map((editor: string) => (
                          <span key={editor} className="inline-block bg-[#FFD700]/20 text-[#C71585] rounded px-2 py-1 text-xs mr-1 mb-1">
                            {editor}
                          </span>
                        ))
                      : ''}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline">Manage</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-8 text-sm text-gray-500">
        <p><strong>Public sessions</strong> are visible to anyone with the link. <strong>Private sessions</strong> are only accessible to invited users.</p>
        <p className="mt-2">You can manage who can view or edit each session, and see who last edited them for transparency and security.</p>
      </div>
    </div>
  );
} 