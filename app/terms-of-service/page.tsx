'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Scale, 
  FileText, 
  Shield, 
  Mail, 
  Building, 
  DollarSign, 
  AlertTriangle, 
  ArrowLeft,
  CheckCircle,
  Users,
  Clock,
  BookOpen,
  Gavel,
  Phone
} from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: FileText },
    { id: 'eligibility', title: 'Eligibility', icon: Shield },
    { id: 'services-provided', title: 'Services Provided', icon: Building },
    { id: 'payments-billing', title: 'Payments & Billing', icon: DollarSign },
    { id: 'cancellations-refunds', title: 'Cancellations & Refunds', icon: AlertTriangle },
    { id: 'intellectual-property', title: 'Intellectual Property', icon: BookOpen },
    { id: 'user-responsibilities', title: 'User Responsibilities', icon: Users },
    { id: 'limitation-liability', title: 'Limitation of Liability', icon: Gavel },
    { id: 'disclaimer-warranties', title: 'Disclaimer of Warranties', icon: AlertTriangle },
    { id: 'privacy', title: 'Privacy', icon: Shield },
    { id: 'governing-law', title: 'Governing Law', icon: Scale },
    { id: 'terms-changes', title: 'Changes to Terms', icon: FileText },
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
              <Scale className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
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
                      Welcome to Nobilis Talent Solutions ("Company," "we," "our," or "us"). These Terms of
                      Service ("Terms") govern your use of our website and any services we provide (collectively, 
                      the "Services"). By accessing or using our Site or Services, you agree to these Terms. 
                      If you do not agree, please do not use our Services.
                    </p>
                  </div>
                </section>

                {/* Eligibility */}
                <section id="eligibility" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">1. Eligibility</h2>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          You must be at least 18 years old to use our Services. By using our Services, you represent and
                          warrant that you meet this requirement.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Services Provided */}
                <section id="services-provided" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <Building className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">2. Services Provided</h2>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <p className="text-gray-700 leading-relaxed">
                      Nobilis Talent Solutions provides coaching and talent management services, including but not
                      limited to leadership development, organizational development, and related solutions.
                    </p>
                  </div>
                </section>

                {/* Payments & Billing */}
                <section id="payments-billing" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">3. Payments & Billing</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                      <div className="flex items-start space-x-3 mb-4">
                        <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
                        <h3 className="font-semibold text-yellow-800">Important Payment Information</h3>
                      </div>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>All fees for Services will be clearly communicated prior to engagement.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>Payments must be made in U.S. dollars through approved methods on our Site.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>Late payments may result in suspension or termination of Services.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Cancellations & Refunds */}
                <section id="cancellations-refunds" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <AlertTriangle className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">4. Cancellations & Refunds</h2>
                  </div>
                  <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-red-800 mb-2">Consulting Engagements:</h3>
                        <p className="text-gray-700">
                          Cancellation policies will be outlined in your individual service agreement.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-800 mb-2">Digital Products or Events:</h3>
                        <p className="text-gray-700">
                          Unless otherwise stated, payments for digital products or event registrations are non-refundable.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Intellectual Property */}
                <section id="intellectual-property" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">5. Intellectual Property</h2>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <p className="text-gray-700 mb-4">
                      All content on this Site, including text, graphics, logos, and materials provided during Services,
                      is owned by Nobilis Talent Solutions or our licensors and is protected by copyright and
                      trademark laws.
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>You may not copy, distribute, or reproduce our materials without prior written consent.</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* User Responsibilities */}
                <section id="user-responsibilities" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <Users className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">6. User Responsibilities</h2>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <p className="text-gray-700 mb-4">You agree to:</p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Provide accurate and complete information when engaging our Services.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Use our Site and Services only for lawful purposes.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Not attempt to interfere with or compromise our Site's security.</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Limitation of Liability */}
                <section id="limitation-liability" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <Gavel className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">7. Limitation of Liability</h2>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-6 w-6 text-orange-600 mt-0.5" />
                      <p className="text-gray-700 leading-relaxed">
                        To the maximum extent permitted by law, Nobilis Talent Solutions will not be liable for any
                        indirect, incidental, or consequential damages arising from your use of our Services or Site.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Disclaimer of Warranties */}
                <section id="disclaimer-warranties" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <AlertTriangle className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">8. Disclaimer of Warranties</h2>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <p className="text-gray-700 leading-relaxed">
                      Our Services are provided "as is" without warranties of any kind, whether express or implied,
                      including warranties of merchantability, fitness for a particular purpose, or non-infringement.
                    </p>
                  </div>
                </section>

                {/* Privacy */}
                <section id="privacy" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">9. Privacy</h2>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <p className="text-gray-700 leading-relaxed">
                      Your use of our Services is also governed by our Privacy Policy.
                    </p>
                    <div className="mt-4">
                      <Link href="/privacy-policy">
                        <Button variant="outline" size="sm" className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>View Privacy Policy</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </section>

                {/* Governing Law */}
                <section id="governing-law" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <Scale className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">10. Governing Law</h2>
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                    <p className="text-gray-700 leading-relaxed">
                      These Terms are governed by the laws of the State of Georgia, United States, without regard to
                      its conflict of laws principles.
                    </p>
                  </div>
                </section>

                {/* Changes to Terms */}
                <section id="terms-changes" className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">11. Changes to These Terms</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      We may update these Terms at any time. Updates will be posted on this page with a new "Last
                      Updated" date. Continued use of the Services after changes constitutes your acceptance of the
                      new Terms.
                    </p>
                  </div>
                </section>

                {/* Contact Information */}
                <section id="contact" className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Mail className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">12. Contact Us</h2>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <p className="text-gray-700 mb-4">If you have questions about these Terms, contact us at:</p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <a 
                          href="mailto:support@nobilistalent.com" 
                          className="text-blue-600 hover:text-blue-500 hover:underline"
                        >
                          support@nobilistalent.com
                        </a>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-blue-600" />
                        <a 
                          href="tel:+16789206605" 
                          className="text-blue-600 hover:text-blue-500 hover:underline"
                        >
                          (678) 920-6605
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
