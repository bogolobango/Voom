# CLAUDE.md — Voom Car Sharing Platform

## Project Overview

Voom is a peer-to-peer car sharing marketplace (similar to Turo/Airbnb for cars) targeting West Africa (Ghana, Cameroon). Users can browse and book cars as renters, or list their vehicles as hosts. The platform supports multi-currency (FCFA, GHS, USD), multiple payment methods (Stripe, MTN MoMo), Google Maps integration, and a full messaging system.

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

---

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

---

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18.3, TypeScript 5.6, Vite 5.4 |
| Routing | Wouter 3.3 (NOT React Router) |
| Styling | Tailwind CSS 3.4 + Shadcn/Radix UI |
| Animations | Framer Motion 11.13 |
| Forms | React Hook Form 7.53 + Zod validation |
| State | TanStack React Query 5.60 (server state) + React Context (local state) |
| Backend | Express 4.21, TypeScript, Node.js 20 |
| Database | PostgreSQL (Neon serverless / Supabase hosted) |
| ORM | Drizzle ORM 0.39 + drizzle-zod |
| Auth | Passport.js (local + Google OAuth2), express-session |
| Payments | Stripe + MTN MoMo (mock implementations) |
| Maps | Google Maps (@googlemaps/js-api-loader) + Leaflet |
| Module System | ESM throughout (`"type": "module"`) |

---

## Directory Structure

```
Voom/
├── client/                     # React frontend
│   ├── index.html              # HTML entry point
│   └── src/
│       ├── App.tsx             # Root component — routing + providers
│       ├── main.tsx            # React DOM entry
│       ├── index.css           # Global styles + Tailwind directives
│       ├── components/         # Reusable components
│       │   ├── layout/         #   App layout, header, bottom navs
│       │   ├── ui/             #   Shadcn UI primitives (button, card, dialog, etc.)
│       │   ├── booking-*.tsx   #   Booking flow components
│       │   ├── car-*.tsx       #   Car display/filter components
│       │   └── verification-*  #   Verification workflow components
│       ├── hooks/              # Custom React hooks
│       │   ├── use-auth.tsx    #   Auth context + mutations
│       │   ├── use-supabase-auth.tsx  # Supabase auth alternative
│       │   ├── use-host-mode.tsx      # Host/guest toggle
│       │   ├── use-currency.tsx       # Multi-currency (FCFA/GHS/USD)
│       │   └── use-mobile.tsx         # 768px breakpoint
│       ├── lib/                # Utilities
│       │   ├── queryClient.ts  #   React Query config + apiRequest()
│       │   ├── utils.ts        #   cn(), currency formatting, date helpers
│       │   ├── supabase.ts     #   Supabase client init
│       │   └── supabase-db.ts  #   Supabase CRUD operations
│       └── pages/              # Page components (one per route)
│           ├── home.tsx        #   Landing page
│           ├── auth-page.tsx   #   Login/register
│           ├── car-detail.tsx  #   Car view + booking
│           ├── become-host/    #   Multi-step host onboarding (lazy-loaded)
│           └── host-*.tsx      #   Host dashboard pages
├── server/                     # Express backend
│   ├── index.ts                # Entry point — middleware, security headers, startup
│   ├── routes.ts               # All API endpoints (~910 lines)
│   ├── auth.ts                 # Passport strategies, session config, password hashing
│   ├── storage.ts              # In-memory storage (IStorage interface + MemStorage)
│   ├── db.ts                   # Neon PostgreSQL connection pool + Drizzle
│   ├── vite.ts                 # Vite dev server integration
│   ├── supabase.ts             # Supabase server client (optional)
│   └── utils/
│       ├── error-handler.ts    #   ApiError class, asyncHandler, error middleware
│       ├── query-helpers.ts    #   Drizzle filter/sort/pagination builders
│       └── module-compat.ts    #   ESM/CJS compatibility helpers
├── shared/
│   └── schema.ts               # Drizzle table definitions + Zod schemas + type exports
├── scripts/
│   ├── seed-cars.ts            # Seeds 60 demo cars
│   └── add-range-rover.ts     # Adds premium listing
├── public/                     # Static assets (images, car photos)
├── package.json                # Dependencies + scripts
├── tsconfig.json               # TypeScript config (path aliases: @/*, @shared/*)
├── vite.config.ts              # Vite build config
├── drizzle.config.ts           # Drizzle migration config
├── tailwind.config.ts          # Tailwind + animation plugins
├── theme.json                  # Shadcn theme: professional variant, red primary, radius 0.5
└── .env.example                # Required environment variables template
```

---

## Commands

```bash
npm run dev          # Start dev server (tsx server/index.ts) — port 5000
npm run build        # Build frontend (Vite → dist/public) + backend (esbuild → dist/index.js)
npm start            # Run production server (NODE_ENV=production node dist/index.js)
npm run check        # TypeScript type checking (tsc --noEmit)
npm run db:push      # Push Drizzle schema to database
```

There is no test suite configured. Verify changes by running `npm run check` for type errors and `npm run build` to confirm the build succeeds.

---

## Database Schema

All tables defined in `shared/schema.ts`. Each table has a Drizzle definition, a Zod insert schema, and exported TypeScript types.

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `users` | username, password, role, isHost, verificationStatus | Roles: renter, host, both, admin |
| `cars` | hostId, make, model, year, dailyRate, currency, location | Status: active, inactive, maintenance |
| `bookings` | carId, userId, hostId, startDate, endDate, status | Status: pending → approved → active → completed |
| `favorites` | userId, carId | Simple join table |
| `messages` | senderId, receiverId, bookingId?, content, read | Optional booking context |
| `reviews` | bookingId, reviewerId, revieweeId, carId, rating | Rating 1-5, one per booking |
| `payments` | bookingId, amount, method, status, idempotencyKey | Methods: stripe, momo |
| `verificationDocuments` | userId, documentType, documentUrl, status | Types: identity, license, insurance, vin |
| `payoutMethods` | userId, methodType, accountNumber/phoneNumber | Bank, MoMo, Bitcoin |
| `payoutTransactions` | userId, payoutMethodId, amount, status | Tracks host payouts |

**Platform fee**: 15% on all bookings (`hostPayout = totalAmount - platformFee`).

---

## API Routes

All routes are in `server/routes.ts`. Auth middleware: `requireAuth` from `server/auth.ts`.

### Auth (`server/auth.ts`)
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Local auth (username/password)
- `POST /api/auth/logout` — Destroy session
- `GET /api/auth/user` — Current user
- `GET /api/auth/google` — Google OAuth redirect
- `GET /api/auth/google/callback` — OAuth callback

### Cars
- `GET /api/cars` — List with filters (minPrice, maxPrice, make, model, year, transmission, fuelType, seats, category, searchQuery) + sort (price_asc, price_desc, rating_desc) + pagination (limit, offset)
- `GET /api/cars/:id` — Single car
- `GET /api/cars/host/me` — Host's own listings (auth)
- `POST /api/cars` — Create listing (auth)
- `PUT /api/cars/:id` — Update listing (auth, owner only)
- `DELETE /api/cars/:id` — Soft delete (auth, owner only)

### Bookings
- `POST /api/bookings` — Create with conflict detection + fee calculation (auth)
- `GET /api/bookings/me` — User's bookings with car details (auth)
- `GET /api/bookings/:id` — Single booking (auth, participant only)
- `PUT /api/bookings/:id/approve` — Host approves (auth)
- `PUT /api/bookings/:id/reject` — Host rejects (auth)
- `PUT /api/bookings/:id/cancel` — Renter cancels (auth)
- `PUT /api/bookings/:id/complete` — Host completes (auth)

### Payments
- `POST /api/payments/stripe/create` — Create Stripe payment intent (mock)
- `POST /api/payments/stripe/webhook` — Stripe webhook handler
- `POST /api/payments/momo/initiate` — MTN MoMo payment (mock)
- `POST /api/payments/momo/callback` — MoMo callback

### Favorites, Reviews, Messages, Verification, Host Earnings
- Standard CRUD patterns under `/api/favorites`, `/api/reviews`, `/api/messages`, `/api/verification`, `/api/host/earnings`

---

## Key Architecture Patterns

### Storage Layer
The server uses an `IStorage` interface (`server/storage.ts`) with an in-memory `MemStorage` implementation. This is designed to be swapped for a database-backed implementation. The interface defines all CRUD operations for every entity.

### Authentication
- Scrypt-based password hashing with salt + optional pepper
- Session cookies: httpOnly, sameSite lax, secure in production
- Rate limiting: 10 login attempts / 15min, 5 register / 15min

### Frontend Data Flow
- **Server state**: TanStack React Query with `staleTime: Infinity` and no auto-refetch
- **API calls**: `apiRequest(method, url, data?)` from `client/src/lib/queryClient.ts` — always includes credentials
- **Local state**: React Context providers for auth, host mode, currency
- **Forms**: React Hook Form + Zod schema validation

### Provider Hierarchy (in `App.tsx`)
```
QueryClientProvider → SupabaseAuthProvider → AuthProvider → HostModeProvider → CurrencyProvider → TooltipProvider → Router
```

### TypeScript Path Aliases
- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`

---

## Environment Variables

Required variables (see `.env.example`):

```
DATABASE_URL          # PostgreSQL connection string (Neon/Supabase)
SESSION_SECRET        # Express session secret
GOOGLE_CLIENT_ID      # Google OAuth (optional)
GOOGLE_CLIENT_SECRET  # Google OAuth (optional)
STRIPE_SECRET_KEY     # Stripe payments (optional, mock fallback)
VITE_SUPABASE_URL     # Supabase project URL (frontend)
VITE_SUPABASE_ANON_KEY # Supabase anon key (frontend)
SUPABASE_URL          # Supabase URL (server)
SUPABASE_SERVICE_ROLE_KEY # Supabase service role (server)
```

---

## Conventions

### Code Style
- TypeScript strict mode, ESM imports everywhere
- Zod for all input validation (shared schemas in `shared/schema.ts`)
- Drizzle `createInsertSchema` to auto-generate insert validators from table definitions
- Export both select types (`User`) and insert types (`InsertUser`) from schema
- Components use Shadcn UI patterns with `cn()` for class merging
- All pages are default exports; hooks/utils are named exports

### File Naming
- React components: kebab-case files (`car-card.tsx`, `booking-details.tsx`)
- Pages: kebab-case matching route (`car-detail.tsx`, `host-dashboard.tsx`)
- Hooks: `use-*.tsx` prefix
- Utils: kebab-case (`query-helpers.ts`, `error-handler.ts`)

### Currency
- Default currency is FCFA (West African CFA franc)
- All `dailyRate` and `totalAmount` values are integers (no decimals)
- Conversion handled client-side via `convertCurrency()` in `client/src/lib/utils.ts`

### Booking Status Flow
```
pending → approved → active → completed
       → rejected
       → cancelled (only if not active)
```

### Host Onboarding Flow
Multi-step lazy-loaded pages under `/become-host/*`:
```
car-type → car-details → car-location → car-verification → verification-confirmation → car-rates → car-summary
```

---

## Common Pitfalls

- **Routing**: This project uses **Wouter**, not React Router. Route syntax is `<Route path="..." component={...} />` with `useLocation()` and `useRoute()`.
- **Storage**: The server currently uses in-memory storage (`MemStorage`). Data resets on restart. The database layer (`db.ts`) exists but the storage implementation hasn't been migrated to it yet.
- **Dual Auth**: Both custom auth (`use-auth.tsx`) and Supabase auth (`use-supabase-auth.tsx`) exist. The app wraps both providers. Be aware of which auth system a feature uses.
- **Payments are mocked**: Stripe and MoMo payment endpoints return mock responses. No real payment processing occurs.
- **No test suite**: There are no unit or integration tests. Validate changes with `npm run check` and `npm run build`.
- **Port 5000**: The dev server binds to `0.0.0.0:5000`. This is mapped to port 80 in the Replit deployment.
