'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  FileText, 
  Eye, 
  Lock, 
  Mail, 
  Building, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Users,
  Globe,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: FileText },
    { id: 'information-collection', title: 'Information We Collect', icon: Eye },
    { id: 'how-we-use', title: 'How We Use Your Information', icon: Lock },
    { id: 'legal-basis', title: 'Legal Basis for Processing', icon: CheckCircle },
    { id: 'data-sharing', title: 'Data Sharing', icon: Users },
    { id: 'data-retention', title: 'Data Retention', icon: Clock },
    { id: 'your-rights', title: 'Your Rights', icon: Shield },
    { id: 'third-party-links', title: 'Third-Party Links', icon: Globe },
    { id: 'childrens-privacy', title: "Children's Privacy", icon: AlertCircle },
    { id: 'policy-changes', title: 'Changes to Policy', icon: FileText },
    { id: 'contact', title: 'Contact Us', icon: Mail }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Table of Contents */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Table of Contents</h2>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                          activeSection === section.id
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span>{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">
                {/* Effective Date */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Effective Date</h3>
                  </div>
                  <p className="text-blue-800">
                    <strong>Effective Date:</strong> July 31, 2025 | <strong>Last Updated:</strong> September 1, 2025
                  </p>
                </div>

                {/* Introduction */}
                <section id="introduction" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      Nobilis Talent Solutions ("we," "our," "us") respects your privacy and is committed to 
                      protecting your personal data. This Privacy Policy explains how we collect, use, and protect 
                      your information when you visit our website and use our services.
                    </p>
                  </div>
                </section>

                {/* Information We Collect */}
                <section id="information-collection" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <Eye className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-4">a) Information You Provide:</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Name and contact information</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Email address</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Billing and payment details</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Organization information</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Phone number</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Information provided through forms, subscriptions, or inquiries</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-4">b) Information Collected Automatically:</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>IP address and location data</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Browser type and version</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Pages visited and time spent on our site</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Device information and operating system</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Cookies and similar tracking technologies</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Referral sources and search terms</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* How We Use Your Information */}
                <section id="how-we-use" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <Lock className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <p className="text-gray-700 mb-4">We use your personal data to:</p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Deliver consulting services you request</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Process payments securely</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Respond to inquiries and provide customer support</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Send newsletters and updates (with your consent)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Improve website functionality and user experience</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Comply with legal and regulatory requirements</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Personalize your experience on our platform</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Legal Basis for Processing */}
                <section id="legal-basis" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">3. Legal Basis for Processing (GDPR)</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 mb-4">We process your personal data under the following lawful bases:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">Contractual necessity</h4>
                        <p className="text-green-700 text-sm">to provide requested services</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">Consent</h4>
                        <p className="text-blue-700 text-sm">for newsletters and marketing emails</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-2">Legal obligation</h4>
                        <p className="text-purple-700 text-sm">to comply with applicable laws</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-800 mb-2">Legitimate interests</h4>
                        <p className="text-orange-700 text-sm">to improve our services and website</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Data Sharing */}
                <section id="data-sharing" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <Users className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">4. Data Sharing</h2>
                  </div>
                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <div className="flex items-start space-x-3 mb-4">
                      <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                      <p className="text-yellow-800 font-semibold">
                        We do not sell or rent your personal information.
                      </p>
                    </div>
                    <p className="text-gray-700 mb-4">We may share data with:</p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>Payment processors for secure transactions</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>Service providers assisting in website operations</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>Legal authorities when required by law</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>Business partners with your explicit consent</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Data Retention */}
                <section id="data-retention" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <Clock className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">5. Data Retention</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      We keep your information only as long as necessary to fulfill the purposes for which it was 
                      collected or as required by law. When data is no longer needed, we securely delete or anonymize it.
                    </p>
                  </div>
                </section>

                {/* Your Rights */}
                <section id="your-rights" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">6. Your Rights (GDPR & CCPA)</h2>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <p className="text-gray-700 mb-4">You have the right to:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Access, correct, or delete your data</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Request a copy of your personal data</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Withdraw consent for marketing communications</span>
                        </li>
                      </ul>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Opt out of data sales (we do not sell data)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Data portability (receive your data in a structured format)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>File a complaint with a data protection authority</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                      <p className="text-sm text-blue-800">
                        <strong>To exercise your rights:</strong> Contact us at nobilis.talent@gmail.com
                      </p>
                    </div>
                  </div>
                </section>

                {/* Third-Party Links */}
                <section id="third-party-links" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <Globe className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">7. Third-Party Links</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      Our website may contain links to external sites. We are not responsible for their privacy 
                      practices. We encourage you to review the privacy policies of any third-party sites you visit.
                    </p>
                  </div>
                </section>

                {/* Children's Privacy */}
                <section id="childrens-privacy" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <AlertCircle className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">8. Children's Privacy</h2>
                  </div>
                  <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                    <p className="text-gray-700 leading-relaxed">
                      We do not knowingly collect data from children under 13. If you believe we have collected 
                      information from a child under 13, please contact us immediately.
                    </p>
                  </div>
                </section>

                {/* Changes to Policy */}
                <section id="policy-changes" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">9. Changes to This Policy</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      We may update this Privacy Policy periodically. Changes will be posted on this page with 
                      an updated "Last Updated" date. We encourage you to review this policy regularly.
                    </p>
                  </div>
                </section>

                {/* Contact Information */}
                <section id="contact" className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Mail className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">10. Contact Us</h2>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <p className="text-gray-700 mb-4">If you have questions about this Privacy Policy, contact us at:</p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <a 
                          href="mailto:nobilis.talent@gmail.com" 
                          className="text-blue-600 hover:text-blue-500 hover:underline"
                        >
                          nobilis.talent@gmail.com
                        </a>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Building className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-gray-700">
                          <p>3344 Cobb Parkway</p>
                          <p>STE 200</p>
                          <p>Acworth, GA, 30101</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
