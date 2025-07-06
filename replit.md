# Resume Optimizer Pro

## Overview

ResumeOptimizer Pro is a full-stack web application built with Node.js and Express.js that helps users optimize their resumes using AI-powered analysis. The application allows users to upload their resume, receive role suggestions from Google's Gemini AI, generate tailored cover letters, and download optimized documents through a Stripe-based payment system.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **Component Library**: Shadcn/ui components for consistent UI design

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **AI Integration**: Google Gemini API for resume analysis and content generation
- **Payment Processing**: Stripe for handling payments and downloads
- **File Processing**: Multer for file uploads with support for PDF and DOCX formats

### Key Components

#### Database Schema
The application uses five main tables:
- `users`: Stores user email and basic information
- `resumes`: Stores uploaded resume files and extracted text
- `resume_analysis`: Stores AI-generated role suggestions and skills analysis
- `job_optimizations`: Stores job-specific resume optimizations and cover letters
- `payments`: Tracks Stripe payment intents and download permissions

#### AI Processing Pipeline
1. **Resume Analysis**: Extracts text from uploaded files and analyzes with Gemini AI
2. **Role Suggestions**: Generates job role recommendations based on resume content
3. **Job Matching**: Compares resume against specific job descriptions
4. **Content Generation**: Creates optimized resume content and tailored cover letters

#### Payment Flow
1. Users preview watermarked documents before purchase
2. Stripe payment intent created for $9.99 purchase
3. Payment confirmation enables document downloads
4. Generated PDFs delivered without watermarks

## Data Flow

1. **Upload Phase**: User uploads resume → Text extraction → AI analysis → Role suggestions
2. **Optimization Phase**: User selects roles → Job description input → AI comparison → Content generation
3. **Preview Phase**: Watermarked document preview → Payment processing
4. **Download Phase**: Payment verification → PDF generation → Document delivery

## External Dependencies

### Core Dependencies
- **@google/genai**: Google Gemini AI integration
- **@neondatabase/serverless**: Neon database connection
- **stripe**: Payment processing
- **drizzle-orm**: Database ORM
- **multer**: File upload handling

### Frontend Dependencies
- **@radix-ui/react-***: UI component primitives
- **@tanstack/react-query**: Server state management
- **@stripe/stripe-js**: Stripe payment elements
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety
- **tsx**: TypeScript execution

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- Express server with automatic restart
- PostgreSQL database with Drizzle ORM for data persistence
- Environment variables for API keys and database connections

### Production Build
- Vite builds client assets to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Static file serving from Express
- Database migrations via Drizzle Kit

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Google Gemini AI API key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key for client

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 06, 2025. Initial setup
- July 06, 2025. Fixed Gemini AI integration to process real user data instead of dummy data
  - Added pdf-parse and mammoth libraries for actual PDF and DOCX text extraction
  - Enhanced error handling and logging in AI service functions
  - Resolved TypeScript compilation errors in storage layer
- July 06, 2025. Integrated PostgreSQL database with Drizzle ORM
  - Created DatabaseStorage class replacing in-memory storage
  - Successfully migrated database schema with all required tables
  - Updated storage layer to use real database persistence
- July 06, 2025. Major fixes and improvements based on user feedback
  - Fixed PDF generation using Puppeteer for proper PDF downloads instead of corrupted files
  - Switched back to in-memory storage (MemStorage) instead of database
  - Added AI explanation field to role suggestions with detailed reasoning
  - Added AI processing time remarks across all AI-powered buttons
  - Updated database schema to include explanation field for resume analysis
  - Fixed TypeScript compilation errors in storage operations