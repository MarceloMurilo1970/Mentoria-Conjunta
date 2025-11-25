# Mentorship Registration Site - Marcelo Murilo & Hamilton Felix

## Overview

This project is a dual-purpose platform for Marcelo Murilo and Hamilton Felix's mentorship program. Its primary goal is to facilitate registrations for a promotional live event and a comprehensive mentorship program (Turma 2). The platform aims to attract board members (active or transitioning) by showcasing the value proposition of developing authority and securing board positions.

Key capabilities include:
- **Event Landing Page (`/`):** Pre-registration for a promotional live event with Google Sheets integration and WhatsApp group invite.
- **Mentorship Registration (`/mentoria`):** Main registration page for the Turma 2 mentorship program, including program details, testimonials, payment processing, and SendGrid confirmations.

The program schedule for Turma 2 runs from January to March 2026, covering topics on creating authority, building opportunities, and conquering board positions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack:** React with TypeScript, Vite, Wouter for routing, and TanStack Query for data fetching.
- **UI Framework:** Shadcn UI (built on Radix UI) and Tailwind CSS for utility-first styling.
- **Design:** Dark mode primary design with a professional aesthetic, custom color palette emphasizing trust and authority (dark charcoal blue with vibrant blue accents), Inter font for text, and JetBrains Mono for dates/numbers.

### Backend Architecture
- **Server Framework:** Express.js with TypeScript for the REST API, including middleware for logging and error handling.
- **Data Validation:** Zod for schema validation (server-side) and React Hook Form with Zod resolver (client-side).
- **Storage Strategy:** PostgreSQL database (Neon serverless) via Drizzle ORM. Features an interface-based storage abstraction for database-agnostic flexibility.
- **Database Schema:** `registrations` table with `id`, `name`, `email`, `phone`, `payment_method`, and `created_at`.
- **Admin Page:** An unauthenticated `/admin` page displays all mentorship registrations.

### UI/UX Decisions
- **Event Page (`/`):** Features a full-screen hero section with gradient overlays, a countdown timer to the live event, a dark-themed registration form, and smooth scroll animations.
- **Mentorship Page (`/mentoria`):** Includes a back button, "Para Quem é Esta Mentoria" section, testimonial tiles with expand/collapse, video thumbnail support, and a comprehensive "Jornada Completa da Mentoria" section detailing frameworks (PREP, LinkedIn Estratégico, Autoridade por Conteúdo, Interações, Networking, 5C).
- **Testimonials:** Reusable `TestimonialTile` component supporting text, avatars, LinkedIn links, and optional video thumbnails with hover effects.

### Technical Implementations
- **Countdown Timer:** Real-time, timezone-aware countdown on the event page.
- **Video Testimonials:** Enhanced `TestimonialTile` component to support embedded video testimonials with custom thumbnails and play buttons.
- **Methodology Expansion:** Added detailed content for "Due Diligence e Entrada Estratégica em Conselhos" and renumbered existing modules for clarity.
- **Personalized Prompts:** Integrated information about personalized prompts for LinkedIn content and engagement strategies within methodology cards.
- **Email Error Handling:** Improved UX for SendGrid failures, ensuring payment instructions are always visible.

## External Dependencies

- **Email Service:** SendGrid for transactional emails (registration confirmations, admin notifications) secured via Replit Connectors. Dynamic content based on payment method and admin notification to three specific email addresses.
- **Payment Integration:**
    - PIX payment: R$ 8.000,00 (CNPJ 17.840.516/0001-47).
    - Credit card installments: 5x R$ 1.750,00 via Infinite Pay (specific payment link provided).
- **Database:** PostgreSQL (Neon serverless) managed by Drizzle ORM, utilizing `@neondatabase/serverless` for connection pooling.
- **Authentication & Security:** Replit identity tokens for API authentication and Replit Connectors for secure API key management (e.g., SendGrid).
- **Development Tools:** Replit-specific Vite plugins for error overlay and development banner, Cartographer plugin.
- **Third-Party UI Libraries:** Radix UI for accessible components, Lucide React for iconography, Embla Carousel, CMDK.
- **Google Sheets Integration:** Replit's native Google Sheets connector for secure OAuth, used to save event registrations to a specific spreadsheet (ID: 1-fCalJZRLnerVeTsPQhetEOiM816FxLWquS6kX47o1k) with automatic timestamping.

## Recent Changes (November 25, 2025)

**Latest Updates - New Video Testimonials (Marcelo Martin & Isabella Salton):**
- **Two New Testimonials Added:** Replaced generic placeholder testimonials with real mentorados
  - **Marcelo Martin** (Conselheiro):
    - LinkedIn: https://www.linkedin.com/in/marcelomartin-advisor/
    - Video: SharePoint testimonial (IQBw9_t10mjLRJN_GIq7q3P0ARFE9RDna_GPRXGcx4mvy8w)
    - Full testimonial text (299 chars)
    - Highlighted phrase: "Realmente uma oportunidade fantástica!" (styled in vibrant blue)
  - **Isabella Salton** (Conselheira):
    - LinkedIn: https://www.linkedin.com/in/isabellasalton/
    - Video: SharePoint testimonial (IQCdjGqbuYLGRa8Wscsv9zu9AZ0n8as8rXxw3uyQf7zjpKo)
    - Placeholder text: "Aguardando o depoimento" (pending full testimonial)
- **TestimonialTile Logic Fix:** Refactored `renderText()` function to properly handle highlighted phrases for ALL text lengths
  - Previous bug: highlightPhrase only worked for texts > 300 chars
  - Fixed: Now works for both short texts (≤ 300 chars) and long texts (> 300 chars)
  - Short text with highlight: splits text and renders phrase with `font-semibold text-primary` (vibrant blue)
  - Long text with highlight: shows large highlighted quote + text preview
  - Verified color: rgb(0, 122, 245) - vibrant blue primary color
  - Works on both desktop and mobile viewports
- **Current Testimonials:** Site now features 3 real testimonials with video links:
  1. Rodrigo Padovez (Especialista em Healthtech) - with photo
  2. Marcelo Martin (Conselheiro) - no photo, avatar with initials
  3. Isabella Salton (Conselheira) - no photo, avatar with initials
- All testimonials include video thumbnails, LinkedIn links, and responsive design

**Previous Updates - Video Testimonials Feature (November 24, 2025):**
- **Video Thumbnail Feature:** Added support for video testimonials on mentoria page
  - Enhanced TestimonialTile component with optional `videoUrl` prop
  - When videoUrl is present, displays clickable video thumbnail above testimonial text
  - Video thumbnail design: 16:9 aspect ratio, gradient background, play button, hover effects
  - Opens in new tab (target="_blank", rel="noopener noreferrer")
  - Full backward compatibility maintained

**Previous Updates - Countdown Timer (November 24, 2025):**
- **Event Page Countdown:** Added real-time countdown timer to event landing page
  - Displays time remaining until Dec 4, 2025, 8:00 PM BRT
  - Four units: Days, Hours, Minutes, Seconds (all with leading zeros)
  - Updates every second with proper cleanup on unmount
  - Dark theme styling with backdrop blur
  - Fully responsive design
  - Component: CountdownTimer.tsx with timezone-aware calculation (-03:00 GMT)