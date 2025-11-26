# REGIME Ecommerce - Complete Setup & Migration Guide

This comprehensive guide will walk you through setting up the REGIME ecommerce platform, including Supabase integration, Prisma migration, and security configuration.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Getting Supabase API Keys](#getting-supabase-api-keys)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Prisma Database Sync](#prisma-database-sync)
5. [Row-Level Security (RLS) Setup](#row-level-security-rls-setup)
6. [Admin Credentials](#admin-credentials)
7. [Seeding Sample Data](#seeding-sample-data)
8. [Security Best Practices](#security-best-practices)
9. [Deployment](#deployment)

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (create at https://supabase.com)
- A Paystack account for payment processing (optional but recommended)

---

## Getting Supabase API Keys

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"New Project"** or sign in if you have an account
3. Fill in the project details:
   - **Project name**: `REGIME` (or your preference)
   - **Database password**: Create a strong password and save it
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait for provisioning

### Step 2: Retrieve Your API Keys

1. Once your project is created, go to **Settings** → **API**
2. You'll see several keys:

   **Key 1: Project URL**
   - Label: "Project URL"
   - This is your `NEXT_PUBLIC_SUPABASE_URL`
   - Example: `https://abc123def456.supabase.co`
   - Copy and save this

   **Key 2: Anon Public Key**
   - Label: "anon public"
   - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Start with `eyJhbGc...` (long string)
   - Copy and save this

   **Key 3: Service Role Key**
   - Label: "service_role" (keep this secret!)
   - This is your `SUPABASE_SERVICE_ROLE_KEY`
   - Start with `eyJhbGc...` (different from anon key)
   - **⚠️ NEVER commit this to GitHub or share publicly**
   - Copy and save securely

### Step 3: Get Database Connection String (for Prisma)

1. Go to **Settings** → **Database**
2. Find **"Connection String"** section
3. Select **"Prisma"** from the dropdown
4. Copy the full connection string
5. Replace the `[YOUR-PASSWORD]` placeholder with your database password
6. This becomes your `DATABASE_URL`
7. Example: `postgresql://postgres:[YOUR-PASSWORD]@db.abc123def456.supabase.co:5432/postgres`

---

## Environment Variables Setup

### Step 1: Create .env.local file

In the root of your project, create a `.env.local` file:

\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abc123def456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key-here
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.abc123def456.supabase.co:5432/postgres

# Paystack Configuration (optional)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...your-paystack-public-key
PAYSTACK_SECRET_KEY=sk_test_...your-paystack-secret-key

# Email Service (optional - Resend or SendGrid)
RESEND_API_KEY=re_...your-resend-api-key
\`\`\`

### Step 2: Add to v0 Vars (for deployment)

In v0 dashboard:
1. Click **Vars** in the left sidebar
2. Add each environment variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`

**⚠️ Only non-secret keys can be added to v0 Vars publicly. Store secrets securely.**

---

## Prisma Database Sync

### Step 1: Install Prisma Dependencies

\`\`\`bash
npm install @prisma/client
npm install -D prisma
\`\`\`

### Step 2: Initialize Prisma (if not already done)

\`\`\`bash
npx prisma init
\`\`\`

This creates `prisma/schema.prisma` and `.env` file.

### Step 3: Verify DATABASE_URL

Make sure your `.env.local` has the correct `DATABASE_URL` pointing to Supabase.

### Step 4: Run Initial Migration

This will create all tables in Supabase:

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

This command will:
- Create all tables defined in `prisma/schema.prisma`
- Generate Prisma Client
- Create a migration file in `prisma/migrations/`
- Apply the migration to your Supabase database

### Step 5: Verify Tables in Supabase

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Run this query to see all created tables:

\`\`\`sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
\`\`\`

You should see:
- `User`
- `Product`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `Address`
- `Newsletter`
- `AdminCredential`
- `_prisma_migrations` (internal)

---

## Row-Level Security (RLS) Setup

Row-Level Security ensures users can only access their own data. This is **critical for security**.

### Step 1: Enable RLS in Supabase Dashboard

1. Go to **SQL Editor**
2. Run the following SQL script:

\`\`\`sql
-- Enable RLS on User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read only their own data
CREATE POLICY "Users read own data" ON "User" AS SELECT
  USING (auth.uid()::text = id);

-- Create policy: Users can update only their own data
CREATE POLICY "Users update own data" ON "User" AS UPDATE
  USING (auth.uid()::text = id);

-- Enable RLS on Cart table
ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own cart" ON "Cart" AS SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users update own cart" ON "Cart" AS UPDATE
  USING (auth.uid()::text = "userId");

-- Enable RLS on Order table
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own orders" ON "Order" AS SELECT
  USING (auth.uid()::text = "userId");

-- Enable RLS on Address table
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own addresses" ON "Address" AS SELECT
  USING (auth.uid()::text = "userId");

-- Product table (public read)
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are public" ON "Product" AS SELECT
  USING (true);

-- Newsletter table (public insert)
ALTER TABLE "Newsletter" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON "Newsletter" AS INSERT
  WITH CHECK (true);
\`\`\`

### Step 2: Verify RLS is Enabled

1. Go to **Authentication** → **Policies**
2. You should see your newly created policies listed

---

## Admin Credentials

### Default Admin Account

The system comes with a demo admin account:

- **Email**: `admin@regime.com`
- **Password**: `Admin@Regime123!`

### Accessing Admin Dashboard

1. Navigate to `/admin/login`
2. Enter the admin credentials above
3. You'll be directed to `/admin` dashboard

### Creating Additional Admin Credentials

To add more admin users (requires existing admin):

\`\`\`typescript
// Use the createAdminCredentialAction server action
const result = await createAdminCredentialAction(
  currentAdminEmail, // 'admin@regime.com'
  {
    email: 'newadmin@regime.com',
    password: 'SecurePassword123!',
  }
)
\`\`\`

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

---

## Seeding Sample Data

### Step 1: Create seed.ts

Create `prisma/seed.ts`:

\`\`\`typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        title: 'Gentle Cleanser',
        description: 'pH-balanced, non-stripping formula for sensitive skin',
        price: 45,
        category: 'skincare',
        productType: 'Cleanser',
        skinConcern: 'Redness',
        sku: 'GC-001',
        stock: 50,
        images: ['/placeholder.svg?height=400&width=400'],
        ingredients: ['Water', 'Glycerin', 'Chamomile Extract'],
      },
    }),
    prisma.product.create({
      data: {
        title: 'Hydrating Serum',
        description: 'Hyaluronic acid serum for deep hydration',
        price: 65,
        category: 'skincare',
        productType: 'Serum',
        skinConcern: 'Dehydration',
        sku: 'HS-001',
        stock: 40,
        images: ['/placeholder.svg?height=400&width=400'],
        ingredients: ['Hyaluronic Acid', 'Niacinamide', 'Vitamin E'],
      },
    }),
  ])

  console.log(`Seeded ${products.length} products`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
\`\`\`

### Step 2: Update package.json

Add to `package.json`:

\`\`\`json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
\`\`\`

### Step 3: Run Seed

\`\`\`bash
npx prisma db seed
\`\`\`

---

## Security Best Practices

### 1. Input Validation

All forms use **React Hook Form + Zod** for dual validation:

\`\`\`typescript
// Client-side: Form validation via Zod schema
const form = useForm({
  resolver: zodResolver(signUpSchema),
})

// Server-side: Validation in Server Action
export async function signUpAction(data: unknown) {
  const validated = signUpSchema.parse(data) // Throws if invalid
}
\`\`\`

### 2. Server Actions for Data Mutations

All data mutations happen server-side:

\`\`\`typescript
// ✅ CORRECT: Server action handles mutation
'use server'
export async function addToCartAction(productId: string) {
  const cart = await prisma.cart.update(...)
}

// ❌ WRONG: Client fetching database
const response = await fetch('/api/cart', { method: 'POST' })
\`\`\`

### 3. Row-Level Security (RLS)

Database-level security ensures users can't access other users' data, even if they try to bypass client-side checks.

### 4. Environment Variables

- **NEVER** commit `.env.local` to Git
- Server secrets are NEVER sent to the client
- Use `NEXT_PUBLIC_` prefix ONLY for keys meant for the browser

### 5. Password Hashing

In production, use **bcrypt** for password hashing:

\`\`\`bash
npm install bcryptjs
\`\`\`

Update `app/actions/admin.ts`:

\`\`\`typescript
import bcrypt from 'bcryptjs'

// Hashing password
const hashedPassword = await bcrypt.hash(password, 10)

// Comparing password
const isMatch = await bcrypt.compare(password, hashedPassword)
\`\`\`

---

## Deployment

### Step 1: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables from your `.env.local`
5. Deploy!

### Step 2: Update Database URL

Vercel will detect that you're using Prisma and will prompt you to add environment variables.

### Step 3: Run Migrations in Production

After deployment, run migrations on the production database:

\`\`\`bash
npx prisma migrate deploy
\`\`\`

---

## Troubleshooting

### Error: "Can't reach database server"

**Solution**: Check your `DATABASE_URL` is correct. Verify in Supabase dashboard.

### Error: "Auth required" or RLS policy errors

**Solution**: Ensure RLS policies are correctly set up. Check **SQL Editor** → **Policies** in Supabase.

### Prisma Client not generating

**Solution**: Delete `node_modules/.prisma` and run:

\`\`\`bash
npx prisma generate
\`\`\`

### Products not showing up

**Solution**: Verify you've run the seed script:

\`\`\`bash
npx prisma db seed
\`\`\`

---

## Architecture Overview

\`\`\`
REGIME Ecommerce
├── Frontend (React/Next.js 16)
│   ├── Components (React Hook Form + Zod validation)
│   ├── Redux Store (cart, auth state)
│   └── Server Actions (secure mutations)
│
├── Backend (Next.js Server Actions)
│   ├── Validation (Zod schemas)
│   ├── Database (Prisma ORM)
│   └── Supabase RLS (row-level security)
│
└── Database (PostgreSQL via Supabase)
    ├── User, Product, Cart, Order tables
    ├── Row-Level Security policies
    └── Automated backups & monitoring
\`\`\`

---

## Support

For issues:
1. Check Supabase status: [status.supabase.com](https://status.supabase.com)
2. Review Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
3. Check application logs in Vercel dashboard
4. Open an issue on GitHub

---

**Last Updated**: November 2024
**Version**: 1.0.0
