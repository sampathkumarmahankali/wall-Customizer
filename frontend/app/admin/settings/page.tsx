"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Shield, 
  Bell, 
  Database,
  Globe,
  Key,
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Wallora',
    siteDescription: 'Wall Aura Creator',
    maintenanceMode: false,
    registrationEnabled: true,
    
    // Security Settings
    maxLoginAttempts: 5,
    sessionTimeout: 24,
    requireEmailVerification: true,
    twoFactorAuth: false,
    
    // Content Settings
    maxFileSize: 5,
    allowedFileTypes: ['jpg', 'png', 'gif'],
    autoModeration: true,
    profanityFilter: true,
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    
    // Payment Settings
    currency: 'USD',
    taxRate: 0.08,
    subscriptionEnabled: true,
    
    // Analytics Settings
    googleAnalytics: '',
    trackingEnabled: true,
    dataRetention: 90
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
    setSaveStatus('idle');
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveStatus('idle');
    
    try {
      const token = localStorage.getItem("token");
      
      // This would call the actual settings update endpoint
      console.log('Saving settings:', settings);
      
      // Simulate API call
      setTimeout(() => {
        setSaving(false);
        setSaveStatus('success');
        setHasChanges(false);
        
        // Reset success status after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Settings save error:', error);
      setSaving(false);
      setSaveStatus('error');
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  const getSaveButtonContent = () => {
    if (saving) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Saving...
        </>
      );
    }
    
    if (saveStatus === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4" />
          Saved Successfully
        </>
      );
    }
    
    if (saveStatus === 'error') {
      return (
        <>
          <AlertCircle className="h-4 w-4" />
          Save Failed
        </>
      );
    }
    
    return (
      <>
        <Save className="h-4 w-4" />
        Save Settings
      </>
    );
  };

  const getSaveButtonVariant = () => {
    if (saveStatus === 'success') return 'default';
    if (saveStatus === 'error') return 'destructive';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-2">Configure platform settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="secondary" className="text-orange-600 bg-orange-100">
              Unsaved Changes
            </Badge>
          )}
          <Button 
            onClick={handleSaveSettings}
            disabled={saving || !hasChanges}
            variant={getSaveButtonVariant()}
            className="flex items-center gap-2"
          >
            {getSaveButtonContent()}
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-sm text-gray-500">Temporarily disable the site for maintenance</p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="registrationEnabled">Allow User Registration</Label>
              <p className="text-sm text-gray-500">Enable or disable new user registrations</p>
            </div>
            <Switch
              id="registrationEnabled"
              checked={settings.registrationEnabled}
              onCheckedChange={(checked) => handleSettingChange('registrationEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              <p className="text-sm text-gray-500">Users must verify their email before accessing the platform</p>
            </div>
            <Switch
              id="requireEmailVerification"
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Enable 2FA for enhanced security</p>
            </div>
            <Switch
              id="twoFactorAuth"
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Content Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
              <Input
                id="allowedFileTypes"
                value={settings.allowedFileTypes.join(', ')}
                onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value.split(', '))}
                placeholder="jpg, png, gif"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoModeration">Auto Moderation</Label>
              <p className="text-sm text-gray-500">Automatically flag inappropriate content</p>
            </div>
            <Switch
              id="autoModeration"
              checked={settings.autoModeration}
              onCheckedChange={(checked) => handleSettingChange('autoModeration', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="profanityFilter">Profanity Filter</Label>
              <p className="text-sm text-gray-500">Filter inappropriate language from user content</p>
            </div>
            <Switch
              id="profanityFilter"
              checked={settings.profanityFilter}
              onCheckedChange={(checked) => handleSettingChange('profanityFilter', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={settings.smtpHost}
                onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                value={settings.smtpPort}
                onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpUser">SMTP Username</Label>
              <Input
                id="smtpUser"
                value={settings.smtpUser}
                onChange={(e) => handleSettingChange('smtpUser', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                value={settings.taxRate}
                onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="subscriptionEnabled">Enable Subscriptions</Label>
              <p className="text-sm text-gray-500">Allow users to subscribe to premium plans</p>
            </div>
            <Switch
              id="subscriptionEnabled"
              checked={settings.subscriptionEnabled}
              onCheckedChange={(checked) => handleSettingChange('subscriptionEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Analytics Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Analytics Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
            <Input
              id="googleAnalytics"
              value={settings.googleAnalytics}
              onChange={(e) => handleSettingChange('googleAnalytics', e.target.value)}
              placeholder="GA-XXXXXXXXX"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="trackingEnabled">Enable Tracking</Label>
              <p className="text-sm text-gray-500">Collect analytics data for platform insights</p>
            </div>
            <Switch
              id="trackingEnabled"
              checked={settings.trackingEnabled}
              onCheckedChange={(checked) => handleSettingChange('trackingEnabled', checked)}
            />
          </div>
          
          <div>
            <Label htmlFor="dataRetention">Data Retention (days)</Label>
            <Input
              id="dataRetention"
              type="number"
              value={settings.dataRetention}
              onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 