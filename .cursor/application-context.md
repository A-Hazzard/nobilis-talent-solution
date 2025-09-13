# Nobilis Talent Solutions - Application Context

**Author:** AI Assistant - Senior Software Engineer  
**Last Updated:** January 2025

## System Overview

The Nobilis Talent Solutions platform is a comprehensive leadership coaching and business management system built with Next.js 15, TypeScript, and Firebase. It provides lead management, resource sharing, calendar scheduling, payment processing, and analytics capabilities for leadership development and organizational consulting services.

## Core Architecture

### Technology Stack
- **Frontend:** Next.js 15 with TypeScript, React, Tailwind CSS
- **Backend:** Next.js API Routes with Firebase
- **Database:** Firebase Firestore with real-time capabilities
- **Authentication:** Firebase Auth with role-based access control
- **Payments:** Stripe integration with checkout sessions and webhooks
- **State Management:** Zustand with persistence for client state
- **UI Components:** shadcn/ui with Radix UI primitives and Lucide icons
- **Build Tool:** pnpm for package management
- **Email:** Firebase Functions or external email service integration

### Project Structure
```
nobilis-talent-solution/
├── app/                          # Next.js App Router
│   ├── admin/                   # Admin dashboard pages
│   │   ├── analytics/           # Analytics dashboard with demo mode
│   │   ├── calendar/            # Calendar management system
│   │   ├── leads/               # Lead management interface
│   │   ├── resources/           # Resource library management
│   │   ├── settings/            # Admin settings
│   │   ├── testimonials/        # Testimonials management
│   │   ├── invoices/            # Invoice management
│   │   └── audit/               # Audit logs and activity tracking
│   ├── api/                     # Backend API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── payment/             # Stripe payment processing
│   │   ├── leads/               # Lead management APIs
│   │   ├── resources/           # Resource management APIs
│   │   ├── analytics/           # Analytics data APIs
│   │   └── calendar/            # Calendar event APIs
│   ├── auth/                    # Authentication pages
│   ├── payment/                 # Payment success/pending pages
│   ├── layout.tsx               # Root layout with SEO
│   ├── page.tsx                 # Landing page
│   ├── providers.tsx            # Context providers
│   └── globals.css              # Global styles with design system
├── components/                  # React components
│   ├── admin/                   # Admin-specific components
│   ├── ui/                      # Reusable UI components (shadcn/ui)
│   ├── HeroSection.tsx          # Landing page hero
│   ├── ServicesSection.tsx      # Services showcase
│   ├── CompanySection.tsx       # About company section
│   ├── ValuesSection.tsx        # Company values
│   ├── TestimonialsSection.tsx  # Client testimonials
│   ├── ContactSection.tsx       # Contact form
│   ├── Navigation.tsx           # Main navigation
│   ├── Footer.tsx               # Site footer
│   ├── ScrollToTop.tsx          # Scroll to top button
│   └── StickyCallButton.tsx     # Sticky call-to-action
├── lib/                         # Shared utilities and services
│   ├── services/                # Business logic services
│   │   ├── AuthService.ts       # Authentication management
│   │   ├── LeadsService.ts      # Lead CRUD operations
│   │   ├── ResourcesService.ts  # Resource management
│   │   ├── CalendarService.ts   # Calendar operations
│   │   ├── EmailService.ts      # Email notifications
│   │   └── AnalyticsService.ts  # Analytics data processing
│   ├── stores/                  # Zustand state stores
│   ├── utils/                   # Helper functions
│   ├── firebase/                # Firebase configuration
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript definitions
│   ├── helpers/                 # Business logic helpers
│   ├── contexts/                # React contexts
│   └── seo/                     # SEO configuration and utilities
├── shared/                      # Shared types and utilities
│   └── types/                   # Shared TypeScript definitions
├── public/                      # Static assets
│   └── assets/                  # Images and media files
├── .cursor/                     # Cursor IDE configuration
├── Dockerfile                   # Docker configuration
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── eslint.config.js             # ESLint configuration
└── package.json                 # Dependencies and scripts
```

## Core Business Logic

### Leadership Coaching Services
The platform supports eight core service offerings:

1. **Individual & Group Coaching** - Personalized leadership development
2. **Performance Management Design** - Human-centered performance systems
3. **Leadership Development Design** - Executive and emerging leader programs
4. **Talent Strategy Development** - People strategy and planning
5. **Succession & Workforce Planning** - Future-ready organizational planning
6. **Training & Facilitation** - Interactive learning experiences
7. **Competency Model Development** - Skills and behavior frameworks
8. **Targeted Talent Acquisition** - Strategic hiring and recruitment

### Lead Management System
- **Lead Capture:** Contact forms with detailed onboarding questions
- **Lead Tracking:** Comprehensive lead lifecycle management
- **Client Information:** Detailed client profiles with organization details
- **Payment Processing:** Stripe integration for consultation payments
- **Invoice Management:** Automated invoice generation and tracking

### Payment Flow
1. **Lead Generation** → **Consultation Booking** → **Payment Processing** → **Invoice Creation** → **Service Delivery**
2. **Stripe Integration:** Checkout sessions, webhooks, and payment confirmation
3. **Invoice Management:** Automatic invoice generation with base amounts and bonuses
4. **Payment Tracking:** Real-time payment status updates

## Database Structure

### Firebase Collections

#### Core Entities
- **users** - User profiles and authentication data
- **leads** - Client leads and prospect information
- **invoices** - Payment invoices and financial records
- **pendingPayments** - Pending payment sessions
- **resources** - Leadership resources and downloads
- **calendarEvents** - Scheduled consultations and events
- **testimonials** - Client feedback and reviews
- **auditLogs** - System activity and user actions

#### Key Relationships
```
User → Lead → Invoice → Payment
  ↓      ↓       ↓
Calendar  Resources  Testimonials
  ↓
AuditLogs
```

### Data Models

#### User Profile
```typescript
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  organization?: string;
  phone?: string;
  onboardingCompleted?: boolean;
  // ... additional profile fields
};
```

#### Lead Management
```typescript
type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organization?: string;
  jobTitle?: string;
  primaryGoals?: string[];
  organizationType?: 'startup' | 'small-business' | 'enterprise' | 'nonprofit' | 'other';
  industryFocus?: string;
  teamSize?: string;
  challengesDescription?: string;
  timeline?: string;
  budget?: string;
  createdAt: Date;
  updatedAt: Date;
};
```

#### Payment Processing
```typescript
type Invoice = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  baseAmount: number;
  bonusAmount?: number;
  stripeSessionId?: string;
  transactionId?: string;
  createdAt: Date;
  paidAt?: Date;
};
```

## Engineering Guidelines

### TypeScript Discipline
- **All types must reside in appropriate directories:**
  - **Shared types:** `shared/types/` (used across frontend and backend)
  - **Application types:** `types/` (application-wide types)
  - **Component types:** `lib/types/` (component or library-specific)
  - **Do not define types directly in component files**
- **Prefer `type` over `interface`** for consistency
- **No `any` types allowed** - Create appropriate type definitions
- **Always check dependencies before deleting code** - Use grep search to verify usage
- **Avoid type duplication** - Import and re-export from shared types

### Code Organization
- **Keep page components lean** - Offload complex logic to helpers
- **API logic in `lib/helpers/`** or specific feature directories
- **Shared utilities in `lib/utils/`** or `utils/`
- **Context providers in `lib/contexts/`** or `context/`
- **Feature-specific code** organized within related directories in `lib/`

### Build and Quality
- **Use `pnpm` exclusively** for package management
- **Always run `pnpm build`** after code changes
- **Never ignore ESLint violations** - Address all warnings and errors
- **Follow established code style** in existing files
- **Use ESLint auto-fix:** `pnpm lint --fix`

### Security & Authentication
- **JWT tokens with `jose` library** for secure authentication
- **OWASP standards compliance** for security best practices
- **Never expose sensitive data** client-side
- **Validate and sanitize** all user input
- **Firebase Auth integration** with role-based access control

### Performance Optimization
- **Code-splitting and lazy loading** for pages and components
- **Image optimization** using Next.js Image component
- **Memoization techniques** to minimize re-renders
- **Efficient data fetching** patterns to prevent waterfalls
- **Caching strategies** for API responses
- **Debouncing for search inputs** to prevent excessive API calls

## Key Features

### Admin Dashboard
- **Real-time Analytics** with demo mode toggle for presentations
- **Lead Management** with comprehensive tracking and insights
- **Resource Center** with file management and download analytics
- **Calendar System** for event scheduling and management
- **Testimonials Management** for client feedback
- **Invoice Management** with payment tracking
- **Audit Logs** for comprehensive activity tracking

### Payment System
- **Stripe Integration** with checkout sessions and webhooks
- **Invoice Generation** with base amounts and bonus tracking
- **Payment Confirmation** with automatic status updates
- **Financial Analytics** with revenue and bonus tracking

### SEO Implementation
- **Comprehensive SEO** with meta tags, Open Graph, and Twitter Cards
- **Schema.org structured data** for rich snippets
- **Sitemap generation** for search engine indexing
- **Robots.txt** for search engine crawling control
- **Page-specific SEO** components for targeted optimization

### Responsive Design
- **Mobile-first approach** with responsive breakpoints
- **Modern UI/UX patterns** with shadcn/ui components
- **Accessibility compliance** with ARIA attributes
- **Performance optimization** across all devices

## API Patterns

### Standard Endpoint Structure
```typescript
// GET endpoints with filtering
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = buildFilter(searchParams);
  const results = await service.getData(filter);
  return NextResponse.json(results);
}

// POST endpoints with validation
export async function POST(req: NextRequest) {
  const data = await req.json();
  const validated = validateData(data);
  const created = await service.create(validated);
  return NextResponse.json(created);
}
```

### Error Handling
- **Consistent error response format** across all endpoints
- **Proper HTTP status codes** for different error types
- **Detailed error logging** for debugging
- **Graceful degradation** for service failures

## Service Layer Architecture

### Singleton Pattern Implementation
```typescript
export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  async authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
    // Implementation
  }
}
```

### Service Classes
- **AuthService** - Authentication and user management
- **LeadsService** - Lead CRUD operations and analytics
- **ResourcesService** - Resource management and download tracking
- **CalendarService** - Event scheduling and management
- **EmailService** - Email notifications and communications
- **AnalyticsService** - Data analytics and reporting
- **PDFService** - Document generation and management

## Development Workflow

### Feature Development
1. **Create types first** in appropriate type files
2. **Implement backend API** with proper validation
3. **Build frontend components** with TypeScript
4. **Add proper error handling** and loading states
5. **Test with real data** and edge cases

### Code Review Checklist
- **TypeScript types are correct** and properly imported
- **No ESLint violations** or warnings
- **Proper error handling** for all async operations
- **Security considerations** for user input and data
- **Performance implications** for large datasets

### Testing Strategy
- **Manual testing** of critical user flows
- **API endpoint validation** with proper error handling
- **Frontend component testing** with various states
- **Integration testing** between services

## Common Patterns

### Data Fetching
```typescript
// Standard data fetching pattern
const fetchData = async () => {
  try {
    const response = await fetch('/api/endpoint');
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
```

### State Management
```typescript
// Zustand store pattern
export const useStore = create<State>()(
  persist(
    (set, get) => ({
      // state and actions
    }),
    { name: 'store-name' }
  )
);
```

### Component Structure
```typescript
// Standard component pattern
export default function Component() {
  const [state, setState] = useState();
  const { data } = useStore();
  
  useEffect(() => {
    // side effects
  }, []);
  
  return (
    <div>
      {/* component JSX */}
    </div>
  );
}
```

## Troubleshooting

### Common Issues
1. **Build Failures:** Check for unused imports, type errors, and ESLint violations
2. **API Errors:** Verify Firebase connections, validate input data
3. **Payment Issues:** Check Stripe configuration and webhook endpoints
4. **Type Errors:** Ensure proper type definitions and imports
5. **Authentication Issues:** Verify Firebase Auth configuration

### Debugging Tools
- **Firebase Console** for database inspection
- **Browser DevTools** for frontend debugging
- **Stripe Dashboard** for payment debugging
- **Console logging** for development debugging

## Recent System Updates (January 2025)

### Payment System Enhancement
- **Complete Stripe Integration** with checkout sessions and webhooks
- **Invoice Management System** with automatic generation and tracking
- **Payment Confirmation Flow** with status updates and bonus tracking
- **Financial Analytics** with revenue and bonus calculations

### SEO Implementation
- **Comprehensive SEO Setup** with meta tags, Open Graph, and Twitter Cards
- **Schema.org structured data** for rich snippets and search visibility
- **Sitemap and robots.txt** generation for search engine optimization
- **Page-specific SEO** components for targeted optimization

### Code Organization Refactoring
- **Type System Cleanup** with proper type organization and imports
- **Component Refactoring** with interface to type conversions
- **Service Layer Implementation** with singleton patterns
- **Unused Code Removal** with systematic cleanup and dependency checking

### Landing Page Optimization
- **Scroll Animation Fixes** resolving content visibility issues
- **Component Structure** optimization for better performance
- **Responsive Design** improvements across all sections
- **Content Organization** with proper section hierarchy

---

This context file provides a comprehensive overview of the Nobilis Talent Solutions platform. Use this as reference when working on any part of the system to maintain consistency and understand the broader context of your changes.
