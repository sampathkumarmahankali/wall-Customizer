"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  BarChart3,
  CreditCard,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  format: string[];
}

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  format: string;
  generatedAt: string;
  status: 'completed' | 'processing' | 'failed';
  downloadUrl?: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'user-activity',
    name: 'User Activity Report',
    description: 'Detailed user engagement and activity metrics',
    icon: Users,
    format: ['CSV', 'PDF', 'Excel']
  },
  {
    id: 'revenue-analytics',
    name: 'Revenue Analytics',
    description: 'Comprehensive revenue and subscription data',
    icon: CreditCard,
    format: ['CSV', 'PDF', 'Excel']
  },
  {
    id: 'content-moderation',
    name: 'Content Moderation Report',
    description: 'Flagged content and moderation actions',
    icon: Shield,
    format: ['CSV', 'PDF']
  },
  {
    id: 'growth-metrics',
    name: 'Growth Metrics',
    description: 'User growth, retention, and acquisition data',
    icon: TrendingUp,
    format: ['CSV', 'PDF', 'Excel']
  },
  {
    id: 'session-analytics',
    name: 'Session Analytics',
    description: 'Design session creation and usage patterns',
    icon: BarChart3,
    format: ['CSV', 'PDF']
  },
  {
    id: 'subscription-report',
    name: 'Subscription Report',
    description: 'Subscription status and payment information',
    icon: CreditCard,
    format: ['CSV', 'PDF', 'Excel']
  }
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('30');
  const [generating, setGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
    {
      id: '1',
      name: 'User Activity Report',
      type: 'user-activity',
      format: 'PDF',
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: '2',
      name: 'Revenue Analytics',
      type: 'revenue-analytics',
      format: 'Excel',
      generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: '3',
      name: 'Content Moderation Report',
      type: 'content-moderation',
      format: 'PDF',
      generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      downloadUrl: '#'
    }
  ]);

  const handleGenerateReport = async () => {
    if (!selectedReport || !selectedFormat) {
      alert('Please select a report type and format');
      return;
    }

    setGenerating(true);
    
    try {
      const token = localStorage.getItem("token");
      const reportType = reportTypes.find(r => r.id === selectedReport);
      
      // Create a new report entry
      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        name: reportType?.name || selectedReport,
        type: selectedReport,
        format: selectedFormat,
        generatedAt: new Date().toISOString(),
        status: 'processing'
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
      
      // Simulate report generation
      setTimeout(() => {
        setGeneratedReports(prev => 
          prev.map(report => 
            report.id === newReport.id 
              ? { ...report, status: 'completed', downloadUrl: '#' }
              : report
          )
        );
        setGenerating(false);
        alert('Report generated successfully!');
      }, 3000);
      
    } catch (error) {
      console.error('Report generation error:', error);
      setGenerating(false);
      alert('Failed to generate report. Please try again.');
    }
  };

  const handleDownloadReport = async (report: GeneratedReport) => {
    try {
      const token = localStorage.getItem("token");
      
      // This would call the actual download endpoint
      console.log('Downloading report:', report);
      
      // Simulate download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${report.name}-${new Date(report.generatedAt).toLocaleDateString()}.${report.format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const handleUseTemplate = (templateName: string) => {
    alert(`Template "${templateName}" selected. This would pre-fill the report configuration.`);
  };

  const getAvailableFormats = () => {
    const report = reportTypes.find(r => r.id === selectedReport);
    return report?.format || [];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary"><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and download comprehensive reports</p>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          
          return (
            <Card 
              key={report.id} 
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-indigo-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isSelected ? 'text-indigo-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{report.name}</CardTitle>
                    <p className="text-sm text-gray-500">{report.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {report.format.map((format) => (
                    <span 
                      key={format} 
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Configuration */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((report) => (
                      <SelectItem key={report.id} value={report.id}>
                        {report.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableFormats().map((format) => (
                      <SelectItem key={format} value={format}>
                        {format}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                onClick={handleGenerateReport}
                disabled={!selectedReport || !selectedFormat || generating}
                className="flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generatedReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    report.status === 'completed' ? 'bg-green-100' : 
                    report.status === 'processing' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <FileText className={`h-5 w-5 ${
                      report.status === 'completed' ? 'text-green-600' : 
                      report.status === 'processing' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-gray-500">
                      Generated {formatDate(report.generatedAt)} • {report.format} format
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(report.status)}
                  {report.status === 'completed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadReport(report)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Monthly Executive Summary</h4>
              <p className="text-sm text-gray-600 mb-3">
                High-level overview of key metrics for executive review
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleUseTemplate('Monthly Executive Summary')}
              >
                Use Template
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Weekly Operations Report</h4>
              <p className="text-sm text-gray-600 mb-3">
                Detailed operational metrics and user activity
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleUseTemplate('Weekly Operations Report')}
              >
                Use Template
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Quarterly Business Review</h4>
              <p className="text-sm text-gray-600 mb-3">
                Comprehensive quarterly performance analysis
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleUseTemplate('Quarterly Business Review')}
              >
                Use Template
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Custom Report Builder</h4>
              <p className="text-sm text-gray-600 mb-3">
                Create custom reports with specific metrics
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleUseTemplate('Custom Report Builder')}
              >
                Create Custom
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 