# ExpenseTrack

A modern Progressive Web Application (PWA) and Web Platform for tracking expenses, income, and project time. Built with Next.js 16, Tailwind CSS v4, shadcn/ui, and Supabase.

## Features

- **Multi-Role Authentication**: Built-in User and Admin role-based access control.
- **Project Tracking**: Create and manage multiple projects with individual income, expense, and time tracking.
- **Detailed Entries**: Log start time, end time, income, itemized expenses (Food, Water, Transport, etc.), and receipt photos.
- **Admin Panel**: System-wide control panel with platform analytics, user management, and project overview.
- **Progressive Web App (PWA)**: Installable on mobile and desktop with offline support.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase (PostgreSQL, RLS, Storage)
- **Styling**: Tailwind CSS v4, Glassmorphism, CSS Modules
- **UI Components**: shadcn/ui, Lucide Icons
- **Charts**: Chart.js

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/isreeharim/expcal.git
   cd expcal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
