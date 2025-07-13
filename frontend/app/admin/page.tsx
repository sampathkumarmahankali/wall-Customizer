"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BarChart3, 
  TrendingUp, 
  Crown,
  Download,
  Calendar,
  Activity,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  todaySessions: number;
  premiumUsers: number;
}

interface AnalyticsData {
  registrationTrend: Array<{ date: string; count: number }>;
  sessionTrend: Array<{ date: string; count: number }>;
  hourlyActivity: Array<{ hour: number; count: number }>;
  subscriptionStats: Array<{ subscription_status: string; count: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch dashboard stats
        const statsResponse = await fetch('http://localhost:4000/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Fetch analytics data
        const analyticsResponse = await fetch('http://localhost:4000/api/admin/analytics?period=30', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (statsResponse.ok && analyticsResponse.ok) {
          const statsData = await statsResponse.json();
          const analyticsData = await analyticsResponse.json();
          
          setStats(statsData);
          setAnalytics(analyticsData);
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleExportUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:4000/api/admin/export/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users-export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'users':
        router.push('/admin/users');
        break;
      case 'analytics':
        router.push('/admin/reports');
        break;
      case 'export':
        handleExportUsers();
        break;
      case 'payments':
        router.push('/admin/payments');
        break;
      case 'moderation':
        router.push('/admin/moderation');
        break;
      case 'settings':
        router.push('/admin/settings');
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your Wallora platform</p>
        </div>
        <Button onClick={handleExportUsers} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Users
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleQuickAction('users')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
            <div className="flex items-center mt-2 text-xs text-blue-600">
              <span>View details</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleQuickAction('analytics')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active in last 30 days
            </p>
            <div className="flex items-center mt-2 text-xs text-blue-600">
              <span>View analytics</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleQuickAction('analytics')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              All design sessions
            </p>
            <div className="flex items-center mt-2 text-xs text-blue-600">
              <span>View reports</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleQuickAction('payments')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.premiumUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Premium subscribers
            </p>
            <div className="flex items-center mt-2 text-xs text-blue-600">
              <span>View payments</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Registration Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.registrationTrend && analytics.registrationTrend.length > 0 ? (
              <div className="space-y-2">
                {analytics.registrationTrend.slice(-7).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.date}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...analytics.registrationTrend.map(r => r.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No registration data available</p>
            )}
          </CardContent>
        </Card>

        {/* Session Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Session Creation Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.sessionTrend && analytics.sessionTrend.length > 0 ? (
              <div className="space-y-2">
                {analytics.sessionTrend.slice(-7).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.date}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...analytics.sessionTrend.map(s => s.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No session data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.subscriptionStats && analytics.subscriptionStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.subscriptionStats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{stat.count}</div>
                  <div className="text-sm text-gray-600 capitalize">{stat.subscription_status}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No subscription data available</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
              onClick={() => handleQuickAction('users')}
            >
              <Users className="h-6 w-6 mb-2" />
              Manage Users
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center hover:bg-green-50 hover:border-green-300 transition-colors"
              onClick={() => handleQuickAction('analytics')}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center hover:bg-purple-50 hover:border-purple-300 transition-colors"
              onClick={() => handleQuickAction('export')}
            >
              <Download className="h-6 w-6 mb-2" />
              Export Reports
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
              onClick={() => handleQuickAction('payments')}
            >
              <Crown className="h-6 w-6 mb-2" />
              Payment Analytics
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors"
              onClick={() => handleQuickAction('moderation')}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              Content Moderation
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors"
              onClick={() => handleQuickAction('settings')}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              Platform Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 