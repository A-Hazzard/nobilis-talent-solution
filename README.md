# Consultation Website Made In NextJs 15

A modern leadership coaching and business management platform built with Next.js 15, TypeScript, and Firebase. Features comprehensive lead management, resource sharing, calendar scheduling, and analytics dashboard.

## ✨ Features

- **🎯 Lead Management** - Track and manage client leads with detailed analytics
- **📚 Resource Library** - Upload and share leadership resources with download tracking
- **📅 Calendar System** - Schedule and manage events, workshops, and consultations
- **⭐ Testimonials** - Collect and showcase client testimonials with ratings
- **📊 Analytics Dashboard** - Comprehensive insights with demo mode for presentations
- **🔐 Secure Authentication** - Firebase Auth with role-based access control
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Radix UI
- **State Management**: Zustand with persistence
- **Backend**: Firebase (Auth, Firestore, Storage)
- **UI Components**: shadcn/ui with Lucide icons
- **Package Manager**: pnpm

## 🚀 Quick Start

### Using Docker

```bash
# Clone the repository
git clone <repository-url>
cd payne-leadership-web

# Copy environment template
cp .env.example .env

# Edit .env with your Firebase credentials
# See Environment Setup section below

# Build and run with Docker
docker build -t payne-leadership .
docker run -p 3000:3000 --env-file .env payne-leadership

# Open http://localhost:3000
```

### Manual Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start development server
pnpm dev
```

## 🔧 Environment Setup

Create a `.env` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Set up Storage bucket
5. Copy configuration to your `.env` file

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   └── (auth)/            # Authentication pages
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   └── ui/               # Base UI components
├── lib/                  # Utilities and services
│   ├── services/         # Business logic services
│   ├── stores/           # Zustand state stores
│   └── utils/            # Helper functions
├── shared/               # Shared code
│   └── types/            # TypeScript definitions
└── hooks/                # Custom React hooks
```

## 🎯 Key Features

### Admin Dashboard
- **Real-time Analytics** - Live data with demo mode toggle
- **Lead Management** - Comprehensive lead tracking and insights
- **Resource Center** - File management with download analytics
- **Calendar System** - Event scheduling and management
- **Testimonials** - Client feedback management

### Demo Mode
Toggle between real data and simulated data for presentations and testing.

### Responsive Design
Optimized for all devices with modern UI/UX patterns.

## 🔐 Authentication

- **Firebase Authentication** with email/password
- **Role-based access** control
- **Persistent sessions** with Zustand
- **Secure API endpoints**

## 📊 Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker Production

```bash
# Build production image
docker build -t payne-leadership .

# Run production container
docker run -p 3000:3000 --env-file .env payne-leadership
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- Create an issue in the repository
- Check the documentation
- Contact the development team

---

**Built with ❤️ using Next.js, TypeScript, and Firebase** 
