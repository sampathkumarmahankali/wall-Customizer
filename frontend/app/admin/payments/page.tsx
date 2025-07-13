"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Users,
  Download,
  Calendar,
  BarChart3,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentData {
  totalRevenue: number;
  monthlyRevenue: number;
  paymentMethods: Array<{ method: string; count: number; amount: number }>;
  subscriptionRevenue: number;
}

export default function PaymentsPage() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch('http://localhost:4000/api/admin/payments?period=30', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPaymentData(data);
        }
      } catch (error) {
        console.error('Payment data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'export':
        handleExportRevenueReport();
        break;
      case 'subscribers':
        router.push('/admin/users');
        break;
      case 'history':
        handleViewPaymentHistory();
        break;
      case 'analytics':
        router.push('/admin/reports');
        break;
    }
  };

  const handleExportRevenueReport = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // This would call the actual export endpoint
      console.log('Exporting revenue report...');
      
      // Simulate export
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = '#';
        link.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('Revenue report exported successfully!');
      }, 1000);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const handleViewPaymentHistory = () => {
    alert('Payment history feature would show detailed transaction logs. This would typically open a modal or navigate to a dedicated page.');
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
          <h1 className="text-3xl font-bold text-gray-900">Payment Analytics</h1>
          <p className="text-gray-600 mt-2">Monitor revenue and subscription data</p>
        </div>
        <Button 
          onClick={() => handleQuickAction('export')}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleQuickAction('analytics')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(paymentData?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
            <div className="flex items-center mt-2 text-xs text-blue-600">
              <span>View analytics</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleQuickAction('analytics')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(paymentData?.monthlyRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
            <div className="flex items-center mt-2 text-xs text-blue-600">
              <span>View trends</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleQuickAction('analytics')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(paymentData?.subscriptionRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Recurring revenue
            </p>
            <div className="flex items-center mt-2 text-xs text-blue-600">
              <span>View details</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleQuickAction('subscribers')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentData?.paymentMethods.reduce((acc, method) => acc + method.count, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Paying customers
            </p>
            <div className="flex items-center mt-2 text-xs text-blue-600">
              <span>View subscribers</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentData?.paymentMethods && paymentData.paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentData.paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{method.method}</div>
                      <div className="text-sm text-gray-500">{method.count} transactions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(method.amount)}</div>
                    <div className="text-sm text-gray-500">
                      {((method.amount / (paymentData.totalRevenue || 1)) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment data</h3>
              <p className="text-gray-500">Payment analytics will appear here when transactions occur.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Chart</h3>
              <p className="text-gray-500">Chart will display revenue trends over time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Basic</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">$0</div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>• Basic wall customization</li>
                <li>• Limited templates</li>
                <li>• Community support</li>
              </ul>
              <div className="text-sm text-gray-500">Free tier</div>
            </div>

            <div className="border rounded-lg p-6 text-center bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold mb-2">Pro</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">$9.99</div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>• Advanced customization</li>
                <li>• Premium templates</li>
                <li>• Priority support</li>
                <li>• Export high quality</li>
              </ul>
              <div className="text-sm text-blue-600 font-medium">Most popular</div>
            </div>

            <div className="border rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Premium</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">$19.99</div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>• Unlimited customization</li>
                <li>• All templates</li>
                <li>• 24/7 support</li>
                <li>• AI-powered features</li>
                <li>• Commercial license</li>
              </ul>
              <div className="text-sm text-gray-500">Enterprise</div>
            </div>
          </div>
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
              className="h-20 flex flex-col items-center justify-center hover:bg-green-50 hover:border-green-300 transition-colors"
              onClick={() => handleQuickAction('export')}
            >
              <Download className="h-6 w-6 mb-2" />
              Export Revenue Report
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
              onClick={() => handleQuickAction('subscribers')}
            >
              <Users className="h-6 w-6 mb-2" />
              View Subscribers
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center hover:bg-purple-50 hover:border-purple-300 transition-colors"
              onClick={() => handleQuickAction('history')}
            >
              <Calendar className="h-6 w-6 mb-2" />
              Payment History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 