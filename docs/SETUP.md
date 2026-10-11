# Vidhya X — Local Setup & Supabase Configuration Guide

## 1. Running the Website Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local Vite development server:
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

---

## 2. Interactive Demo Mode
If you do not configure Supabase credentials, Vidhya X automatically launches in **Interactive Demo Mode**:
- A notification banner is visible at the top of the interface.
- Includes pre-seeded Grade 11 & Grade 12 Science curriculum data (Physics, Chemistry, Botany, Zoology, Math, Computer Science, English, Nepali).
- Role quick-switchers in the top banner let you immediately switch between:
  - **Admin View**: Sampanna Timalsina (`officialsampannatimalsina@gmail.com`)
  - **Student View**: Aarav Shrestha (Grade 11 Enrolled with Grade 11 Notes Unlocked)
  - **Student View**: Prashant Adhikari (Grade 12 with Pending eSewa Purchase)
- LocalStorage persistence allows testing purchases, payment reviews, and mock test scoring.

---

## 3. Connecting Your Supabase Project

1. Create a project at [supabase.com](https://supabase.com).
2. Create a `.env` file based on `.env.example`:
   ```bash
   VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```
3. Apply the SQL Migration:
   - Navigate to the Supabase SQL Editor in your dashboard.
   - Copy the contents of `supabase/migrations/20261011000000_vidhya_x_schema.sql` and run it.
4. Set up Supabase Storage Buckets:
   - `free-materials` (Public: Enabled)
   - `premium-materials` (Public: Disabled / Private)
   - `payment-proofs` (Public: Disabled / Private)
5. Deploy Supabase Edge Functions:
   ```bash
   supabase functions deploy purchase-approval
   supabase functions deploy secure-pdf-url
   supabase functions deploy test-scoring
   supabase functions deploy admin-provision
   ```
