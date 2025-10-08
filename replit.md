# Mentorship Registration Site - Marcelo Murilo & Hamilton Felix

## Overview

This is a mentorship program registration landing page for a joint mentorship by Marcelo Murilo and Hamilton Felix. The application allows users to view program details, session schedules, and register for the mentorship with payment method selection (PIX or installments). The system sends automated confirmation emails via SendGrid upon successful registration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type safety and component-based architecture
- Vite as the build tool for fast development and optimized production builds
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI Framework:**
- Shadcn UI component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Dark mode as the primary design approach with professional aesthetics
- Custom color palette emphasizing trust and authority (dark charcoal blue backgrounds with vibrant blue accents)

**Design System:**
- Inter font family for headings and body text
- JetBrains Mono for dates and module numbers
- Consistent spacing using Tailwind's spacing scale (4, 6, 8, 12, 16, 20, 24)
- Sophisticated dark mode color scheme with HSL-based CSS variables for theme flexibility

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for the REST API
- Middleware-based request logging and error handling
- Single-page application (SPA) serving with Vite integration in development

**Data Validation:**
- Zod schema validation for type-safe data validation
- Drizzle-Zod integration for automatic schema generation from database models
- React Hook Form with Zod resolver for client-side form validation

**Storage Strategy:**
- In-memory storage implementation (MemStorage) for development
- Interface-based storage abstraction (IStorage) allowing easy migration to database
- Drizzle ORM configured for PostgreSQL (currently using Neon serverless)
- Schema-first approach with database migrations support

**Key Design Decisions:**
- The application uses an abstraction layer for storage, making it database-agnostic
- Current implementation uses in-memory storage but is structured to easily switch to PostgreSQL via Drizzle ORM
- All database schemas are defined in shared/schema.ts for type safety across client and server

### External Dependencies

**Email Service:**
- SendGrid integration for transactional emails
- Replit Connectors API for secure credential management
- Automated registration confirmation emails with payment instructions
- Dynamic email content based on payment method (PIX vs installments)

**Database:**
- Drizzle ORM configured for PostgreSQL
- Neon serverless PostgreSQL driver (@neondatabase/serverless)
- WebSocket-based connection pooling for serverless environments
- Migration system via drizzle-kit

**Authentication & Security:**
- Replit identity tokens for API authentication (REPL_IDENTITY, WEB_REPL_RENEWAL)
- Environment-based credential management
- Secure SendGrid API key handling through Replit Connectors

**Development Tools:**
- Replit-specific Vite plugins for error overlay and development banner
- Runtime error modal for improved debugging experience
- Cartographer plugin for code navigation in Replit environment

**Third-Party UI Libraries:**
- Radix UI for accessible, unstyled component primitives
- Lucide React for consistent iconography
- Embla Carousel (via dependencies) for potential carousel functionality
- CMDK for command palette interface