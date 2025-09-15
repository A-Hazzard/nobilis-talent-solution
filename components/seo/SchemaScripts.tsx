'use client';

import { useEffect } from 'react';
import { generateOrganizationSchema, generateProfessionalServiceSchema } from '@/lib/seo/schema';

export default function SchemaScripts() {
  useEffect(() => {
    // Only add schema scripts on client side to avoid hydration issues
    const organizationSchema = generateOrganizationSchema();
    const professionalServiceSchema = generateProfessionalServiceSchema();

    // Remove existing schema scripts if any
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Add organization schema
    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

    // Add professional service schema
    const serviceScript = document.createElement('script');
    serviceScript.type = 'application/ld+json';
    serviceScript.textContent = JSON.stringify(professionalServiceSchema);
    document.head.appendChild(serviceScript);
  }, []);

  return null; // This component doesn't render anything
}
