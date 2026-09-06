# 🏠 Dream Home Online

A full-stack real-estate marketplace built with **Next.js 14 (App Router)**, TypeScript, Tailwind CSS, shadcn/ui, Prisma, and NextAuth.

Buyers and renters can search property listings, save favorites, send inquiries, schedule viewings, and manage their account. Verified agents can publish and manage listings, respond to inquiries, and confirm viewings. Admins oversee users, listing approvals, and content reports.

---

## ✨ Features

**Public**
- Homepage with hero search, featured & latest listings, popular locations, testimonials, and stats
- Property browsing with filters (keyword, city, type, listing type, price, bedrooms, bathrooms, amenities) + sorting + pagination
- Property detail pages with image gallery, specs, amenities, contact agent, schedule viewing, and report buttons
- Public agent profile pages
- About & Contact pages
- SEO: metadata, `sitemap.xml`, `robots.txt`, JSON-LD-ready

**Accounts & Auth**
- Email/password registration & login (bcrypt, NextAuth JWT)
- Optional Google OAuth sign-in
- Role-based access: `USER`, `AGENT`, `ADMIN`
- Forgot / reset password (with a dev reset link since no SMTP is configured by default)

**User Dashboard**
- Overview stats, saved favorites, your inquiries, your viewings, notifications
- Profile settings and change-password

**Agent Dashboard**
- Overview stats, list & manage your properties (add/edit/delete)
- Image upload (local disk by default, Cloudinary-ready)
- Respond to inquiries and confirm/cancel viewings
- Agent accounts require admin approval before listing publicly

**Admin Dashboard**
- Platform-wide stats
- Manage users (change role, approve agents, delete)
- Approve / reject / archive property listings
- Review and resolve/dismiss property reports

---

## 🧱 Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 14.2 (App Router)                         |
| Language   | TypeScript                                        |
| Styling    | Tailwind CSS + shadcn/ui (Radix UI)               |
| Database   | Prisma ORM (SQLite by default)                    |
| Auth       | NextAuth v4 (Credentials + Google)                |
| Validation | Zod                                                |
| Forms      | React Hook Form (available)                       |
| Toast      | Sonner                                            |
| Icons      | lucide-react                                      |
| Tests      | Vitest (unit tests for utils & validation)        |

> **Database:** The app runs on **SQLite** out of the box (zero setup) for local development and on **PostgreSQL** in production (Render). `prisma/schema.prisma` is committed statically with `provider = "postgresql"` (the production target) and is **never mutated**. Local dev derives a gitignored SQLite copy (`prisma/schema.dev.prisma`) via `scripts/prisma-dev-schema.mjs`, driven by the `db:*` npm scripts.

---

## 🚀 Getting Started

### Prerequisites
- Node.js **18.20+** and npm 10+

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Configure environment

Copy the sample env file and edit as needed:

```bash
cp .env.example .env
```

Key variables:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
# Image storage
STORAGE_DRIVER=local
# Cloudinary (optional, if STORAGE_DRIVER=cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Set up the database & seed

```bash
npm run db:push     # switches schema to sqlite if your DATABASE_URL is file:./dev.db
npm run db:seed
```

> Use `npm run db:*` (not raw `npx prisma ...`) so the datasource provider is
> switched to match your `DATABASE_URL` automatically.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔑 Demo Accounts

All use the password: `Password123!`

| Role  | Email                   |
| ----- | ----------------------- |
| User  | `user@dreamhome.com`    |
| Agent | `sarah@dreamhome.com`   |
| Admin | `admin@dreamhome.com`   |

---

## 🖥️ Scripts

| Command                  | Description                          |
| ------------------------ | ------------------------------------ |
| `npm run dev`            | Start the dev server                 |
| `npm run build`          | Generate Prisma client + build       |
| `npm start`              | Start the production server          |
| `npm run lint`           | Run ESLint                           |
| `npm run typecheck`      | Run TypeScript type checking         |
| `npm test`               | Run unit tests (Vitest)              |
| `npm run test:watch`     | Run unit tests in watch mode         |
| `npm run db:push`        | Push schema to the database          |
| `npm run db:seed`        | Seed the database                    |
| `npm run db:studio`      | Open Prisma Studio                   |

---

## 🗂️ Project Structure

```
prisma/
  schema.prisma        # Data model (SQLite/Postgres-agnostic)
  seed.ts              # Demo data + accounts
src/
  app/
    (page + route handler routes)
    api/               # Route handlers (auth, favorites, inquiries, viewings,
                       # reports, properties, agent/*, admin/*, upload, notifications)
    admin/             # Admin dashboard
    agent/             # Agent dashboard + /agent/[id] public profile
    dashboard/         # User dashboard
  components/
    ui/                # shadcn/ui primitives
    dashboard/         # user / agent / admin shells
    property/          # gallery, contact form, schedule viewing, report
  lib/
    enums.ts           # Canonical app enums (String-backed)
    auth.ts            # NextAuth configuration
    session.ts         # server + API auth guards
    validations.ts     # Zod schemas
    storage.ts         # local / Cloudinary image storage
    home.ts            # Home page data fetching
  services/            # Data-access layer
  types/               # Shared types + NextAuth augmentation
```

---

## 🗃️ Database Overview

- **SQLite** via `DATABASE_URL="file:./dev.db"` (Prisma).
- Models: `User`, `Account`, `Session`, `VerificationToken`, `PasswordResetToken`, `Property`, `PropertyImage`, `Amenity`, `PropertyAmenity`, `Favorite`, `Inquiry`, `Viewing`, `Notification`, `Report`.
- Enums are stored as **String** columns (`"SALE"`, `"RENT"`, `"ACTIVE"`, etc.) for cross-provider compatibility.

### Switching to PostgreSQL (production)

`prisma/schema.prisma` is **committed with `provider = "postgresql"`** and is never
mutated by scripts. The production build (`npm run build` → `prisma generate`)
and `npm run db:deploy` (`prisma migrate deploy`) use it directly, so the
production database *is* PostgreSQL.

Local development derives a SQLite copy (`prisma/schema.dev.prisma`, gitignored)
from it via `scripts/prisma-dev-schema.mjs`. The `db:generate`, `db:push`,
`db:seed`, and `db:studio` scripts run that generator first and target the copy
with `--schema prisma/schema.dev.prisma`. Use `npm run db:push` + `npm run
db:seed` locally (dev.db); do **not** use `db:migrate` for SQLite dev.

For production you only need `DATABASE_URL` set to a PostgreSQL URL:

```env
DATABASE_URL="postgresql://user:password@host:5432/dreamhome?schema=public"
```

Then apply migrations (safe against existing data — it only applies migrations
that haven't run yet):

```bash
npm run db:deploy   # runs prisma migrate deploy
```

Seed only if you want demo data (⚠️ **it deletes all existing data first**):

```bash
npm run db:seed
```

No model changes are required — the schema is provider-agnostic and the two
schema files share identical models.

An initial PostgreSQL migration is committed at `prisma/migrations/0_init`.

---

## 🚀 Deploying to Render

See `render.yaml` (Render Blueprint) which provisions a **Web Service** and a
**managed PostgreSQL** database. Key production configuration:

- Build: `npm install && npm run build` (build generates Prisma client for Postgres)
- Pre-deploy: `npm run db:deploy` (applies `prisma migrate deploy` — never resets data)
- Start: `npm run start:prod` (cross-platform launcher that binds Next.js to `$PORT` via `scripts/start-prod.mjs`; Render injects `PORT`)
- Storage: set `STORAGE_DRIVER=cloudinary` + Cloudinary credentials for persistent
  image uploads (Render's filesystem is ephemeral and wiped on every deploy).
- Auth: set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your live Render URL.
  The app falls back to Render's `RENDER_EXTERNAL_URL` automatically.

Environment variables required in production: `DATABASE_URL`, `NEXTAUTH_SECRET`,
`NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `STORAGE_DRIVER`, `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Optional: `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`.

---

## 🔐 Authentication

- NextAuth v4 with a **JWT** session strategy.
- The `jwt` callback stamps `id`, `role`, and `isAgentApproved` onto the token; the `session` callback exposes them to the client.
- Route handlers use `getApiUser()` guards from `src/lib/session.ts`.
- Password resets issue a single-use token stored in `PasswordResetToken`. Since no SMTP provider is configured, in non-production environments the reset link is returned directly in the API response so the flow can be tested end-to-end.

---

## 🖼️ Image Uploads

`STORAGE_DRIVER=local` writes uploaded images to `public/uploads/properties/`. Set `STORAGE_DRIVER=cloudinary` and provide the `CLOUDINARY_*` env vars to upload to Cloudinary instead. Max 8 MB; JPEG/PNG/WebP/GIF/AVIF.

---

## 🧪 Testing

Unit tests cover pure utilities (`src/lib/utils.ts`) and the Zod validation schemas (`src/lib/validations.ts`):

```bash
npm test
```

---

## 🛡️ Security Notes

- Passwords are hashed with **bcrypt** (cost 12).
- Register, forgot-password, and inquiry endpoints are rate-limited.
- Admin/agent routes enforce role checks server-side on every request.
- `.env` is git-ignored; never commit secrets.

---

## 📄 License

Private project — all rights reserved.
