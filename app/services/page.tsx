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
  Zap,
  Shield,
  Heart,
  Phone,
  Play,
  FileText,
  TrendingUp,
  BarChart3,
  GraduationCap,
  Search
} from 'lucide-react';

// Service data
const services = [
  {
    id: 'individual-coaching',
    title: 'Individual & Group Coaching',
    subtitle: 'Grow with purpose.',
    description: 'Personalized coaching that sparks holistic growth, strengthens confidence, and helps individuals and teams be better.',
    features: [
      'Personalized growth strategies',
      'Confidence building techniques',
      'Team dynamics optimization',
      'Holistic development approach',
      'Goal setting and accountability',
      'Communication skills enhancement'
    ],
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
        content: 'The coaching program transformed my approach to leadership. I now lead with clarity and purpose.',
        rating: 5
      }
    ],
    icon: Heart,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'performance-management',
    title: 'Performance Management Design',
    subtitle: 'Solutions to drive engagement and results.',
    description: 'We reimagine the approach to managing performance. With an intentional focus on the people, we redesign performance systems to be more human, more agile, and more impactful.',
    features: [
      'Human-centered performance systems',
      'Agile performance frameworks',
      'Engagement-driven metrics',
      'Impact measurement strategies',
      'Performance optimization',
      'Team culture building'
    ],
    testimonials: [
      {
        name: 'Lisa Rodriguez',
        role: 'HR Director, InnovateCo',
        content: 'Our team productivity increased by 40% after implementing Kareem\'s performance management strategies.',
        rating: 5
      },
      {
        name: 'David Thompson',
        role: 'Team Lead, Creative Agency',
        content: 'The performance management redesign completely changed how we work together. We\'re now more cohesive than ever.',
        rating: 5
      }
    ],
    icon: Target,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'leadership-development',
    title: 'Leadership Development Design',
    subtitle: 'Leaders who inspire action.',
    description: 'From emerging leaders to seasoned execs, we craft experiences to grow leaders who inspire, influence, and deliver results in a changing world.',
    features: [
      'Emerging leader development',
      'Executive leadership enhancement',
      'Inspiration and influence skills',
      'Results-driven leadership',
      'Strategic planning workshops',
      'Personal brand development'
    ],
    testimonials: [
      {
        name: 'Jennifer Park',
        role: 'Founder, StartupXYZ',
        content: 'The leadership development program was a game-changer. I gained clarity on my vision and the tools to execute it.',
        rating: 5
      },
      {
        name: 'Robert Williams',
        role: 'Managing Director, Finance Corp',
        content: 'The program allowed for deep reflection and practical application. Highly recommend!',
        rating: 5
      }
    ],
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    id: 'talent-strategy',
    title: 'Talent Strategy Development',
    subtitle: 'People plans that work.',
    description: 'We partner with you to design plans to attract, engage, retain, and grow the right people so your organization thrives long-term.',
    features: [
      'Strategic talent attraction',
      'Employee engagement programs',
      'Retention optimization',
      'Long-term growth planning',
      'Networking opportunities',
      'Action planning sessions'
    ],
    testimonials: [
      {
        name: 'Alex Rodriguez',
        role: 'HR Director, GrowthCo',
        content: 'Our talent strategy has completely transformed our ability to attract and retain top talent.',
        rating: 5
      },
      {
        name: 'Maria Garcia',
        role: 'VP People, TechCorp',
        content: 'The strategic approach to talent development has been instrumental in our company\'s growth.',
        rating: 5
      }
    ],
    icon: TrendingUp,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    id: 'succession-planning',
    title: 'Succession & Workforce Planning Design',
    subtitle: 'Ready for tomorrow, today.',
    description: 'Future-proof your organization with smart, scalable plans that ensure the right people are ready for the right roles—when it matters most.',
    features: [
      'Future-ready workforce planning',
      'Succession strategy development',
      'Risk minimization frameworks',
      'Value agenda optimization',
      'Strategic planning workshops',
      'Follow-up support'
    ],
    testimonials: [
      {
        name: 'James Wilson',
        role: 'CEO, Legacy Corp',
        content: 'Our succession planning has given us confidence in our future leadership pipeline.',
        rating: 5
      },
      {
        name: 'Patricia Brown',
        role: 'Board Member, Family Business',
        content: 'The workforce planning approach has been crucial for our long-term sustainability.',
        rating: 5
      }
    ],
    icon: BarChart3,
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  {
    id: 'training-facilitation',
    title: 'Training & Facilitation',
    subtitle: 'Learning that sticks.',
    description: 'Interactive, engaging and practical learning experiences that build skills and shift mindsets — in the room or online.',
    features: [
      'Interactive learning experiences',
      'Mindset transformation programs',
      'Practical skill building',
      'Virtual and in-person delivery',
      'Customized curriculum',
      'Follow-up coaching sessions'
    ],
    testimonials: [
      {
        name: 'Tom Anderson',
        role: 'Learning Director, EduCorp',
        content: 'The training programs have significantly improved our team\'s capabilities and engagement.',
        rating: 5
      },
      {
        name: 'Samantha Lee',
        role: 'Training Manager, RetailCo',
        content: 'The facilitation approach makes learning practical and immediately applicable.',
        rating: 5
      }
    ],
    icon: GraduationCap,
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    id: 'competency-model',
    title: 'Competency Model Development',
    subtitle: 'Defining what great looks like.',
    description: 'We partner with you to define and highlight the skills, behaviors, and mindsets that drive success in your organization.',
    features: [
      'Success competency frameworks',
      'Behavioral assessment models',
      'Hiring guidance systems',
      'Development roadmaps',
      'Performance optimization',
      'Team culture building'
    ],
    testimonials: [
      {
        name: 'Rachel Green',
        role: 'Talent Director, ScaleUp',
        content: 'Our competency model has revolutionized how we hire and develop our people.',
        rating: 5
      },
      {
        name: 'Kevin Martinez',
        role: 'HR Manager, ServiceCo',
        content: 'The clear frameworks have made our hiring and development processes much more effective.',
        rating: 5
      }
    ],
    icon: Shield,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    id: 'talent-acquisition',
    title: 'Targeted Talent Acquisition',
    subtitle: 'The right people, right away.',
    description: 'Find and attract top talent that aligns with your culture and delivers on your strategy. Strategic, data-informed and deeply human.',
    features: [
      'Culture-aligned recruitment',
      'Strategic talent sourcing',
      'Data-informed selection',
      'Human-centered hiring',
      'Communication skills enhancement',
      'Conflict resolution strategies'
    ],
    testimonials: [
      {
        name: 'Amanda Foster',
        role: 'Recruitment Director, TalentCo',
        content: 'Our hiring quality has improved dramatically since implementing this approach.',
        rating: 5
      },
      {
        name: 'Chris Johnson',
        role: 'Hiring Manager, StartupXYZ',
        content: 'The strategic approach to talent acquisition has been game-changing for our growth.',
        rating: 5
      }
    ],
    icon: Search,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
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

      {/* Footer rendered globally in RootLayout */}

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