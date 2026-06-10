# Velvet Masters League Player Registration

Static registration page plus Vercel serverless API routes for saving player records to Supabase and exporting the roster as CSV.

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run the SQL in `supabase-schema.sql`.
4. Copy these values from Project Settings > API:
   - Project URL
   - `service_role` key

Keep the service-role key private. It is only used by Vercel serverless functions and is never exposed in the browser.

## Deploy to Vercel

1. Import this GitHub repository in Vercel.
2. Add these Vercel environment variables:

```env
ADMIN_PASSWORD=iamanadmin.*
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

3. Deploy.

## Local Development

Install dependencies, then run Vercel locally:

```bash
npm install
npm run dev
```

Create a local `.env` file using `.env.example` as the guide. The plain `index.html` file can still be opened in a browser, but database features require the Vercel dev server or a deployed Vercel site.
