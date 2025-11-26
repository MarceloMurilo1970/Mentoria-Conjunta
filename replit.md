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

## Recent Changes (November 26, 2025)

**Latest Updates - Session Deliverables & Module Restructure:**
- **Session Cards with Deliverables:** Each of the 8 Módulo 1 sessions now includes a dedicated "Entregas" section with document icon
  - Common deliverables: Session summary, recording access, weekly action plan
  - Session-specific deliverables highlighted in primary color:
    - Session 1: PREP-MM analysis + LinkedIn assessment + suggested companies, purpose, personas, and pain points
    - Session 2: Deep LinkedIn profile analysis with ready-to-copy Headline, About section, and experience descriptions
    - Session 3: Personalized prompts for insights, posts, and images + AI customization instructions
    - Session 4: Personalized prompts for comments, replies, and newsletter content + AI customization instructions
    - Session 5: Automation tools instructions for strategic connections and business conversations
    - Session 6: 5C Assessment measuring competencies with complete development plan
    - Session 7: Impact Assessment for measuring and demonstrating board value
    - Session 8: Complete Module 1 consolidation and Module 2 preparation checklist
- **New Session 8 Added:** "Revisão Completa do Módulo 1" - Complete review and Q&A session
- **Module 2 Restructured:** Now features 4 focused cards from Hamilton Felix:
  1. Prospecção de Empresas (company prospecting)
  2. Fechamento de Projetos (project closing)
  3. Implementando o Conselho (implementing the board)
  4. Evoluindo o Conselho (evolving the board)
- **Updated Video URLs:** All testimonial videos now use marcelomurilo SharePoint domain
- **Testimonials Reordered:** Now alphabetically ordered (Isabella, Luiz, Marcelo, Rodrigo)
- **Fourth Testimonial Added:** Luiz Fernando Bueno with photo, video, and LinkedIn

**Previous Updates - Consistent Highlighted Phrase Display (November 25, 2025):**
- **Unified Testimonial Pattern:** ALL testimonials with `highlightPhrase` now follow the same visual pattern
  - **Highlighted phrase displayed as large quote at top** (text-lg, font-semibold, text-primary, italic, with quotes)
  - **Followed by testimonial text below** (preview for long texts, full text for short texts)
  - This ensures consistent styling regardless of text length
- **Isabella Salton's Complete Testimonial:**
  - Updated from placeholder to full testimonial text (~1008 chars)
  - Highlighted phrase: "O trabalho é muito personalizado e com entregas de alto valor."
  - Professional testimonial focusing on personalized mentorship, methodology clarity, and transformative results
- **Smart Expand/Collapse Logic:**
  - Expand button appears only for texts >500 characters
  - **Display Patterns:**
    - **Long text (>500 chars) with highlightPhrase**: Large quote at top + preview text + expand button
    - **Short text (≤500 chars) with highlightPhrase**: Large quote at top + full text + NO expand button
    - **Long text without highlightPhrase**: Truncated preview + expand button
    - **Short text without highlightPhrase**: Full text + NO expand button
- **Current Testimonials Display:**
  - **Rodrigo Padovez** (~987 chars): Large quote at top, preview text, expand button
  - **Marcelo Martin** (~299 chars): Large quote at top, full text visible, NO expand button
  - **Isabella Salton** (~1008 chars): Large quote at top, preview text, expand button
- All three testimonials include real photos for video thumbnails and avatars, LinkedIn links, and responsive design

**Previous Updates - Photo Thumbnails for Video Testimonials (November 25, 2025):**
- **Added Real Photos:**
  - Marcelo Martin: `attached_assets/image_1764036231605.png`
  - Isabella Salton: `attached_assets/image_1764036258435.png`
- **TestimonialTile Component:**
  - Added separate `videoThumbnail` prop (distinct from `photo` prop for avatars)
  - All video thumbnails now show real photos instead of gray placeholders

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