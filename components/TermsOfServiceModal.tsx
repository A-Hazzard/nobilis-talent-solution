'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Shield, Mail, Building, DollarSign, AlertTriangle, Scale } from 'lucide-react';

interface TermsOfServiceModalProps {
  children: React.ReactNode;
  onAccept?: (accepted: boolean) => void;
  showCheckbox?: boolean;
  required?: boolean;
}

export default function TermsOfServiceModal({ 
  children, 
  onAccept, 
  showCheckbox = false, 
  required = false 
}: TermsOfServiceModalProps) {
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
            <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            Terms of Service
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
                Welcome to Nobilis Talent Solutions ("Company," "we," "our," or "us"). These Terms of
                Service ("Terms") govern your use of our website and any services we provide (collectively, 
                the "Services"). By accessing or using our Site or Services, you agree to these Terms. 
                If you do not agree, please do not use our Services.
              </p>
            </div>

            {/* Eligibility */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                1. Eligibility
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You must be at least 18 years old to use our Services. By using our Services, you represent and
                warrant that you meet this requirement.
              </p>
            </div>

            {/* Services Provided */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                2. Services Provided
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nobilis Talent Solutions provides coaching and talent management services, including but not
                limited to leadership development, organizational development, and related solutions.
              </p>
            </div>

            {/* Payments & Billing */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                3. Payments & Billing
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>All fees for Services will be clearly communicated prior to engagement.</li>
                <li>Payments must be made in U.S. dollars through approved methods on our Site.</li>
                <li>Late payments may result in suspension or termination of Services.</li>
              </ul>
            </div>

            {/* Cancellations & Refunds */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                4. Cancellations & Refunds
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Consulting Engagements:</strong> Cancellation policies will be outlined in your individual service agreement.</li>
                <li><strong>Digital Products or Events:</strong> Unless otherwise stated, payments for digital products or event registrations are non-refundable.</li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  All content on this Site, including text, graphics, logos, and materials provided during Services,
                  is owned by Nobilis Talent Solutions or our licensors and is protected by copyright and
                  trademark laws.
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>You may not copy, distribute, or reproduce our materials without prior written consent.</li>
                </ul>
              </div>
            </div>

            {/* User Responsibilities */}
            <div>
              <h2 className="text-xl font-semibold mb-3">6. User Responsibilities</h2>
              <p className="text-gray-700 mb-3">You agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Provide accurate and complete information when engaging our Services.</li>
                <li>Use our Site and Services only for lawful purposes.</li>
                <li>Not attempt to interfere with or compromise our Site's security.</li>
              </ul>
            </div>

            {/* Limitation of Liability */}
            <div>
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p className="text-gray-700">
                To the maximum extent permitted by law, Nobilis Talent Solutions will not be liable for any
                indirect, incidental, or consequential damages arising from your use of our Services or Site.
              </p>
            </div>

            {/* Disclaimer of Warranties */}
            <div>
              <h2 className="text-xl font-semibold mb-3">8. Disclaimer of Warranties</h2>
              <p className="text-gray-700">
                Our Services are provided "as is" without warranties of any kind, whether express or implied,
                including warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
            </div>

            {/* Privacy */}
            <div>
              <h2 className="text-xl font-semibold mb-3">9. Privacy</h2>
              <p className="text-gray-700">
                Your use of our Services is also governed by our Privacy Policy.
              </p>
            </div>

            {/* Governing Law */}
            <div>
              <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
              <p className="text-gray-700">
                These Terms are governed by the laws of the State of Georgia, United States, without regard to
                its conflict of laws principles.
              </p>
            </div>

            {/* Changes to Terms */}
            <div>
              <h2 className="text-xl font-semibold mb-3">11. Changes to These Terms</h2>
              <p className="text-gray-700">
                We may update these Terms at any time. Updates will be posted on this page with a new "Last
                Updated" date. Continued use of the Services after changes constitutes your acceptance of the
                new Terms.
              </p>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                12. Contact Us
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-gray-700 mb-2">If you have questions about these Terms, contact us at:</p>
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
                  id="terms-accept" 
                  checked={accepted}
                  onCheckedChange={(checked) => setAccepted(checked as boolean)}
                />
                <label 
                  htmlFor="terms-accept" 
                  className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                >
                  I have read and agree to the Terms of Service. 
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
