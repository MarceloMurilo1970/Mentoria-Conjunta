# Design Guidelines: Mentorship Registration Site - Marcelo Murilo & Hamilton Felix

## Design Approach
**Selected Approach**: Reference-Based with inspiration from premium educational platforms (Masterclass, Course creators) combined with professional service landing pages. The design emphasizes credibility, exclusivity, and clear conversion paths.

**Key Principles**:
- Trust and authority through professional aesthetics
- Dark, sophisticated color palette with strategic blue accents
- Clear visual hierarchy guiding users toward registration
- Balanced content density - informative without overwhelming

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**
- Background Base: `220 15% 8%` (Deep charcoal blue)
- Surface/Cards: `220 15% 12%` (Elevated dark)
- Surface Hover: `220 15% 16%` (Interactive surface)

**Primary Blue (Brand)**
- Primary: `210 100% 55%` (Vibrant blue for CTAs)
- Primary Hover: `210 100% 48%` (Active state)
- Primary Light: `210 100% 65%` (Highlights, borders)

**Accent & Supporting**
- Text Primary: `0 0% 98%` (High contrast white)
- Text Secondary: `220 10% 70%` (Muted text)
- Text Muted: `220 10% 50%` (Subtle information)
- Success Green: `142 76% 45%` (Confirmation states)
- Border: `220 15% 20%` (Subtle dividers)

### B. Typography

**Font Families**
- Headings: `'Inter', sans-serif` (700, 600, 500 weights)
- Body: `'Inter', sans-serif` (400, 500 weights)
- Accent/Numbers: `'JetBrains Mono', monospace` (for dates, module numbers)

**Type Scale**
- Hero Title: `text-5xl md:text-6xl font-bold` (60-72px)
- Section Headers: `text-3xl md:text-4xl font-bold` (36-48px)
- Subsection: `text-2xl font-semibold` (30px)
- Body Large: `text-lg` (18px)
- Body: `text-base` (16px)
- Small/Meta: `text-sm` (14px)

### C. Layout System

**Spacing Primitives**: Use Tailwind units of `4, 6, 8, 12, 16, 20, 24` for consistent rhythm
- Section padding: `py-20 md:py-24` (major sections)
- Component spacing: `space-y-8` or `gap-8` (between elements)
- Card padding: `p-6 md:p-8` (content containers)
- Micro-spacing: `gap-4` (inline elements)

**Container Strategy**
- Max-width: `max-w-7xl mx-auto px-6 md:px-8`
- Form containers: `max-w-2xl mx-auto`
- Content sections: Full width with inner max-w-7xl

### D. Component Library

**Hero Section**
- Full-width promotional image with dark overlay
- Centered headline + subheadline stack
- Primary CTA button (blue, large, prominent)
- Mentor photos/logos integrated subtly

**Program Section**
- Two-column grid on desktop (`grid-cols-1 md:grid-cols-2 gap-8`)
- Module cards with dark elevated backgrounds
- Session list with numbered items, dates in monospace
- Visual separation between Módulo 1 and 2

**Registration Form**
- Single column, centered layout
- Grouped input fields with labels above
- Dark input backgrounds (`bg-gray-900/50 border-gray-700`)
- Focus state: blue border + subtle glow
- Large submit button matching hero CTA style

**Trust Elements**
- Mentor credentials section (2-column: images + bio snippets)
- Social proof indicators if available
- Clear "next steps" timeline after registration

**Navigation/Header**
- Sticky header with dark background + blur backdrop
- Mentorship logo/title on left
- Registration CTA on right (desktop)
- Mobile: Hamburger menu if needed

**Footer**
- Dark footer with contact information
- Links to privacy/terms
- SendGrid/Mercado Pago trust badges (subtle)

### E. Interactions & States

**Button States**
- Primary: Solid blue, white text, slight shadow
- Hover: Darker blue, subtle lift (transform translateY(-1px))
- On images: Blur background (`backdrop-blur-md bg-blue-500/20 border border-blue-400`)
- No custom hover states for outline buttons - rely on native

**Form Interactions**
- Input focus: Blue border glow (`ring-2 ring-blue-500/50`)
- Validation: Red border for errors, green checkmark for success
- Disabled states: Reduced opacity (40%)

**Micro-animations** (minimal)
- Fade-in for sections on scroll (optional, subtle)
- Button hover lift (1-2px)
- Form success: Gentle scale + fade transition

## Images

**Hero Image** (Large, full-width)
- Use provided promotional image featuring both mentors
- Apply dark gradient overlay (bottom to top, opacity 40-60%)
- Position: Cover, center-aligned
- Overlay text in white with high contrast

**Mentor Profiles**
- Individual mentor headshots (if available from promotional materials)
- Circular or rounded-rectangle crops
- Positioned in credentials/about section
- Size: 150-200px on desktop, 120px mobile

**Background Elements**
- Subtle gradient mesh or geometric pattern in hero background
- Optional: Abstract tech/data visualization patterns as section backgrounds (very subtle, 5-10% opacity)

## Critical Page Structure

1. **Hero Section** (80vh): Promotional image, headline "Mentoria Conjunta: Marcelo Murilo & Hamilton Felix", primary CTA
2. **Program Overview** (auto height): Full program display with Módulo 1 and 2 details, dates, session descriptions
3. **About Mentors**: Credentials, expertise, social proof
4. **Registration Form**: Comprehensive form with all required fields, clear instructions about payment and confirmation
5. **Payment Information**: Clear explanation of next steps, Mercado Pago link integration
6. **Footer**: Contact, legal, trust indicators

**Viewport Management**: Hero uses 80vh, all other sections use natural content height with generous padding (py-20 to py-24)