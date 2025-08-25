'use client';

import { useState } from 'react';
import { Phone, Mail, Globe, Calendar, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    challenges: '',
    contactMethod: 'email'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Prepare data in the format the API expects
      const apiData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        organization: formData.company,
        message: formData.challenges,
        contactMethod: formData.contactMethod
      };

      // Submit to backend API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();
      
      if (response.ok) {
        setSubmitStatus('success');
        
        // Reset form after success
        setTimeout(() => {
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            company: '',
            challenges: '',
            contactMethod: 'email'
          });
          setSubmitStatus('idle');
        }, 3000);
      } else {
        setSubmitStatus('error');
        if (result.details && Array.isArray(result.details)) {
          setErrorMessage(result.details.join(', '));
        } else {
          setErrorMessage(result.error || 'Failed to submit form. Please try again.');
        }
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20 bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 gradient-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-animate>
            <h1 className="text-hero text-accent mb-6">
              Get In Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ready to start your transformation? Let's discuss how we can help you and your organization unlock your full potential.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 lg:py-32 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16 animate-fade-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-4 lg:mb-6">
              Let's Start Your Leadership Journey
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Ready to unlock your leadership potential? Get in touch to schedule 
              your free consultation and discover how we can help you achieve your goals.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 max-w-full">
            {/* Contact Form */}
            <div className="animate-fade-up order-2 lg:order-1 min-w-0">
              <div className="card-feature p-4 sm:p-6 lg:p-8 max-w-full">
                <div className="flex items-center mb-6 lg:mb-8">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary mr-3 flex-shrink-0" />
                  <h3 className="text-xl sm:text-2xl font-bold text-accent">Book Your Strategy Session</h3>
                </div>

                {/* Success/Error Messages */}
                {submitStatus === 'success' && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Thank you! Your message has been sent successfully. We'll get back to you within 24 hours to schedule your free consultation.
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === 'error' && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="min-w-0">
                      <Label htmlFor="firstName" className="text-accent text-sm sm:text-base">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-1 h-12 sm:h-14 text-base w-full"
                        placeholder="John"
                      />
                    </div>
                    <div className="min-w-0">
                      <Label htmlFor="lastName" className="text-accent text-sm sm:text-base">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-1 h-12 sm:h-14 text-base w-full"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <Label htmlFor="email" className="text-accent text-sm sm:text-base">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 h-12 sm:h-14 text-base w-full"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div className="min-w-0">
                    <Label htmlFor="phone" className="text-accent text-sm sm:text-base">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 h-12 sm:h-14 text-base w-full"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="min-w-0">
                    <Label htmlFor="company" className="text-accent text-sm sm:text-base">
                      Company Name
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="mt-1 h-12 sm:h-14 text-base w-full"
                      placeholder="Your Company"
                    />
                  </div>

                  <div className="min-w-0">
                    <Label htmlFor="challenges" className="text-accent text-sm sm:text-base">
                      What leadership challenges are you facing? *
                    </Label>
                    <Textarea
                      id="challenges"
                      name="challenges"
                      required
                      rows={4}
                      value={formData.challenges}
                      onChange={handleInputChange}
                      className="mt-1 text-base resize-none w-full"
                      placeholder="Tell us about your specific leadership challenges, team dynamics, or organizational goals..."
                    />
                  </div>

                  <div className="min-w-0">
                    <Label className="text-accent text-sm sm:text-base mb-3 block">
                      Preferred Contact Method
                    </Label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <label className="flex items-center p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="email"
                          checked={formData.contactMethod === 'email'}
                          onChange={handleInputChange}
                          className="mr-2 sm:mr-3 text-primary focus:ring-primary w-4 h-4 sm:w-5 sm:h-5"
                        />
                        <span className="text-xs sm:text-sm lg:text-base">Email</span>
                      </label>
                      <label className="flex items-center p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="phone"
                          checked={formData.contactMethod === 'phone'}
                          onChange={handleInputChange}
                          className="mr-2 sm:mr-3 text-primary focus:ring-primary w-4 h-4 sm:w-5 sm:h-5"
                        />
                        <span className="text-xs sm:text-sm lg:text-base">Phone</span>
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-4 sm:py-5 text-base sm:text-lg rounded-xl h-14 sm:h-16 touch-manipulation active:scale-98"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </div>
                    ) : (
                      <>
                        Send Message & Book Consultation
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-xs sm:text-sm text-muted-foreground mt-4 text-center">
                  * Required fields. We'll respond within 24 hours.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="animate-fade-up order-1 lg:order-2 min-w-0" style={{ animationDelay: '0.2s' }}>
              <div className="space-y-6 lg:space-y-8">
                {/* Contact Details */}
                <div className="card-elevated p-4 sm:p-6 lg:p-8 max-w-full">
                  <h3 className="text-xl sm:text-2xl font-bold text-accent mb-6">Get In Touch</h3>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-accent text-sm sm:text-base">Phone</div>
                        <a href="tel:678-920-6605" className="text-primary hover:underline text-sm sm:text-base break-all">
                          (678) 920-6605
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-accent text-sm sm:text-base">Email</div>
                        <a href="mailto:nobilis.talent@gmail.com" className="text-primary hover:underline text-sm sm:text-base break-all">
                          nobilis.talent@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-accent text-sm sm:text-base">Availability</div>
                        <div className="text-primary text-sm sm:text-base">Available globally.</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Time */}
                <div className="card-elevated bg-gradient-subtle p-4 sm:p-6 lg:p-8 max-w-full">
                  <div className="flex items-center mb-4">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-primary mr-3 flex-shrink-0" />
                    <h4 className="text-lg sm:text-xl font-bold text-accent">Quick Response</h4>
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                    We understand that leadership challenges require prompt attention. 
                    You can expect a response within 24 hours.
                  </p>
                  <div className="text-sm text-primary font-semibold">
                    ✓ Free 30-minute strategy session included
                  </div>
                </div>

                {/* Calendly Integration */}
                <div className="card-elevated bg-primary text-white p-4 sm:p-6 lg:p-8 max-w-full mt-6 sm:mt-8">
                  <h4 className="text-lg sm:text-xl font-bold mb-4">Schedule Directly</h4>
                  <p className="mb-6 opacity-90 text-sm sm:text-base">
                    Prefer to book immediately? Use our online calendar to select 
                    a time that works for you.
                  </p>
                  <button 
                    onClick={() => window.open(process.env.NEXT_PUBLIC_CALENDLY_URL, '_blank')}
                    className="bg-white text-primary px-6 py-4 rounded-xl font-semibold hover:bg-white/90 transition-smooth w-full h-14 sm:h-16 touch-manipulation active:scale-98"
                  >
                    Book Now
                  </button>
                  <p className="text-xs opacity-75 mt-3 text-center">
                    All appointments are confirmed via email
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 lg:mt-16 text-center animate-fade-up">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-xs sm:text-sm text-muted-foreground px-4">
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                <span className="text-left">Confidential Consultations</span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                <span className="text-left">No Obligation</span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                <span className="text-left">24hr Response Time</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
