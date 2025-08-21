'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Calendar, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ContactSection = () => {
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
      // Submit to backend API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
    <section id="contact" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-section text-accent mb-6">
            Let's Start Your Leadership Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to unlock your leadership potential? Get in touch to schedule 
            your free consultation and discover how we can help you achieve your goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="animate-fade-up">
            <div className="card-feature">
              <div className="flex items-center mb-8">
                <Calendar className="w-8 h-8 text-primary mr-3" />
                <h3 className="text-2xl font-bold text-accent">Book Your Strategy Session</h3>
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-accent">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-accent">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-accent">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-accent">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="company" className="text-accent">
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <Label htmlFor="challenges" className="text-accent">
                    What leadership challenges are you facing? *
                  </Label>
                  <Textarea
                    id="challenges"
                    name="challenges"
                    required
                    rows={4}
                    value={formData.challenges}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="Tell us about your specific leadership challenges, team dynamics, or organizational goals..."
                  />
                </div>

                <div>
                  <Label className="text-accent mb-2 block">
                    Preferred Contact Method
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="email"
                        checked={formData.contactMethod === 'email'}
                        onChange={handleInputChange}
                        className="mr-2 text-primary focus:ring-primary"
                      />
                      Email
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="phone"
                        checked={formData.contactMethod === 'phone'}
                        onChange={handleInputChange}
                        className="mr-2 text-primary focus:ring-primary"
                      />
                      Phone
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-3 sm:py-4 text-base sm:text-lg rounded-xl"
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

              <p className="text-sm text-muted-foreground mt-4">
                * Required fields. We'll respond within 24 hours.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="card-elevated">
                <h3 className="text-2xl font-bold text-accent mb-6">Get In Touch</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-accent">Phone</div>
                      <a href="tel:678-920-6605" className="text-primary hover:underline">
                        (678) 920-6605
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mb-4">
                    <Mail className="w-5 h-5 text-primary" />
                    <a href="mailto:nobilis.talent@gmail.com" className="text-primary hover:underline">
                      nobilis.talent@gmail.com
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">Available globally.</p>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-accent to-accent-light rounded-xl flex items-center justify-center mr-4">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-accent">Location</div>
                      <div className="text-muted-foreground">Trinidad & Tobago</div>
                      <div className="text-sm text-muted-foreground">Available globally via video</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="card-elevated bg-gradient-subtle">
                <div className="flex items-center mb-4">
                  <Clock className="w-8 h-8 text-primary mr-3" />
                  <h4 className="text-xl font-bold text-accent">Quick Response</h4>
                </div>
                <p className="text-muted-foreground mb-4">
                  We understand that leadership challenges require prompt attention. 
                  You can expect a response within 24 hours.
                </p>
                <div className="text-sm text-primary font-semibold">
                  ✓ Free 30-minute strategy session included
                </div>
              </div>

              {/* Calendly Integration */}
              <div className="card-elevated bg-primary text-white">
                <h4 className="text-xl font-bold mb-4">Schedule Directly</h4>
                <p className="mb-6 opacity-90">
                  Prefer to book immediately? Use our online calendar to select 
                  a time that works for you.
                </p>
                <button 
                  onClick={() => window.open(process.env.NEXT_PUBLIC_CALENDLY_URL, '_blank')}
                  className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-smooth w-full"
                >
                  Book Now
                </button>
                <p className="text-xs opacity-75 mt-3">
                  All appointments are confirmed via email
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center animate-fade-up">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              Confidential Consultations
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              No Obligation
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              24hr Response Time
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;