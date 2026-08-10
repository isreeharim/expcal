<div align="center">
  <h1>📊 ExpCal</h1>
  <p><strong>Professional Financial Tracking & Project Analytics Platform</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#security--rls">Security</a> •
    <a href="#testing">Testing</a> •
    <a href="#license">License</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js_16-black?style=flat&logo=next.js" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React_19-blue?style=flat&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white" alt="Vitest" />
  </p>
</div>

---

## 🌟 Overview

**ExpCal** is a full-stack, enterprise-grade financial management and time tracking platform built with Next.js 16 (App Router), Tailwind CSS v4, and Supabase. It offers role-based access control, project financial analytics, receipt photo attachments, PDF invoice generation, and automated Google Sheets backups.

---

## ✨ Features

- 💼 **Multi-Project Management**: Manage projects with distinct color coding, metadata, hourly rate tracking, and time logging.
- 💰 **Financial Hierarchy**: Dynamic calculation of Income, Itemized Expenses, Hours Worked, and Net Profit/Loss with real-time stat cards.
- 📱 **Mobile-First High Density UX**: Responsive card layout designed for rapid touch scanning, collapsible expense details, and fluid navigation.
- 🧾 **WYSIWYG Invoice Generator**: PDF export engine adhering to standard A4 printable dimensions with customizable rates, notes, and auto-computed taxes.
- 🛡️ **Role-Based Access Control (RBAC)**: Secure multi-tenant architecture with Row Level Security (RLS), isolated user data, and an administrative control panel.
- ⚡ **Performance Optimized**: Sub-second queries, $O(1)$ precomputed map lookups, paginated data loading, and optimized WebP images.
- ☁️ **Automated Google Sheets Sync**: Batched server-side sync mechanism to backup database snapshots to Google Sheets with SSRF prevention and timeout handling.
- 🧪 **Automated Testing Suite**: Vitest unit and security test suites covering authorization guards, duration math, and payload sanitation.

---

## 🏗️ Architecture & Directory Structure

```text
expcal/
├── .github/workflows/          # Automated GitHub Actions CI (Lint, Test, Build)
├── app/                        # Next.js 16 App Router
│   ├── (auth)/                 # Authentication routes (login, register)
│   ├── (dashboard)/            # Authenticated application views
│   │   ├── admin/              # Administrator workspaces & user management
│   │   ├── analysis/           # Visual analytics & financial breakdown
│   │   ├── dashboard/          # User dashboard & project list
│   │   └── project/[id]/       # Detailed project views & entry logs
│   ├── api/                    # Serverless API routes (backup, cron, keep-alive)
│   └── globals.css             # Tailwind v4 theme tokens & accessibility styles
├── components/                 # Reusable UI component library
│   ├── admin/                  # Admin-specific tables & dialogs
│   ├── dashboard/              # Stat cards & interactive charts
│   ├── layout/                 # Navigation, sidebar, and mobile nav
│   ├── project/                # Entries table, invoice modal, entry form
│   └── ui/                     # Accessible primitive UI components (Radix/base-ui)
├── lib/                        # Core utilities & Server Actions
│   ├── actions/                # Server actions (auth, projects, entries, backup)
│   ├── auth-guards.ts          # Centralized server-side authorization helpers
│   ├── pdf-generator.ts        # PDF invoice generation engine
│   ├── supabase/               # Supabase client & server factories
│   ├── types.ts                # TypeScript domain models & interfaces
│   └── utils.ts                # Formatting, duration calculations, and math
├── public/                     # Static assets & PWA manifest
├── scripts/                    # Helper scripts (Google Apps Script backup worker)
├── supabase/migrations/        # Version-controlled PostgreSQL migrations & RLS policies
└── tests/                      # Automated Vitest test suite
```

---

## 🔒 Security & RLS Philosophy

1. **Primary Boundary — Supabase RLS**: PostgreSQL policies strictly constrain data access at the database layer. Users can only select, insert, update, or delete rows where `user_id = auth.uid()`.
2. **Server Action Authorization**: Every server action validates caller identity and roles through centralized guards (`requireUser`, `requireAdmin`, `requireProjectAccess`).
3. **Magic-Bytes File Inspection**: Image uploads are verified via binary header inspection (JPEG, PNG, WebP, GIF) to prevent disguised executable payloads.
4. **Storage Folder Isolation**: Storage bucket policies enforce folder names matching `auth.uid()::text`, preventing cross-tenant path traversal and file overwrites.
5. **SSRF & Injection Defense**: Outbound webhook URLs are validated against strict domain whitelists (`https://script.google.com/macros/s/`), and CSV export values are sanitized.
6. **HTTP Security Headers**: Strict CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy` headers.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `20.x` or later
- npm `10.x` or later
- Supabase account & project

### 1. Clone & Install
```bash
git clone https://github.com/isreeharim/expcal.git
cd expcal
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and populate your Supabase credentials:
```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Apply Database Migrations
Execute the migrations in [`supabase/migrations/`](file:///c:/Users/Sreehari/OneDrive/Desktop/expense/supabase/migrations/) in sequential order in your Supabase SQL Editor:
- `001_initial_schema.sql` — Schema tables, views, and core RLS
- `002_google_sheets_backup.sql` — Settings table for backup sync
- `003_performance_indexes.sql` — Composite indexes for rapid queries
- `004_security_hardening.sql` — Storage isolation & admin RLS lockdown

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing & Validation

```bash
# Run unit & security test suite with Vitest
npm run test

# Run ESLint validation
npm run lint

# Compile Next.js production build
npm run build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
