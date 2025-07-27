# MyLittleBank - Kids Money Tracker

## Overview

MyLittleBank is a Progressive Web App (PWA) designed for kids to track chores, earn money, and learn financial responsibility. The application features a fun, iOS-style interface with gamification elements to make money management engaging for children.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite with custom configuration for development and production
- **Styling**: Tailwind CSS with custom iOS-inspired theme
- **Component Library**: Radix UI primitives with custom shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM with schema-first approach
- **API Pattern**: RESTful endpoints with Express middleware
- **Validation**: Zod schemas shared between client and server

### Mobile-First Design
- **PWA Features**: Service worker, manifest, offline capabilities
- **Responsive Design**: Mobile-first approach with iOS-style components
- **Touch Interface**: Custom mobile tabs and modal components
- **Platform Integration**: Apple meta tags and iOS-specific configurations

## Key Components

### Database Schema
- **Users**: Basic user authentication and balance tracking
- **Chores**: Task definitions with payment amounts and icons
- **Goals**: Savings targets with progress tracking
- **Transactions**: Complete audit trail of all money movements

### Core Features
- **Chore Management**: Create, edit, and complete chores with immediate payment
- **Goal Setting**: Set savings goals with visual progress tracking
- **Balance Tracking**: Real-time balance updates with transaction history
- **Gamification**: Icons, progress bars, and achievement-style feedback

### UI Components
- **Mobile Tabs**: Bottom navigation with icon-based tabs
- **Mobile Modals**: Full-screen modals optimized for mobile interaction
- **Progress Indicators**: Visual feedback for goal completion
- **Toast Notifications**: User feedback for actions and errors

## Data Flow

### Chore Completion Flow
1. User selects a chore from the available list
2. System creates transaction record for completed chore
3. User balance is updated automatically
4. Transaction appears in balance history
5. UI reflects updated balance across all tabs

### Goal Allocation Flow
1. User selects goal and enters allocation amount
2. System validates sufficient balance exists
3. Amount is moved from general balance to goal progress
4. Transaction record created for audit trail
5. Goal progress updated with visual feedback

### State Management
- **Server State**: TanStack Query manages API calls with caching
- **Form State**: React Hook Form handles form validation and submission
- **UI State**: React useState for local component state
- **Shared State**: Context providers for global UI state

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **WebSocket Support**: Real-time capabilities via ws package
- **Session Management**: Connect-pg-simple for PostgreSQL sessions

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Consistent icon library
- **Class Variance Authority**: Dynamic styling utilities

### Development Tools
- **ESBuild**: Fast bundling for production builds
- **TSX**: TypeScript execution for development
- **Drizzle Kit**: Database migrations and schema management
- **Vite Plugins**: Development enhancement tools

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Database Migrations**: Drizzle push for schema updates
- **Environment Variables**: DATABASE_URL required for database connection
- **Type Safety**: Full TypeScript coverage with strict mode

### Production Build
- **Client Build**: Vite builds React app to static files
- **Server Build**: ESBuild bundles Express server
- **Asset Optimization**: Automatic asset optimization and minification
- **PWA Assets**: Service worker and manifest generation

### Render Deployment (January 2025)
- **Platform**: Render.com free tier (750 hours/month)
- **Configuration**: render.yaml for infrastructure as code
- **Database**: PostgreSQL free tier (1GB storage)
- **Port Configuration**: Updated to use process.env.PORT for Render compatibility
- **Build Process**: npm run build → npm start for production
- **Environment**: NODE_ENV=production, DATABASE_URL from Render PostgreSQL
- **Documentation**: RENDER_DEPLOYMENT.md with step-by-step instructions

### Deployment Requirements
- **Node.js**: Runtime for Express server
- **PostgreSQL**: Database with connection pooling
- **Static Assets**: Served via Express in production
- **Environment**: Production environment variables required

## Changelog

```
Changelog:
- July 05, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```