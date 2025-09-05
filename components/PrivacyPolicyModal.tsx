'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Shield, Eye, Lock, Mail, Building } from 'lucide-react';

interface PrivacyPolicyModalProps {
  children: React.ReactNode;
  onAccept?: (accepted: boolean) => void;
  showCheckbox?: boolean;
  required?: boolean;
}

export default function PrivacyPolicyModal({ 
  children, 
  onAccept, 
  showCheckbox = false, 
  required = false 
}: PrivacyPolicyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    onAccept?.(true);
    setIsOpen(false);
  };

  const handleDecline = () => {
    if (required) return; // Don't allow declining if required
    setAccepted(false);
    onAccept?.(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
              <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 mx-auto">
          <DialogHeader className="p-4 sm:p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Privacy Policy
            </DialogTitle>
          </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] px-4 sm:px-6">
          <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
            {/* Effective Date */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Effective Date:</strong> July 31, 2025 | <strong>Last Updated:</strong> September 1, 2025
              </p>
            </div>

            {/* Introduction */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nobilis Talent Solutions ("we," "our," "us") respects your privacy and is committed to 
                protecting your personal data. This Privacy Policy explains how we collect, use, and protect 
                your information when you visit our website and use our services.
              </p>
            </div>

            {/* Information We Collect */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                1. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">a) Information You Provide:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Name and contact information</li>
                    <li>Email address</li>
                    <li>Billing and payment details</li>
                    <li>Organization information</li>
                    <li>Phone number</li>
                    <li>Information provided through forms, subscriptions, or inquiries</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">b) Information Collected Automatically:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>IP address and location data</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent on our site</li>
                    <li>Device information and operating system</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Referral sources and search terms</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-3">We use your personal data to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Deliver consulting services you request</li>
                <li>Process payments securely</li>
                <li>Respond to inquiries and provide customer support</li>
                <li>Send newsletters and updates (with your consent)</li>
                <li>Improve website functionality and user experience</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Personalize your experience on our platform</li>
              </ul>
            </div>


            {/* Legal Basis for Processing */}
            <div>
              <h2 className="text-xl font-semibold mb-3">3. Legal Basis for Processing (GDPR)</h2>
              <p className="text-gray-700 mb-3">We process your personal data under the following lawful bases:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>Contractual necessity:</strong> to provide requested services</li>
                <li><strong>Consent:</strong> for newsletters and marketing emails</li>
                <li><strong>Legal obligation:</strong> to comply with applicable laws</li>
                <li><strong>Legitimate interests:</strong> to improve our services and website</li>
              </ul>
            </div>

            {/* Data Sharing */}
            <div>
              <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  We do not sell or rent your personal information. We may share data with:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Payment processors for secure transactions</li>
                  <li>Service providers assisting in website operations</li>
                  <li>Legal authorities when required by law</li>
                  <li>Business partners with your explicit consent</li>
                </ul>
              </div>
            </div>

            {/* Data Retention */}
            <div>
              <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
              <p className="text-gray-700">
                We keep your information only as long as necessary to fulfill the purposes for which it was 
                collected or as required by law. When data is no longer needed, we securely delete or anonymize it.
              </p>
            </div>

            {/* Your Rights */}
            <div>
              <h2 className="text-xl font-semibold mb-3">6. Your Rights (GDPR & CCPA)</h2>
              <p className="text-gray-700 mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Access, correct, or delete your data</li>
                <li>Request a copy of your personal data</li>
                <li>Withdraw consent for marketing communications</li>
                <li>Opt out of data sales (we do not sell data)</li>
                <li>Data portability (receive your data in a structured format)</li>
                <li>File a complaint with a data protection authority</li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-3">
                <p className="text-sm text-blue-800">
                  <strong>To exercise your rights:</strong> Contact us at support@nobilistalent.com
                </p>
              </div>
            </div>

            {/* Third-Party Links */}
            <div>
              <h2 className="text-xl font-semibold mb-3">7. Third-Party Links</h2>
              <p className="text-gray-700">
                Our website may contain links to external sites. We are not responsible for their privacy 
                practices. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
              <p className="text-gray-700">
                We do not knowingly collect data from children under 13. If you believe we have collected 
                information from a child under 13, please contact us immediately.
              </p>
            </div>

            {/* Changes to Policy */}
            <div>
              <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy periodically. Changes will be posted on this page with 
                an updated "Last Updated" date. We encourage you to review this policy regularly.
              </p>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                10. Contact Us
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-gray-700 mb-2">If you have questions about this Privacy Policy, contact us at:</p>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <a href="mailto:support@nobilistalent.com" className="text-blue-600 hover:underline">
                      support@nobilistalent.com
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span>3344 Cobb Parkway<br />STE 200<br />Acworth, GA, 30101</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer with Actions */}
        <div className="border-t p-4 sm:p-6">
          {showCheckbox ? (
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="privacy-accept" 
                  checked={accepted}
                  onCheckedChange={(checked) => setAccepted(checked as boolean)}
                />
                <label 
                  htmlFor="privacy-accept" 
                  className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                >
                  I have read and agree to the Privacy Policy. 
                  {required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleAccept}
                  disabled={!accepted}
                  className="flex-1"
                >
                  Accept & Continue
                </Button>
                {!required && (
                  <Button 
                    variant="outline" 
                    onClick={handleDecline}
                    className="flex-1"
                  >
                    Decline
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
