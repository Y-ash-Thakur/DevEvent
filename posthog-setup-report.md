<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the DevEvent Next.js App Router project. PostHog is initialized via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), with a reverse proxy configured in `next.config.ts` to route analytics through `/ingest` for improved reliability. Two custom events are now tracked across the user journey, with automatic pageview tracking and exception capture also enabled.

| Event Name | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicks the "Explore Events" button on the home page to scroll to the events list | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks on an event card to view event details. Properties: `event_title`, `event_slug`, `event_location`, `event_date` | `components/EventCard.tsx` |

## Files changed

- **`instrumentation-client.ts`** (new) — Initializes PostHog client-side with EU host, reverse proxy, exception capture, and debug mode in development
- **`next.config.ts`** — Added reverse proxy rewrites for `/ingest` → `https://eu.i.posthog.com` and `skipTrailingSlashRedirect: true`
- **`components/ExploreBtn.tsx`** — Added `explore_events_clicked` capture in the button's click handler
- **`components/EventCard.tsx`** — Added `'use client'` directive and `event_card_clicked` capture with event metadata properties
- **`.env.local`** — Added `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` environment variables

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](https://eu.posthog.com/project/138628/dashboard/560928)
- [User Engagement Trend](https://eu.posthog.com/project/138628/insights/RBErTdjy) — Daily line chart of both events over 30 days
- [Explore to Event Click Funnel](https://eu.posthog.com/project/138628/insights/rAdC5o08) — Conversion funnel from explore button to event card click
- [Most Popular Events](https://eu.posthog.com/project/138628/insights/xvpxbUr5) — Bar chart of event card clicks broken down by event title
- [Daily Active Users (Event Engagement)](https://eu.posthog.com/project/138628/insights/pWr5IZc2) — Unique users engaging with event cards per day

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
