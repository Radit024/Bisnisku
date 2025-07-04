# BisnisMu - Business Management Application

## Overview

BisnisMu is a comprehensive business management application designed for Indonesian small to medium businesses. It provides financial tracking, customer management, transaction recording, and business analytics capabilities. The application is built as a full-stack web application with a React frontend and Express.js backend, featuring Firebase authentication and PostgreSQL database storage.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite for development and building

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Firebase Auth integration
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API endpoints

### Database Architecture
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Shared schema definitions between frontend and backend
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Authentication System
- Firebase Authentication for user management
- Email/password and Google OAuth sign-in
- Database user synchronization on registration
- Session-based authentication with PostgreSQL storage

### Business Features
- **Dashboard**: Financial overview, recent transactions, quick actions
- **Transaction Management**: Income and expense tracking with categories
- **Customer Management**: Customer database with contact information
- **Financial Reports**: Analytics, charts, and HPP (Cost of Goods Sold) calculations
- **Business Settings**: Configurable business parameters

### UI/UX Components
- Responsive design with mobile-first approach
- Mobile bottom navigation for better mobile experience
- Desktop navigation with dropdown menus
- Form validation with real-time feedback
- Toast notifications for user feedback

## Data Flow

1. **Authentication Flow**:
   - User authenticates via Firebase
   - Backend creates/retrieves user record in PostgreSQL
   - Session established for subsequent requests

2. **Transaction Flow**:
   - User creates transaction via React form
   - Data validated with Zod schemas
   - API request to Express backend
   - Drizzle ORM persists to PostgreSQL
   - React Query updates UI state

3. **Data Fetching**:
   - React Query manages server state
   - Automatic caching and background updates
   - Error handling and loading states
   - Real-time UI updates on mutations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **firebase**: Authentication services
- **react-hook-form**: Form management
- **zod**: Schema validation
- **recharts**: Data visualization

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety
- **tsx**: TypeScript execution
- **esbuild**: Production bundling

## Deployment Strategy

### Development Environment
- Vite development server for frontend
- tsx for TypeScript backend execution
- Hot module replacement for rapid development
- Environment variable configuration

### Production Build
- Frontend built with Vite to static assets
- Backend bundled with esbuild for Node.js
- Single deployment artifact containing both frontend and backend
- Environment-based configuration management

### Database Management
- Drizzle migrations for schema changes
- Connection pooling via Neon serverless
- Environment-specific database URLs

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```