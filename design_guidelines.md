# Logic Bet Design Guidelines

## Design Approach
**Reference-Based: Apple Design Language**
Following Apple's philosophy of minimal, content-first design with generous whitespace, refined typography, and subtle depth. The interface prioritizes data clarity and effortless usability, essential for sports betting where users need to quickly scan odds and make decisions.

## Logo Concept
**Logic Bet Wordmark:**
- Clean, geometric sans-serif letterform
- Emphasis on "Logic" with slight weight difference from "Bet"
- Optional: Minimalist icon mark featuring abstract angular shapes suggesting data/analytics
- Monochromatic treatment for versatility

## Typography System

**Font Stack:**
- Primary: System fonts (-apple-system, SF Pro Display equivalent via "Inter" or "Helvetica Neue")
- Monospace: For odds/numbers ("SF Mono" equivalent via "Roboto Mono")

**Hierarchy:**
- Hero/Login Titles: text-5xl to text-6xl, font-light
- Page Headers: text-3xl, font-semibold
- Section Headers: text-xl, font-medium
- Body Text: text-base, font-normal
- Data/Odds: text-sm to text-base, font-medium (monospace)
- Captions: text-xs, font-normal

## Layout System

**Spacing Primitives:**
Use Tailwind units: 4, 6, 8, 12, 16, 24, 32 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: space-y-8 to space-y-12
- Card gaps: gap-6
- Page margins: px-8 md:px-16 lg:px-24

**Container Strategy:**
- Max-width: max-w-7xl for dashboard
- Login page: max-w-md centered
- Generous breathing room: never cramped layouts

## Component Library

### 1. Login Page
**Structure:**
- Centered card (max-w-md) on clean background
- Logic Bet logo at top (centered, mb-12)
- Heading: "Welcome Back" or "Sign In" (text-4xl, font-light, mb-8)
- Clean input fields with subtle borders, rounded-lg
- Primary CTA button: full-width, py-4, rounded-lg, font-medium
- "Or continue with" divider with OAuth options (Google, GitHub icons)
- Subtle footer text for sign-up link

**Input Fields:**
- Height: h-12 to h-14
- Border: border with focus:ring treatment
- Rounded: rounded-lg
- Padding: px-4
- Labels: text-sm, font-medium, mb-2

### 2. Dashboard Layout
**Navigation:**
- Minimal top bar (h-16) with:
  - Logic Bet logo (left)
  - Primary nav links: Dashboard, Live Bets, History, Profile
  - User avatar/menu (right)
- Sticky positioning for constant access

**Main Content Area:**
- Two-column responsive grid: sidebar (1/4) + main content (3/4)
- Sidebar: Quick stats, active bets summary (sticky)
- Main: Betting tables and live game cards

### 3. Data Display Components

**Game Cards:**
- Clean white cards with subtle shadow (shadow-sm)
- Rounded corners: rounded-xl
- Padding: p-6
- Layout: Team names (text-lg, font-semibold), game time (text-sm), odds in monospace
- Hover: subtle shadow increase (hover:shadow-md)

**Betting Tables:**
- Borderless design with subtle row dividers
- Header row: text-xs, font-semibold, uppercase, tracking-wide
- Data rows: text-sm, monospace for odds
- Alternating row background: subtle stripe pattern
- Padding: px-6, py-4 for cells
- Responsive: stack to cards on mobile

**Stats Cards:**
- Compact cards showing key metrics
- Large number display (text-3xl, font-bold, monospace)
- Label below (text-xs, uppercase, tracking-wide)
- Grid layout: 3-4 columns on desktop, 2 on tablet, 1 on mobile

**Live Odds Display:**
- Monospace typography for all numerical data
- Real-time indicator: small pulsing dot
- Up/down arrows for odds changes
- Timestamp in caption size

### 4. Buttons & CTAs
**Primary Actions:**
- Height: h-11 to h-12
- Rounded: rounded-lg
- Padding: px-6
- Font: font-medium
- Transition: All interactions smooth (transition-all duration-200)

**Secondary Actions:**
- Outline style with border
- Same dimensions as primary

**Icon Buttons:**
- Square: w-10 h-10
- Rounded: rounded-lg
- Center icon with flex

## Dashboard-Specific Features

**Quick Bet Panel:**
- Fixed/sticky panel for rapid bet placement
- Compact form with dropdown selects and numeric inputs
- Instant feedback on bet validation

**Filters & Sorting:**
- Minimal dropdown selects
- Toggle buttons for view modes (List/Grid)
- Search input with icon (rounded-full, subtle background)

**Empty States:**
- Large icon (w-16 h-16, opacity-20)
- Message: text-lg, font-medium
- Subtext: text-sm
- CTA button to prompt action

## Responsive Behavior

**Breakpoints:**
- Mobile: Stack all multi-column layouts
- Tablet (md:): 2-column grids
- Desktop (lg:): Full 3-4 column layouts

**Dashboard Navigation:**
- Mobile: Hamburger menu with slide-out drawer
- Desktop: Horizontal nav bar

## Data Visualization

**Minimal Charts:**
- Clean line charts for betting trends
- Use Chart.js or Recharts with minimal styling
- Single accent treatment, no gradients
- Grid lines: subtle, dotted
- Tooltips: Clean cards with shadows

## Interaction Patterns

**Loading States:**
- Skeleton screens matching component structure
- Pulse animation on placeholders
- No spinners unless micro-interactions

**Notifications:**
- Toast notifications (top-right)
- Slide-in animation
- Auto-dismiss after 4s
- Icons for success/error/info states

## Accessibility
- All inputs have visible labels
- Focus states: ring-2 with offset
- Sufficient contrast for all text
- Keyboard navigation fully supported
- Screen reader labels for icon-only buttons

## Images
No large hero images required. The design prioritizes data density and functionality. Logo serves as primary visual branding element. Consider optional subtle background texture or gradient for login page only.