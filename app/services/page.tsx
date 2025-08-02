'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Target, 
  Star, 
  CheckCircle, 
  Calendar,
  Award,
  Users2,
  Zap,
  Shield,
  Heart,
  Phone,
  Play,
  FileText
} from 'lucide-react';
import Footer from '@/components/Footer';

// Service data
const services = [
  {
    id: 'executive-coaching',
    title: 'Executive Coaching',
    subtitle: 'Transform Your Leadership Potential',
    description: 'One-on-one coaching sessions designed to unlock your leadership potential and drive organizational success.',
    features: [
      'Personalized leadership development plan',
      '360-degree feedback assessment',
      'Goal setting and accountability',
      'Communication skills enhancement',
      'Strategic thinking development',
      'Conflict resolution strategies'
    ],
    pricing: {
      single: 150,
      package: 1200,
      duration: '60 minutes per session',
      packageDetails: '10 sessions package'
    },
    testimonials: [
      {
        name: 'Sarah Johnson',
        role: 'CEO, TechStart Inc.',
        content: 'Kareem helped me develop the confidence and skills to lead my company through a major transition. His insights were invaluable.',
        rating: 5
      },
      {
        name: 'Michael Chen',
        role: 'VP Operations, Global Corp',
        content: 'The executive coaching program transformed my approach to leadership. I now lead with clarity and purpose.',
        rating: 5
      }
    ],
    icon: Users,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'team-development',
    title: 'Team Development',
    subtitle: 'Build High-Performing Teams',
    description: 'Comprehensive team building and development programs that foster collaboration, communication, and peak performance.',
    features: [
      'Team dynamics assessment',
      'Communication workshops',
      'Conflict resolution training',
      'Collaboration strategies',
      'Performance optimization',
      'Team culture building'
    ],
    pricing: {
      single: 500,
      package: 4000,
      duration: 'Half-day workshop',
      packageDetails: '8 workshops package'
    },
    testimonials: [
      {
        name: 'Lisa Rodriguez',
        role: 'HR Director, InnovateCo',
        content: 'Our team productivity increased by 40% after implementing Kareem\'s team development strategies.',
        rating: 5
      },
      {
        name: 'David Thompson',
        role: 'Team Lead, Creative Agency',
        content: 'The team development program completely changed how we work together. We\'re now more cohesive than ever.',
        rating: 5
      }
    ],
    icon: Users2,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'leadership-retreats',
    title: 'Leadership Retreats',
    subtitle: 'Intensive Leadership Immersion',
    description: 'Multi-day intensive programs that provide deep leadership insights and transformative experiences.',
    features: [
      'Comprehensive leadership assessment',
      'Strategic planning workshops',
      'Personal brand development',
      'Networking opportunities',
      'Action planning sessions',
      'Follow-up support'
    ],
    pricing: {
      single: 2500,
      package: 20000,
      duration: '2-day intensive',
      packageDetails: 'Annual membership'
    },
    testimonials: [
      {
        name: 'Jennifer Park',
        role: 'Founder, StartupXYZ',
        content: 'The leadership retreat was a game-changer. I gained clarity on my vision and the tools to execute it.',
        rating: 5
      },
      {
        name: 'Robert Williams',
        role: 'Managing Director, Finance Corp',
        content: 'The intensive format allowed for deep reflection and practical application. Highly recommend!',
        rating: 5
      }
    ],
    icon: Award,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

const benefits = [
  {
    icon: Target,
    title: 'Proven Results',
    description: 'Track record of helping leaders achieve measurable improvements in performance and satisfaction.'
  },
  {
    icon: Shield,
    title: 'Confidential & Safe',
    description: 'All sessions are completely confidential, creating a safe space for honest reflection and growth.'
  },
  {
    icon: Zap,
    title: 'Action-Oriented',
    description: 'Focus on practical strategies and actionable insights that you can implement immediately.'
  },
  {
    icon: Heart,
    title: 'Personalized Approach',
    description: 'Tailored programs designed specifically for your unique challenges and goals.'
  }
];

export default function ServicesPage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
    preferredDate: '',
    preferredTime: ''
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement booking submission
    console.log('Booking submitted:', bookingForm);
    setIsBookingModalOpen(false);
    // Reset form
    setBookingForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      service: '',
      message: '',
      preferredDate: '',
      preferredTime: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transform Your Leadership
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Expert coaching and development programs designed to unlock your potential and drive organizational success
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
                onClick={() => setIsBookingModalOpen(true)}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book a Consultation
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 font-semibold"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Introduction
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our comprehensive range of leadership development services, each designed to address specific challenges and goals.
            </p>
          </div>

          <Tabs defaultValue="executive-coaching" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-12">
              {services.map((service) => (
                <TabsTrigger 
                  key={service.id} 
                  value={service.id}
                  className="flex items-center gap-3 p-6 text-lg"
                >
                  <service.icon className="h-6 w-6" />
                  {service.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {services.map((service) => (
              <TabsContent key={service.id} value={service.id} className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Service Details */}
                  <div className="space-y-6">
                    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${service.bgColor} ${service.borderColor} border`}>
                      <service.icon className={`h-5 w-5 bg-gradient-to-r ${service.color} bg-clip-text text-transparent`} />
                      <span className="font-semibold text-gray-700">{service.subtitle}</span>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-gray-900">{service.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">{service.description}</p>
                    
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-gray-900">What's Included:</h4>
                      <ul className="space-y-3">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        size="lg"
                        className={`bg-gradient-to-r ${service.color} hover:opacity-90 text-white`}
                        onClick={() => {
                          setBookingForm(prev => ({ ...prev, service: service.title }));
                          setIsBookingModalOpen(true);
                        }}
                      >
                        <Calendar className="mr-2 h-5 w-5" />
                        Book This Service
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-4 font-semibold"
                      >
                        <FileText className="mr-2 h-5 w-5" />
                        Download Brochure
                      </Button>
                    </div>
                  </div>

                  {/* Pricing & Testimonials */}
                  <div className="space-y-8">
                    {/* Pricing Card */}
                    <Card className="border-2 border-gray-200">
                      <CardContent className="p-8">
                        <div className="text-center mb-6">
                          <h4 className="text-2xl font-bold text-gray-900 mb-2">Investment</h4>
                          <div className="flex items-baseline justify-center gap-2 mb-4">
                            <span className="text-4xl font-bold text-gray-900">${service.pricing.single}</span>
                            <span className="text-gray-600">per session</span>
                          </div>
                          <p className="text-gray-600 mb-4">{service.pricing.duration}</p>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-semibold text-gray-900">{service.pricing.packageDetails}</p>
                            <p className="text-2xl font-bold text-gray-900">${service.pricing.package}</p>
                            <p className="text-sm text-gray-600">Save ${(service.pricing.single * 10) - service.pricing.package}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Testimonials */}
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-gray-900">What Clients Say</h4>
                      {service.testimonials.map((testimonial, index) => (
                        <Card key={index} className="border border-gray-200">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-1 mb-3">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                            <div>
                              <p className="font-semibold text-gray-900">{testimonial.name}</p>
                              <p className="text-sm text-gray-600">{testimonial.role}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Kareem Payne Leadership?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our unique approach combines proven methodologies with personalized strategies to deliver exceptional results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Leadership?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Take the first step towards becoming the leader you've always wanted to be. Book your consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
              onClick={() => setIsBookingModalOpen(true)}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Your Consultation
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Us Now
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Book Your Consultation
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">First Name</Label>
                <Input
                  id="name"
                  value={bookingForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={bookingForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={bookingForm.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={bookingForm.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="service">Service of Interest</Label>
              <Select value={bookingForm.service} onValueChange={(value) => handleInputChange('service', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.title}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={bookingForm.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Select value={bookingForm.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (1 PM - 4 PM)</SelectItem>
                    <SelectItem value="evening">Evening (5 PM - 7 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Tell us about your goals and challenges..."
                value={bookingForm.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={4}
              />
            </div>
            
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Calendar className="mr-2 h-4 w-4" />
              Book Consultation
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 