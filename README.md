# Agni Omega

Multi-vendor electronics & gadgets marketplace. Next.js 15 (App Router) + Prisma + NextAuth v5 + Tailwind v4.

## Status: Phase 9 of 9 complete — all phases done

Per the phased build order in the master prompt:

- [x] **Phase 1** — Design system foundation (fonts, color tokens, logo mark, restyled
      shadcn primitives) + auth (NextAuth v5: credentials + Google) + vendor registration
      + `/vendor/pending` + admin approve/reject flow
- [x] **Phase 2** — Category + `CategoryAttribute` system (`/admin/settings`) + vendor product
      management with dynamic spec fields (`/vendor/products`, `/new`, `/[id]/edit`) + bulk
      CSV import with column-mapping + preview/confirm (`/vendor/products/import`)
- [x] **Phase 3** — Public catalog: real homepage (category tiles, featured, new arrivals),
      `/products` (filters + sort + pagination), `/products/[slug]` PDP (gallery, specs table,
      vendor card, related products), `/shop/[slug]` vendor storefronts, `/category/[slug]`
      browse with subcategory chips, header search
- [x] **Phase 4** — Cart (`/cart`), checkout (`/checkout`) with address management, Razorpay
      payment, and webhook-verified order splitting into per-vendor `VendorOrder`s with
      commission snapshotting; order confirmation (`/orders/[orderNumber]`)
- [x] **Phase 5** — Order management for all three roles: buyer order history + refund requests
      (`/account/orders`), vendor fulfillment + tracking + refund approval (`/vendor/orders`),
      admin platform-wide order visibility (`/admin/orders`)
- [x] **Phase 6** — Full admin panel: dashboard with real GMV/commission chart (`/admin`),
      customers (`/admin/customers`), promotions/coupon CRUD (`/admin/promotions`), payouts
      (`/admin/finance`), settings (`/admin/settings`, from Phase 2), and a support ticket system
      shared between buyers/vendors (`/account/support`) and admins (`/admin/help`)
- [x] **Phase 7** — Reviews (verified-purchase, vendor replies, PDP display + vendor dashboard),
      wishlist (`/account/wishlist`, heart toggle on the PDP), and coupon redemption at checkout
      with a live-updating discount summary
- [x] **Phase 8** — Notifications (Resend) wired into every place that was stubbed with a TODO in
      earlier phases; JSON-LD structured data (Product, BreadcrumbList, Organization) + per-page
      SEO metadata; dynamic `sitemap.xml` / `robots.txt`; low-stock alerts fired from the payment
      webhook the moment a sale crosses the threshold
- [x] **Phase 9** — Final role-boundary audit (see below)

## Phase 9 audit — methodology and findings

Went through every server action (`src/actions/*.ts`), every page, the webhook, and the
middleware, checking three things: (1) does every mutation re-verify the caller's role rather
than trusting the UI to have hidden the button, (2) does every action operating on a specific
record verify the caller *owns* that record (not just that they hold the right role), and
(3) is any pricing, identity, or role value ever trusted from client input instead of the
session or the database.

**One real gap found and fixed:** `VendorProfile.commissionRateOverride` has been in the schema
and used in commission math since Phase 4, but there was no admin UI to set it — the only way to
use it was a direct database edit. Added an inline commission-override field to each approved
vendor's row on `/admin/vendors`, backed by a new `updateVendorCommission` action (admin-only,
logged to `AuditLog` like every other admin action).

**Verified safe, no changes needed:**
- Every vendor-scoped action (`vendor-products.ts`, `vendor-orders.ts`, `vendor-import.ts`,
  `reviews.ts`'s `replyToReview`) calls `requireApprovedVendor()` *and* separately checks the
  target record's `vendorId` matches — a vendor cannot edit, ship, or reply to anything that
  isn't theirs, even by guessing another vendor's record ID.
- Every buyer-scoped action (`cart.ts`, `checkout.ts`, `buyer-orders.ts`'s `requestRefund`,
  `reviews.ts`'s `createReview`, `address.ts`) checks the record's `userId`/`buyerId` against the
  session — same reasoning, applied to buyers.
- Every admin-only action (`admin-*.ts`) calls `requireAdmin()` as its first line; admin actions
  intentionally accept any target ID from the client (an admin approving vendor X or paying out
  vendor Y is supposed to work for any X/Y — that's the role's whole purpose), which is different
  from a vendor/buyer action accepting an arbitrary ID, which would be a bug.
- No page uses a non-null session assertion (`session!.user`) outside a route already gated by
  `middleware.ts` for the required role — checked every instance.
- Pricing is never trusted from the client: `createCheckoutOrder`, `calculateCouponDiscount`, and
  the bulk import all read `Product.basePrice` fresh from the database at the moment of use, never
  from a hidden form field.
- The Razorpay webhook is correctly *not* covered by the auth middleware (it's server-to-server,
  no session cookie is possible) and instead authenticates via HMAC signature — verified this is
  the only path that can ever set `paymentStatus: PAID`.
- Checked the Google OAuth account-linking scenario specifically (could someone hijack an
  existing admin/vendor account by signing in with Google using the same email?) — NextAuth's
  default behavior (no `allowDangerousEmailAccountLinking` set) refuses to link a new OAuth
  identity to an existing account with the same email, so this isn't exploitable. The explicit
  "Google sign-ins default to BUYER" upsert in `auth.ts` is also harmless in the case where it
  does run, since its `update` clause is empty — it can create a new BUYER but never overwrite
  an existing user's role.
- No raw SQL anywhere (`$queryRaw`/`$executeRaw`) — everything goes through Prisma's query
  builder, so there's no injection surface to audit there.

**Known limitations, not security bugs, worth knowing about:**
- Address management is create-only — there's no edit/delete/set-default UI beyond the first
  address (which is auto-marked default). Not a vulnerability, just an incomplete feature.
- `updateProduct` doesn't validate that a submitted `categoryId` actually exists before writing —
  a malformed request would surface as a Prisma foreign-key error (500) rather than a friendly
  validation message. Only affects the acting vendor's own product either way.

**Caught after the fact:** two vendor nav links (`Shop settings`, `Finance`) had been in the
sidebar since Phase 1 but were never actually built — a genuine gap, not a security issue, just
an oversight in tracking my own nav promises across phases. Added both: `/vendor/shop-settings`
(edit shop name/description/logo/banner — the fields shown on the public storefront) and
`/vendor/finance` (their own unpaid/eligible earnings and payout history, read-only counterpart
to `/admin/finance`).

## What's in this drop

- **Prisma schema** (`prisma/schema.prisma`) — the complete data model from the spec, unmodified
- **Design tokens** (`src/app/globals.css`) — the `--bg` / `--surface` / `--ignition` / `--steel`
  / `--success` / `--danger` palette, Space Grotesk / Manrope / JetBrains Mono type stack, the
  ignition-gradient CTA and featured-card corner accent as the one recurring signature
- **Logo** (`src/components/logo.tsx`) — custom SVG spark-into-Ω mark, not a stock icon-in-a-box
- **Restyled primitives** (`src/components/ui/`) — Button, Input, Label, Card, Dialog, StatusBadge
- **Auth** (`src/lib/auth.ts`) — NextAuth v5, Prisma adapter, credentials (bcrypt) + Google OAuth
  (Google sign-in always creates a `BUYER`; vendor/admin only ever use credentials)
- **Middleware** (`src/middleware.ts`) — `/admin/*` → ADMIN only; `/vendor/*` (except
  `/vendor/register`, `/vendor/pending`) → VENDOR + `status === APPROVED`; `/account/*`,
  `/checkout` → any authenticated user
- **Vendor onboarding** — `/vendor/register` (application form → `VendorProfile` status
  `PENDING`), `/vendor/pending` (waiting state / rejection reason display)
- **Admin vendor review** — `/admin/vendors` (list, filter by status, approve / reject-with-reason
  / suspend, and — added during the Phase 9 audit — set a per-vendor commission rate override),
  backed by server actions in `src/actions/admin-vendors.ts` with an `AuditLog` entry per action
- **Seed script** (`prisma/seed.ts`) — creates a default admin account, platform settings row, and
  one starter category (Smartphones) with spec attributes so Phase 2's product form has something
  to point at
- **Category & attribute admin** (`/admin/settings`) — create categories, attach `TEXT` /
  `NUMBER` / `SELECT` spec attributes to each, set the default commission rate and tax rate
- **Vendor product management** (`/vendor/products`) — list with status filters and inline
  quick-stock editing; `/new` and `/[id]/edit` render spec fields dynamically from the selected
  category's attribute list (never hardcoded columns, per the schema's design). Images accept
  either comma-separated URLs or file uploads (uploads require Supabase Storage env vars — see
  below)
- **Bulk import** (`/vendor/products/import`) — upload a CSV, map its columns to product fields
  and category specs, preview the first 5 mapped rows, then confirm; imports land as `DRAFT`
  products so the vendor reviews before publishing. All vendor server actions
  (`src/actions/vendor-products.ts`, `src/actions/vendor-import.ts`) re-verify the vendor is
  `APPROVED` and scope every write to their own `vendorId` — never trusted from the client
- **Public catalog** — homepage (`/`) with category tiles, featured products, and new arrivals;
  `/products` with category/price filters, sort, and pagination, all as plain GET forms/links so
  they work without client JS; `/products/[slug]` PDP with an image gallery, spec table pulled
  from `ProductSpec` + `CategoryAttribute`, vendor card, and related products; `/shop/[slug]`
  vendor storefronts; `/category/[slug]` browse with subcategory chips. Header search posts to
  `/products?q=`. Only `ACTIVE` products with `APPROVED` vendors are ever shown publicly — seed
  a product and flip it to Active from `/vendor/products` to see the catalog populate
- **Cart** (`/cart`) — grouped by vendor, inline quantity edit, remove; header shows a live item
  count. `src/actions/cart.ts` scopes every mutation to the caller's own cart
- **Checkout** (`/checkout`) — address selection/creation, order summary with tax computed from
  `PlatformSettings.taxRate`, and a Razorpay pay button. `src/actions/checkout.ts` is where an
  `Order` and its per-vendor `VendorOrder`s are created: subtotal, commission rate (vendor
  override or platform default), commission amount, and vendor earning are all snapshotted at
  this point, before payment — so a later commission-rate change never rewrites a past order
- **Razorpay webhook** (`/api/webhooks/razorpay`) — the *only* place an `Order.paymentStatus`
  ever becomes `PAID`. Verifies the `X-Razorpay-Signature` HMAC against the raw request body
  before trusting anything in the payload; the client-side payment `handler` callback only
  navigates to the confirmation page; it never marks anything paid itself. Stock is decremented
  and the cart is cleared only after this verified confirmation — not at checkout time — so an
  abandoned payment never holds stock hostage. Idempotent against Razorpay's webhook retries.
- **Order confirmation** (`/orders/[orderNumber]`) — shows payment + per-vendor fulfillment
  status, polling briefly while payment is still confirming
- **Schema fix**: added `@unique` to `Order.razorpayOrderId` (needed for the webhook to look the
  order up by it) — the only schema change made outside the original spec, and only because the
  webhook literally cannot function without it
- **Order management** — `/account/orders` lists a buyer's orders grouped by vendor shipment with
  a refund-request dialog per shipment; `/vendor/orders` lets a vendor update fulfillment status
  and tracking info, and approve or reject refund requests (approval fires a real Razorpay refund
  via `payments.refund` for that shipment's amount, so it needs `RAZORPAY_KEY_SECRET` configured);
  `/admin/orders` gives a platform-wide read view across all vendor orders with a status filter.
  Vendor and admin dashboards now show live numbers (earnings this month, pending orders,
  low-stock count) instead of Phase 1's placeholders
- **Second schema fix**: `Payout.status` defaulted to `PENDING`, which isn't a member of
  `PayoutStatus` (`UNPAID` / `PROCESSING` / `PAID`) — would have failed at `db push`. Changed the
  default to `UNPAID`.
- **Admin dashboard** (`/admin`) — real GMV, commission revenue, and paid-order totals, plus a
  30-day GMV/commission line chart (`recharts`), open-ticket count
- **Admin customers** (`/admin/customers`) — searchable buyer list with order count and total spent
- **Admin promotions** (`/admin/promotions`) — create/enable/disable/delete coupons, platform-wide
  or scoped to one vendor. Redemption at checkout is Phase 7 — these are provisioned but not yet
  usable by buyers
- **Admin finance** (`/admin/finance`) — payouts become eligible once a `VendorOrder` is marked
  `DELIVERED` (paying out earlier risks loss on a later refund); "Mark as paid out" creates a
  `Payout` record grouping all eligible shipments for that vendor. This records that a payout
  happened — it does not move real money; that's a manual bank transfer using the vendor's saved
  account details, same as most marketplaces handle it operationally
- **Support tickets** — `/account/support` (shared by buyers and vendors) to open a ticket and
  reply; `/admin/help` to see all tickets, filter by status, and reply/resolve. A buyer/vendor
  reply on a resolved ticket reopens it; an admin reply marks it in-progress
- **Reviews** — buyers can review a product once its shipment is `DELIVERED`, one review per
  order item (`/account/orders` surfaces a "Write a review" button per eligible item). Reviews
  show on the PDP with a "Verified purchase" tag; `Product.avgRating`/`reviewCount` recompute on
  every new review. Vendors reply inline, either from the PDP (if they own the product) or from
  a dedicated `/vendor/reviews` dashboard listing every review across their catalog
- **Wishlist** — heart toggle on the PDP (buyers only), backed by `/account/wishlist`
- **Coupon redemption** — `/checkout` gained a coupon input with live preview (`src/actions/coupon.ts`
  validates against the cart without committing anything); the order summary recomputes
  discount → tax → total client-side as soon as a code is applied. `calculateCouponDiscount`
  (`src/lib/coupon.ts`) is shared between the preview and the real order creation so they can
  never disagree. One economic decision worth knowing: a **platform-wide** coupon's cost is
  absorbed by the platform (vendor earnings are untouched); a **vendor-specific** coupon's cost
  comes out of that vendor's own earning on the sale, on the reasoning that a vendor-specific
  promo is something that vendor chose to run. Coupon usage count increments at order creation,
  not payment confirmation — an abandoned checkout still consumes one use, which is a reasonable
  simplification for a promo code but not something you'd want for anything ledger-grade
- **Notifications** (`src/lib/email.ts`) — every email hook that earlier phases left as a `TODO`
  is now wired to Resend: vendor approved/rejected, order confirmation to the buyer, new-order
  alert to each vendor (all three fire from the payment webhook once it's verified), shipment
  status to the buyer (from the vendor's fulfillment update), payout summary to the vendor, and
  low-stock alerts. If `RESEND_API_KEY` isn't set, every call logs to the console instead of
  throwing — none of the surrounding business logic (orders, payouts, fulfillment) ever fails
  because notifications aren't configured
- **Low-stock alerts** — fired from inside the payment webhook, the moment a sale's stock
  decrement crosses the threshold (5 units) — not on every subsequent order once it's already
  low, so a vendor isn't emailed for the same low-stock product on every sale
- **SEO** — `generateMetadata` on the PDP, shop, and category pages (title, description, Open
  Graph); JSON-LD structured data — `Product` + `BreadcrumbList` on the PDP, `Organization` on
  the homepage; dynamic `sitemap.xml` (all active products, categories, approved shops) and
  `robots.txt` (disallows account/admin/vendor/checkout/cart/order routes). Set
  `NEXT_PUBLIC_SITE_URL` in `.env` to your real domain before deploying — it feeds canonical
  URLs, JSON-LD, the sitemap, and Open Graph image resolution

## Running it locally

You'll need a Postgres instance (local or Supabase), a Google OAuth client, and Razorpay keys
(test mode is fine). Product image uploads (as opposed to pasted URLs) need a Supabase Storage
bucket named `product-images` with public read access.

For the Razorpay webhook during local development, use the Razorpay CLI or a tunnel
(e.g. `ngrok http 3000`) to get a public URL, register `https://<your-tunnel>/api/webhooks/razorpay`
as a webhook endpoint in the Razorpay dashboard subscribed to `payment.captured`, and put the
webhook secret it gives you in `RAZORPAY_WEBHOOK_SECRET`.

```bash
npm install
cp .env.example .env       # fill in DATABASE_URL at minimum; AUTH_SECRET via `npx auth secret`
npm run db:push            # creates tables from schema.prisma
npm run db:seed            # creates the admin account (see console output for credentials)
npm run dev
```

Then:
- Visit `/` — homepage placeholder with the design system live
- Visit `/vendor/register` — apply as a vendor (lands on `/vendor/pending`)
- Log in as the seeded admin at `/login`, go to `/admin/vendors`, approve the application
- Log back in as the vendor — you'll land on `/vendor/dashboard` instead of the pending page

## Notes on things only you can supply

- `DATABASE_URL` — local Postgres for dev; swap to your Supabase connection string in production
  (schema is identical, per the spec)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from the Google Cloud Console; buyer sign-in only
- `RAZORPAY_*` — needed for checkout (Phase 4) and its webhook
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — needed for product image uploads (Phase 2)
- `RESEND_API_KEY` — needed starting Phase 8
