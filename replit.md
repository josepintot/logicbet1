# Logic Bet - Sports Betting Dashboard

## Overview
Logic Bet is a minimal, Apple-inspired sports betting dashboard that provides users with real-time odds and game data across multiple sports. The application emphasizes clean design, abundant whitespace, and elegant typography to create a premium user experience.

## Project Structure

### Frontend
- **Landing Page**: Clean, minimal landing page for logged-out users with Logic Bet branding
- **Dashboard**: Main dashboard for authenticated users displaying live and upcoming games
- **Components**:
  - `GameCard`: Individual game cards showing teams, odds, and game details
  - `StatsOverview`: Overview cards displaying key statistics (live games, upcoming, total)
  - `GamesTable`: Table view for upcoming games with detailed information
  
### Backend
- **Authentication**: Replit Auth (OIDC) supporting Google, GitHub, email/password
- **Database**: PostgreSQL with Drizzle ORM
- **API Endpoints**:
  - `/api/auth/user`: Get authenticated user information
  - `/api/games`: Get all games with betting odds
  - `/api/login`, `/api/logout`, `/api/callback`: Auth routes

### Data Models
- **Users**: User accounts (managed by Replit Auth)
- **Games**: Sports games with teams, odds, and status
- **Bets**: User betting records (future feature)

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: Replit Auth (OpenID Connect)
- **ORM**: Drizzle

## Design Philosophy
Following Apple's design language:
- Minimal, clean interfaces with generous whitespace
- Refined typography using Inter and Roboto Mono
- Subtle interactions and smooth transitions
- Data-first approach prioritizing clarity
- Responsive design across all breakpoints

## Sports Supported
- Football (Soccer) ⚽
- Basketball 🏀
- Tennis 🎾
- Baseball ⚾
- Hockey 🏒

## User Preferences
- Design: Minimal, Apple-inspired aesthetic
- Color scheme: Professional blue primary with neutral grays
- Company: Logic Bet
