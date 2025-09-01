'use client';

import Image from 'next/image';
import { generalImages, serviceImages } from '@/lib/constants/images';

const MosaicItem = ({
  src,
  alt,
  label,
  className,
}: {
  src: any;
  alt: string;
  label: string;
  className?: string;
}) => (
  <div className={`relative overflow-hidden rounded-2xl shadow-[var(--shadow-medium)] ${className || ''}`}>
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover transition-transform duration-500 will-change-transform hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
    <div className="absolute bottom-3 left-3 right-3 text-white">
      <span className="inline-block bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
        {label}
      </span>
    </div>
  </div>
);

const ImageMosaic = () => {
  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
          <MosaicItem
            src={serviceImages['individual-group-coaching']}
            alt="Coaching session"
            label="Coaching"
            className="col-span-2 lg:col-span-2 aspect-[4/3]"
          />
          <MosaicItem
            src={serviceImages['leadership-development-design']}
            alt="Leadership workshop"
            label="Leadership"
            className="col-span-1 lg:col-span-2 aspect-square"
          />
          <MosaicItem
            src={serviceImages['performance-management-design']}
            alt="Performance systems"
            label="Performance"
            className="col-span-1 lg:col-span-2 aspect-[3/4]"
          />
          <MosaicItem
            src={generalImages.heroLeadership}
            alt="Organizational strategy"
            label="Strategy"
            className="col-span-2 lg:col-span-3 aspect-[5/3]"
          />
          <MosaicItem
            src={serviceImages['talent-strategy-development']}
            alt="Talent planning"
            label="Talent"
            className="col-span-2 lg:col-span-3 aspect-[16/9]"
          />
        </div>
      </div>
    </section>
  );
};

export default ImageMosaic;

