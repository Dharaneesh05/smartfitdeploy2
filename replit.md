# Overview

This is a full-stack web application called FitPredict that uses AI-powered body measurements and AR technology to help users predict clothing fit and reduce online shopping returns. The application allows users to capture body measurements through camera or image upload, upload clothing products for fit analysis, and visualize how clothes will fit using AR try-on technology.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React.js with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management and React Context for authentication state
- **Styling**: Tailwind CSS with shadcn/ui component library using Radix UI primitives
- **UI Components**: Comprehensive design system with reusable components including forms, modals, buttons, cards, and navigation elements

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Data Storage**: In-memory storage implementation with interface for easy database migration
- **Session Management**: Express sessions with connect-pg-simple for PostgreSQL session store
- **API Design**: RESTful endpoints for authentication, measurements, products, fit analysis, and favorites

## Data Models
The application uses a well-defined schema with the following core entities:
- **Users**: Store user credentials and profile information
- **Measurements**: Body measurements with confidence scores (chest, shoulders, waist, height, hips)
- **Products**: Clothing items with metadata and size information
- **Fit Analyses**: Results of fit predictions with recommendations
- **Favorites**: User's saved products

## Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL with Neon Database serverless
- **Migrations**: Automated schema migrations with drizzle-kit
- **Schema**: Type-safe database schema with Zod validation
- **Current Implementation**: In-memory storage with database interface for production readiness

## Authentication & Authorization
- **Strategy**: JWT tokens stored in localStorage
- **Password Security**: bcrypt hashing with salt rounds
- **Protected Routes**: Middleware-based route protection on both client and server
- **Session Management**: Persistent sessions with PostgreSQL backing

## AI/ML Integration Architecture
The application is designed to integrate with external ML services for:
- **Body Measurement**: MediaPipe for pose detection and body landmark identification
- **Computer Vision**: OpenCV for image processing and measurement extraction
- **Product Analysis**: YOLO for clothing detection and size extraction
- **OCR**: Tesseract for text recognition from clothing labels
- **AR Visualization**: Real-time AR overlay system for virtual try-on

## Privacy & Security
- **Face Blurring**: Implemented during measurement capture for user privacy
- **Data Minimization**: Only measurements stored, no raw images or videos
- **Secure Authentication**: JWT with proper expiration and validation
- **Input Validation**: Zod schemas for runtime type checking and validation

# External Dependencies

## Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router
- **react**: Frontend framework with hooks and modern patterns
- **express**: Node.js web framework for API development

## UI & Styling
- **tailwindcss**: Utility-first CSS framework
- **@radix-ui/***: Headless UI component primitives (accordion, dialog, dropdown, etc.)
- **class-variance-authority**: Dynamic class name generation
- **clsx**: Conditional CSS class composition
- **lucide-react**: Icon library

## Database & ORM
- **drizzle-orm**: Type-safe ORM for PostgreSQL
- **drizzle-zod**: Zod integration for schema validation
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **connect-pg-simple**: PostgreSQL session store for Express

## Authentication & Security
- **bcrypt**: Password hashing library
- **jsonwebtoken**: JWT token generation and validation
- **zod**: Runtime type checking and validation

## Development Tools
- **typescript**: Type safety and enhanced developer experience
- **vite**: Fast development server and build tool
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

## Specialized Libraries
- **react-webcam**: Webcam access for real-time measurement capture
- **react-hook-form**: Form state management with validation
- **@hookform/resolvers**: Form validation resolvers
- **date-fns**: Date manipulation utilities

## Planned ML/AI Services
- **MediaPipe**: Body pose detection and landmark identification
- **OpenCV**: Image processing and computer vision
- **YOLO**: Object detection for clothing items
- **Tesseract OCR**: Text extraction from product images