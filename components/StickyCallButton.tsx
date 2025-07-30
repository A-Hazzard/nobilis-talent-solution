import { Phone } from 'lucide-react';

const StickyCallButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      <a
        href="tel:678-920-6605"
        className="w-16 h-16 bg-gradient-primary rounded-full shadow-teal flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 animate-pulse"
        aria-label="Call Nobilis Talent Solutions"
      >
        <Phone className="w-8 h-8" />
      </a>
    </div>
  );
};

export default StickyCallButton;