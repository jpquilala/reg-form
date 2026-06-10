# Velvet Masters League Player Registration

Static registration page plus Vercel serverless API routes for saving player records to Postgres and exporting the roster as CSV.

## Deploy to Vercel

1. Push this folder to a Git repository.
2. Import the repository in Vercel.
3. Add a Vercel Postgres database to the project, or provide a compatible `POSTGRES_URL` environment variable.
4. Add this environment variable:

```env
ADMIN_PASSWORD=iamanadmin.*
```

5. Deploy.

The database table is created automatically the first time a registration or export request runs.

## Local Development

Install dependencies, then run Vercel locally:

```bash
npm install
npm run dev
```

Create a local `.env` file using `.env.example` as the guide. The plain `index.html` file can still be opened in a browser, but database features require the Vercel dev server or a deployed Vercel site.
