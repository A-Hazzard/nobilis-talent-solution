import { Mail, Phone, Linkedin, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#contact', label: 'Contact' },
  ];

  const services = [
    'Executive Leadership Coaching',
    'Team Development Programs', 
    'Leadership Workshops',
    'Organizational Culture Change'
  ];

  return (
    <footer className="bg-accent text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold mb-4">Kareem Payne</h3>
            <p className="text-white/80 mb-6 leading-relaxed">
              Transforming leaders and organizations through proven coaching methodologies 
              and practical leadership development.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://linkedin.com"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-smooth"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-smooth"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-smooth"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-primary transition-smooth"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-white/80 text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-primary" />
                <a
                  href="mailto:kareempayne11@gmail.com"
                  className="text-white/80 hover:text-primary transition-smooth"
                >
                  kareempayne11@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-primary" />
                <a
                  href="tel:678-920-6605"
                  className="text-white/80 hover:text-primary transition-smooth"
                >
                  (678) 920-6605
                </a>
              </div>
              <div className="mt-6">
                <a
                  href="#contact"
                  className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-light transition-smooth inline-block"
                >
                  Book Consultation
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 text-sm mb-4 md:mb-0">
              © 2024 Kareem Payne Leadership Coaching. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-white/60 hover:text-primary transition-smooth">
                Privacy Policy
              </a>
              <a href="#" className="text-white/60 hover:text-primary transition-smooth">
                Terms of Service
              </a>
              <a href="#" className="text-white/60 hover:text-primary transition-smooth">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;