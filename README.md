# JobConnect — Backend API

A production-style REST API for a full-stack job portal, connecting **job seekers**, **recruiters**, and **admins** through a role-based hiring workflow — job posting, applications, and candidate tracking.

> **Status:** Backend complete and functional. Frontend (React) is in progress and not part of this repository yet. Items still on the roadmap are listed under [What's Next](#whats-next).

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Authentication & Authorization](#authentication--authorization)
- [Error Handling](#error-handling)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [What's Next](#whats-next)
- [Author](#author)

---

## Overview

JobConnect is a job board platform where:

- **Job seekers** can browse/search job postings and apply to them.
- **Recruiters** can register a company, post jobs, and manage incoming applications.
- **Admins** have elevated permissions over job postings.

This repository contains the **backend service**: a RESTful API built with **Node.js, Express, and PostgreSQL**, designed with a layered architecture (routes → controllers → services → database) that separates HTTP concerns from business logic and data access.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | PostgreSQL (via `pg` connection pooling) |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password Security | `bcrypt` |
| File Uploads | `multer` (local disk) + `multer-storage-cloudinary` (Cloudinary-backed uploads) |
| Media Storage | Cloudinary |
| Email | Nodemailer (Gmail SMTP transport) |
| Config Management | `dotenv` |
| Dev Tooling | `nodemon` |

---

## Architecture

The API follows a **layered (N-tier) architecture** for maintainability and testability:

```
Request → Route → Middleware (auth/role/upload) → Controller → Service → Database (PostgreSQL)
                                                          ↓
                                                   Centralized Error Handler
```

- **Routes** — define endpoints and attach the relevant middleware.
- **Middleware** — handles authentication, role-based authorization, and file uploads.
- **Controllers** — thin HTTP layer; parses requests and delegates to services.
- **Services** — all business logic and SQL queries live here, decoupled from Express.
- **Utils** — a custom `ApiError` class and an `asyncHandler` wrapper eliminate repetitive `try/catch` blocks across async route handlers.
- **Centralized error middleware** — every thrown `ApiError` (or unexpected error) is caught in one place and returned as a consistent JSON response.

This separation means the business logic in the `services` layer has no dependency on Express, making it straightforward to unit test or reuse elsewhere.

---

## Key Features

### 🔐 Authentication & User Management
- Secure registration and login with **bcrypt password hashing**
- **JWT-based authentication** (7-day expiry) with a `Bearer` token scheme
- Role-based accounts: `job-seeker`, `recruiter`, `admin`
- Profile retrieval and partial updates, with duplicate-email protection
- Self-service **change password** flow (validates the current password before updating)
- **Forgot / reset password** flow using single-use, time-limited (15-minute) crypto-random tokens emailed to the user via Nodemailer

### 🛡️ Authorization
- Route-level **role-based access control (RBAC)** via a reusable `authorize(...roles)` middleware
- Ownership checks in the service layer (e.g., a recruiter can only edit/delete jobs belonging to *their own* company)

### 🏢 Company Management
- Recruiters can create one company profile tied to their account
- Update company details and **upload/replace a company logo** (Cloudinary-backed via Multer)
- Company deletion cascades to associated jobs at the database level

### 💼 Job Postings
- Full CRUD for job listings, restricted to `recruiter`/`admin` roles for write operations
- **Public job search** with:
  - Free-text search on job title
  - Filters: location, job type, experience level, status
  - Sorting: newest, oldest, salary ascending/descending
  - **Pagination** with total count and total pages returned in the response
- "My Jobs" endpoint for recruiters to view their own postings

### 📄 Applications
- Job seekers can apply to a job (duplicate applications are blocked at the database and service level via a unique constraint)
- Job seekers can view their own applications and withdraw them
- Recruiters can view all applicants for a specific job and update an application's status (e.g., Pending → Shortlisted/Rejected)

### ⚙️ Platform Concerns
- Centralized error handling with consistent JSON error responses
- Custom `ApiError` class for predictable, HTTP-status-aware error throwing
- `asyncHandler` utility to avoid repetitive try/catch boilerplate in every controller
- Environment-based configuration via `.env` (with a checked-in `.env.example`)
- CORS-enabled for cross-origin frontend consumption
- Static file serving for uploaded assets

---

## Database Schema

PostgreSQL schema with foreign-key relationships and cascading deletes:

```
users (id, name, email, password, role, reset_password_token, reset_password_expires, created_at)
   │
   ├──< companies (id, owner_id → users.id, name, description, website, location, logo)
   │        │
   │        └──< jobs (id, company_id → companies.id, title, description, requirements,
   │                    location, salary, experience, job_type, vacancies, status)
   │                 │
   └─────────────────┴──< applications (id, candidate_id → users.id, job_id → jobs.id, status)
                              UNIQUE(candidate_id, job_id)
```

**Relationships**
- `users` (1) → (1) `companies` — one company per recruiter, enforced via a `UNIQUE` constraint on `owner_id`
- `companies` (1) → (many) `jobs`
- `users` (1) → (many) `applications`, `jobs` (1) → (many) `applications`
- `applications` has a composite `UNIQUE(candidate_id, job_id)` constraint to prevent duplicate applications
- All child tables use `ON DELETE CASCADE` to maintain referential integrity

---

## API Reference

Base URL: `http://localhost:<PORT>/api`

### Users — `/api/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new user (job-seeker, recruiter, or admin) |
| POST | `/login` | Public | Authenticate and receive a JWT |
| POST | `/forgot-password` | Public | Request a password reset email |
| POST | `/reset-password` | Public | Reset password using a valid token |
| GET | `/me` | Authenticated | Get the decoded JWT payload for the current session |
| GET | `/profile` | Authenticated | Get the current user's full profile |
| PATCH | `/profile` | Authenticated | Update name/email |
| PATCH | `/change-password` | Authenticated | Change password (requires current password) |
| GET | `/recruiter-dashboard` | Recruiter only | Example of a protected, role-gated route |

### Companies — `/api/companies`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Authenticated | Create a company profile (one per user) |
| GET | `/me` | Authenticated | Get the current user's company |
| PUT | `/:id` | Authenticated | Update company details |
| PUT | `/:id/logo` | Authenticated | Upload/replace company logo (multipart) |
| DELETE | `/:id` | Authenticated | Delete a company |

### Jobs — `/api/jobs`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List jobs with search, filters, sorting & pagination |
| GET | `/:id` | Public | Get a single job with company details |
| POST | `/` | Recruiter/Admin | Create a job posting |
| GET | `/my-jobs` | Recruiter/Admin | List jobs posted by the current recruiter's company |
| PUT | `/:id` | Recruiter/Admin | Update a job (ownership-checked) |
| DELETE | `/:id` | Recruiter/Admin | Delete a job (ownership-checked) |

**Query parameters for `GET /api/jobs`:** `q`, `location`, `job_type`, `experience`, `status`, `sort` (`salary_asc` \| `salary_desc` \| `oldest` \| default newest), `page`, `limit`

### Applications — `/api/applications`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/:jobId` | Job-seeker | Apply to a job |
| GET | `/my-applications` | Job-seeker | List the current user's applications |
| GET | `/job/:jobId` | Recruiter | List applicants for a specific job |
| PUT | `/:applicationId` | Recruiter | Update an application's status |
| DELETE | `/:applicationId` | Job-seeker | Withdraw an application |

All responses follow a consistent shape:
```json
{ "success": true, "message": "...", "data_or_relevant_key": {} }
```
```json
{ "success": false, "message": "Descriptive error message" }
```

---

## Authentication & Authorization

- Clients authenticate by sending `Authorization: Bearer <token>` on protected routes.
- Tokens are signed with `JWT_SECRET` and embed the user's `id` and `role`, expiring after **7 days**.
- The `authMiddleware` verifies the token and attaches the decoded payload to `req.user`.
- The `authorize(...roles)` middleware factory restricts routes to specific roles (e.g., `authorize("recruiter")`, `authorize("admin", "recruiter")`).
- Beyond role checks, the service layer enforces **resource-level ownership** — for example, a recruiter cannot update or delete a job belonging to another company's account, even with a valid recruiter token.

---

## Error Handling

- A custom `ApiError(statusCode, message)` class is thrown from services for all expected failure cases (validation errors, not found, conflicts, unauthorized access).
- Every async controller is wrapped in an `asyncHandler` utility, so thrown errors — sync or async — are automatically forwarded to Express's error pipeline instead of crashing the process.
- A single `errorMiddleware` normalizes all errors into a consistent JSON response with the correct HTTP status code.
- Unmatched routes return a structured `404` via a dedicated `notFound` middleware.

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL instance (local or hosted)
- A Cloudinary account (for logo uploads)
- A Gmail account with an App Password (for transactional emails)

### Installation

```bash
# Clone the repository
git clone "https://github.com/Abhinav-Sinha-XO/jobconnect.git"
cd jobconnect/backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# then fill in the values — see below

# Set up the database
# Run the statements in src/sql/schema.sql against your PostgreSQL database
# to create the users, companies, jobs, and applications tables

# Run in development (auto-restarts on change)
npm run dev

# Run in production
npm start
```

The API will be available at `http://localhost:<PORT>`, with a health-check response at `GET /`.

> **Note:** `src/sql/schema.sql` currently mixes `CREATE TABLE` statements with ad-hoc queries used during development. Before running it against a fresh database, extract just the `CREATE TABLE`/`ALTER TABLE` statements for `users`, `companies`, `jobs`, and `applications` (this cleanup is tracked under [What's Next](#whats-next)).

---

## Environment Variables

Create a `.env` file in `backend/` based on `.env.example`:

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | PostgreSQL database name |
| `JWT_SECRET` | Secret key used to sign/verify JWTs |
| `EMAIL_USER` | Gmail address used to send transactional email |
| `EMAIL_PASS` | Gmail App Password (not your regular account password) |

Cloudinary credentials required by `multer-storage-cloudinary` should also be added here as they're wired into the upload configuration.

---

## Project Structure

```
backend/
├── src/
│   ├── app.js                  # Express app setup & route mounting
│   ├── server.js                # Entry point — loads env & starts the server
│   ├── config/
│   │   ├── config.js            # Centralized env/config access
│   │   ├── mail.js              # Nodemailer transporter setup
│   │   └── multer.js            # Multer disk storage configuration
│   ├── database/
│   │   └── db.js                # PostgreSQL connection pool
│   ├── routes/                  # Express routers per resource
│   ├── controllers/             # Request/response handling
│   ├── services/                # Business logic & SQL queries
│   │   └── email/               # Email-sending service
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── authorize.js         # Role-based access control
│   │   ├── errorMiddleware.js   # Centralized error handler
│   │   └── notFound.js          # 404 handler
│   ├── utils/
│   │   ├── ApiError.js          # Custom HTTP error class
│   │   └── asyncHandler.js      # Async route wrapper
│   ├── sql/
│   │   └── schema.sql           # Database schema
│   └── uploads/                 # Local file storage (logos, etc.)
├── .env.example
└── package.json
```

---

## What's Next

This backend is functionally complete for the core hiring workflow. Planned follow-up work:

- [ ] React frontend (in progress, separate from this repo)
- [ ] Clean up `schema.sql` into pure migration files (remove ad-hoc dev queries)
- [ ] Resume upload support for job applications
- [ ] Request validation layer (e.g., Joi/Zod) at the controller boundary
- [ ] Automated tests (unit tests for services, integration tests for routes)
- [ ] API documentation via Swagger/OpenAPI
- [ ] Rate limiting and request logging (e.g., `helmet`, `morgan`)
- [ ] Admin-specific endpoints for platform-wide moderation
- [ ] Dockerized setup for local development

---

## Author

**"Abhin Sinha" and "Shaik Mohammed Riyaz"**
Backend developer on the JobConnect project — built as part of a full-stack MERN/PostgreSQL learning project.
