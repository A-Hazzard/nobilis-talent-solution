'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Bell,
  Shield,
  Palette,
  Mail,
  Save,
} from 'lucide-react';

// Force dynamic rendering to prevent pre-rendering issues
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    profile: {
      name: 'Kareem Payne',
      email: 'kareem@payneleadership.com',
      phone: '+1 (555) 123-4567',
      bio: 'Leadership coach and consultant helping organizations develop strong leaders.',
      timezone: 'America/New_York',
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      leadAlerts: true,
      appointmentReminders: true,
      weeklyReports: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '24h',
      passwordExpiry: '90d',
    },
    appearance: {
      theme: 'light',
      sidebarCollapsed: false,
      compactMode: false,
    },
    business: {
      companyName: 'Payne Leadership',
      website: 'https://payneleadership.com',
      address: '123 Leadership Ave, New York, NY 10001',
      businessHours: '9:00 AM - 6:00 PM EST',
    },
  });

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and application preferences</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={settings.profile.name}
                onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.profile.email}
                onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={settings.profile.phone}
                onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={settings.profile.bio}
                onChange={(e) => handleSettingChange('profile', 'bio', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.profile.timezone}
                onValueChange={(value) => handleSettingChange('profile', 'timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
              <Switch
                id="sms-notifications"
                checked={settings.notifications.smsNotifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'smsNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="lead-alerts">Lead Alerts</Label>
                <p className="text-sm text-gray-500">Get notified of new leads</p>
              </div>
              <Switch
                id="lead-alerts"
                checked={settings.notifications.leadAlerts}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'leadAlerts', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="appointment-reminders">Appointment Reminders</Label>
                <p className="text-sm text-gray-500">Remind me of upcoming appointments</p>
              </div>
              <Switch
                id="appointment-reminders"
                checked={settings.notifications.appointmentReminders}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'appointmentReminders', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <p className="text-sm text-gray-500">Send weekly performance reports</p>
              </div>
              <Switch
                id="weekly-reports"
                checked={settings.notifications.weeklyReports}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'weeklyReports', checked)}
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
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <Switch
                id="two-factor"
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange('security', 'twoFactorAuth', checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout</Label>
              <Select
                value={settings.security.sessionTimeout}
                onValueChange={(value) => handleSettingChange('security', 'sessionTimeout', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="8h">8 hours</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-expiry">Password Expiry</Label>
              <Select
                value={settings.security.passwordExpiry}
                onValueChange={(value) => handleSettingChange('security', 'passwordExpiry', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="60d">60 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.appearance.theme}
                onValueChange={(value) => handleSettingChange('appearance', 'theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sidebar-collapsed">Collapse Sidebar</Label>
                <p className="text-sm text-gray-500">Minimize the sidebar by default</p>
              </div>
              <Switch
                id="sidebar-collapsed"
                checked={settings.appearance.sidebarCollapsed}
                onCheckedChange={(checked) => handleSettingChange('appearance', 'sidebarCollapsed', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-sm text-gray-500">Use more compact spacing</p>
              </div>
              <Switch
                id="compact-mode"
                checked={settings.appearance.compactMode}
                onCheckedChange={(checked) => handleSettingChange('appearance', 'compactMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={settings.business.companyName}
                  onChange={(e) => handleSettingChange('business', 'companyName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={settings.business.website}
                  onChange={(e) => handleSettingChange('business', 'website', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={settings.business.address}
                onChange={(e) => handleSettingChange('business', 'address', e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-hours">Business Hours</Label>
              <Input
                id="business-hours"
                value={settings.business.businessHours}
                onChange={(e) => handleSettingChange('business', 'businessHours', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 