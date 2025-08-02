'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Download, 
  Upload, 
  Building, 
  Users, 
  Target, 
  Mail, 
  CreditCard, 
  BarChart3, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

type ClientInfo = {
  // Company Branding
  companyName: string;
  logo: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  brandGuidelines: string;
  
  // Service Pricing
  services: Array<{
    name: string;
    description: string;
    price: number;
    duration: string;
    features: string[];
  }>;
  
  // Target Audience
  targetAudience: {
    primary: string;
    secondary: string;
    demographics: string;
    painPoints: string[];
    goals: string[];
  };
  
  // Content Strategy
  contentStrategy: {
    tone: string;
    messaging: string;
    keyMessages: string[];
    contentTypes: string[];
  };
  
  // Email Preferences
  emailPreferences: {
    templates: string[];
    branding: string;
    frequency: string;
    automation: string[];
  };
  
  // Payment Processing
  paymentRequirements: {
    methods: string[];
    currencies: string[];
    billing: string;
    refundPolicy: string;
  };
  
  // Analytics & Tracking
  analyticsNeeds: {
    platforms: string[];
    metrics: string[];
    reporting: string;
    integrations: string[];
  };
  
  // Integration Requirements
  integrations: {
    crm: string;
    calendar: string;
    email: string;
    payment: string;
    other: string[];
  };
  
  // Compliance Requirements
  compliance: {
    gdpr: boolean;
    hipaa: boolean;
    sox: boolean;
    other: string[];
  };
  
  // Performance Expectations
  performance: {
    loadTime: string;
    uptime: string;
    scalability: string;
    security: string;
  };
};

export default function ClientInfoPage() {
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    companyName: '',
    logo: '',
    brandColors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981'
    },
    brandGuidelines: '',
    services: [],
    targetAudience: {
      primary: '',
      secondary: '',
      demographics: '',
      painPoints: [],
      goals: []
    },
    contentStrategy: {
      tone: '',
      messaging: '',
      keyMessages: [],
      contentTypes: []
    },
    emailPreferences: {
      templates: [],
      branding: '',
      frequency: '',
      automation: []
    },
    paymentRequirements: {
      methods: [],
      currencies: ['USD'],
      billing: '',
      refundPolicy: ''
    },
    analyticsNeeds: {
      platforms: [],
      metrics: [],
      reporting: '',
      integrations: []
    },
    integrations: {
      crm: '',
      calendar: '',
      email: '',
      payment: '',
      other: []
    },
    compliance: {
      gdpr: false,
      hipaa: false,
      sox: false,
      other: []
    },
    performance: {
      loadTime: '< 3 seconds',
      uptime: '99.9%',
      scalability: 'High',
      security: 'Enterprise-grade'
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      // TODO: Implement actual save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(clientInfo, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'client-info.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setClientInfo(data);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const updateField = (section: keyof ClientInfo, field: string, value: any) => {
    setClientInfo(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Information</h1>
          <p className="text-gray-600">Gather and manage all client requirements and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" asChild>
            <label>
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {saveStatus === 'success' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Client information saved successfully!</AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to save client information. Please try again.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Audience
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Technical
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={clientInfo.companyName}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={clientInfo.logo}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, logo: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
              
              <div>
                <Label>Brand Colors</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="primaryColor" className="text-sm">Primary</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={clientInfo.brandColors.primary}
                      onChange={(e) => updateField('brandColors', 'primary', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor" className="text-sm">Secondary</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={clientInfo.brandColors.secondary}
                      onChange={(e) => updateField('brandColors', 'secondary', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accentColor" className="text-sm">Accent</Label>
                    <Input
                      id="accentColor"
                      type="color"
                      value={clientInfo.brandColors.accent}
                      onChange={(e) => updateField('brandColors', 'accent', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="brandGuidelines">Brand Guidelines</Label>
                <Textarea
                  id="brandGuidelines"
                  value={clientInfo.brandGuidelines}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, brandGuidelines: e.target.value }))}
                  placeholder="Describe brand guidelines, tone, voice, etc."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Service Pricing & Packages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Service Configuration</h3>
                <p className="text-gray-600 mb-4">
                  Configure your services, pricing, and packages here.
                </p>
                <Button variant="outline">
                  Add Service
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Target Audience Personas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryAudience">Primary Audience</Label>
                  <Input
                    id="primaryAudience"
                    value={clientInfo.targetAudience.primary}
                    onChange={(e) => updateField('targetAudience', 'primary', e.target.value)}
                    placeholder="e.g., C-suite executives"
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryAudience">Secondary Audience</Label>
                  <Input
                    id="secondaryAudience"
                    value={clientInfo.targetAudience.secondary}
                    onChange={(e) => updateField('targetAudience', 'secondary', e.target.value)}
                    placeholder="e.g., Mid-level managers"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="demographics">Demographics</Label>
                <Textarea
                  id="demographics"
                  value={clientInfo.targetAudience.demographics}
                  onChange={(e) => updateField('targetAudience', 'demographics', e.target.value)}
                  placeholder="Describe target demographics..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Pain Points</Label>
                <div className="space-y-2">
                  {clientInfo.targetAudience.painPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={point}
                        onChange={(e) => {
                          const newPoints = [...clientInfo.targetAudience.painPoints];
                          newPoints[index] = e.target.value;
                          updateField('targetAudience', 'painPoints', newPoints);
                        }}
                        placeholder="Enter pain point"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPoints = clientInfo.targetAudience.painPoints.filter((_, i) => i !== index);
                          updateField('targetAudience', 'painPoints', newPoints);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPoints = [...clientInfo.targetAudience.painPoints, ''];
                      updateField('targetAudience', 'painPoints', newPoints);
                    }}
                  >
                    Add Pain Point
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Content Strategy & Messaging
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tone">Brand Tone</Label>
                <Select value={clientInfo.contentStrategy.tone} onValueChange={(value) => updateField('contentStrategy', 'tone', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="authoritative">Authoritative</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="messaging">Core Messaging</Label>
                <Textarea
                  id="messaging"
                  value={clientInfo.contentStrategy.messaging}
                  onChange={(e) => updateField('contentStrategy', 'messaging', e.target.value)}
                  placeholder="Describe core messaging and value propositions..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label>Key Messages</Label>
                <div className="space-y-2">
                  {clientInfo.contentStrategy.keyMessages.map((message, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => {
                          const newMessages = [...clientInfo.contentStrategy.keyMessages];
                          newMessages[index] = e.target.value;
                          updateField('contentStrategy', 'keyMessages', newMessages);
                        }}
                        placeholder="Enter key message"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newMessages = clientInfo.contentStrategy.keyMessages.filter((_, i) => i !== index);
                          updateField('contentStrategy', 'keyMessages', newMessages);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newMessages = [...clientInfo.contentStrategy.keyMessages, ''];
                      updateField('contentStrategy', 'keyMessages', newMessages);
                    }}
                  >
                    Add Key Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Payment Methods</Label>
                  <div className="space-y-2 mt-2">
                    {['Credit Card', 'PayPal', 'Bank Transfer', 'Stripe', 'Square'].map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={method}
                          checked={clientInfo.paymentRequirements.methods.includes(method)}
                          onChange={(e) => {
                            const methods = e.target.checked
                              ? [...clientInfo.paymentRequirements.methods, method]
                              : clientInfo.paymentRequirements.methods.filter(m => m !== method);
                            updateField('paymentRequirements', 'methods', methods);
                          }}
                        />
                        <Label htmlFor={method} className="text-sm">{method}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="billing">Billing Preferences</Label>
                  <Textarea
                    id="billing"
                    value={clientInfo.paymentRequirements.billing}
                    onChange={(e) => updateField('paymentRequirements', 'billing', e.target.value)}
                    placeholder="Describe billing preferences..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Analytics & Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics & Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Analytics Platforms</Label>
                  <div className="space-y-2 mt-2">
                    {['Google Analytics', 'Facebook Pixel', 'Hotjar', 'Mixpanel', 'Custom'].map((platform) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={platform}
                          checked={clientInfo.analyticsNeeds.platforms.includes(platform)}
                          onChange={(e) => {
                            const platforms = e.target.checked
                              ? [...clientInfo.analyticsNeeds.platforms, platform]
                              : clientInfo.analyticsNeeds.platforms.filter(p => p !== platform);
                            updateField('analyticsNeeds', 'platforms', platforms);
                          }}
                        />
                        <Label htmlFor={platform} className="text-sm">{platform}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="reporting">Reporting Requirements</Label>
                  <Textarea
                    id="reporting"
                    value={clientInfo.analyticsNeeds.reporting}
                    onChange={(e) => updateField('analyticsNeeds', 'reporting', e.target.value)}
                    placeholder="Describe reporting needs..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {[
                    { key: 'gdpr', label: 'GDPR Compliance' },
                    { key: 'hipaa', label: 'HIPAA Compliance' },
                    { key: 'sox', label: 'SOX Compliance' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={key}
                        checked={clientInfo.compliance[key as keyof typeof clientInfo.compliance] as boolean}
                        onChange={(e) => updateField('compliance', key, e.target.checked)}
                      />
                      <Label htmlFor={key} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
                
                <div>
                  <Label htmlFor="otherCompliance">Other Compliance</Label>
                  <Textarea
                    id="otherCompliance"
                    value={clientInfo.compliance.other.join(', ')}
                    onChange={(e) => updateField('compliance', 'other', e.target.value.split(', ').filter(Boolean))}
                    placeholder="Enter other compliance requirements..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Performance Expectations */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Expectations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="loadTime">Load Time</Label>
                    <Input
                      id="loadTime"
                      value={clientInfo.performance.loadTime}
                      onChange={(e) => updateField('performance', 'loadTime', e.target.value)}
                      placeholder="< 3 seconds"
                    />
                  </div>
                  <div>
                    <Label htmlFor="uptime">Uptime</Label>
                    <Input
                      id="uptime"
                      value={clientInfo.performance.uptime}
                      onChange={(e) => updateField('performance', 'uptime', e.target.value)}
                      placeholder="99.9%"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="scalability">Scalability</Label>
                  <Select value={clientInfo.performance.scalability} onValueChange={(value) => updateField('performance', 'scalability', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="security">Security Level</Label>
                  <Select value={clientInfo.performance.security} onValueChange={(value) => updateField('performance', 'security', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Enhanced">Enhanced</SelectItem>
                      <SelectItem value="Enterprise-grade">Enterprise-grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 