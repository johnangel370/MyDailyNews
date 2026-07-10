# Daily AI Briefing

Private web archive of the daily AI briefing (Computer Vision / LLM / Multimodal),
backed by Supabase and deployed on Vercel.

## Supabase project

- Project ref: `ggaycrjwiyebfinvlghn`
- URL: `https://ggaycrjwiyebfinvlghn.supabase.co`
- Table: `briefings` (one row per day, RLS enabled, no public policies --
  only the `service_role` key can read/write, so all queries happen
  server-side in this app or from the scheduled task).

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` -- get this from
  Supabase Dashboard -> Project Settings -> API -> reveal "service_role" secret.
  Keep this secret; never expose it to the browser.
- `SITE_PASSWORD` -- the password used to gate the site.

The same three variables must be set as Environment Variables in the
Vercel project settings for the deployed site to work.

## Local development

```
npm install
npm run dev
```

## How data gets in

A scheduled Claude task runs every morning, researches AI/ML news, and
POSTs the result directly to the Supabase REST API
(`/rest/v1/briefings`, upsert on `briefing_date`) using the service role
key. This app only reads from Supabase to render the archive.
