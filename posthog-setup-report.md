<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the DevEvent Next.js App Router project. The following changes were made:

- **`instrumentation-client.ts`** — Already present; initializes PostHog client-side with `capture_exceptions: true` for error tracking and reverse-proxy ingestion via `/ingest`.
- **`lib/posthog-server.ts`** — Created: `getPostHogClient()` factory that returns a fresh `posthog-node` client per call, suitable for Next.js API route handlers.
- **`app/api/events/route.ts`** — Added server-side `event_created` capture on success and `event_creation_failed` capture on error via the Node SDK.
- **`components/NavBar.tsx`** — Added `'use client'` directive and `nav_link_clicked` capture with a `label` property on each nav link click.
- **`.env.local`** — Created with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`.
- **`next.config.ts`** — Already configured with PostHog ingest rewrites and `skipTrailingSlashRedirect`.

Existing events (`event_card_clicked` in `EventCard.tsx` and `explore_events_clicked` in `ExploreBtn.tsx`) were already instrumented and left unchanged.

| Event | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicks the "Explore Events" CTA button (top of funnel) | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks an event card (with title, slug, location, date properties) | `components/EventCard.tsx` |
| `nav_link_clicked` | User clicks a navigation link (with `label` property) | `components/NavBar.tsx` |
| `event_created` | Server-side: a new event was successfully created via POST /api/events | `app/api/events/route.ts` |
| `event_creation_failed` | Server-side: event creation failed (with `error_message` property) | `app/api/events/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/367765/dashboard/1427797
- **Engagement: Explore & Event Card Clicks** (top-of-funnel trend): https://us.posthog.com/project/367765/insights/01vkcrJ8
- **Conversion Funnel: Explore → Event Card Click** (funnel): https://us.posthog.com/project/367765/insights/8WT1LerS
- **Event Creation: Success vs Failure** (API reliability): https://us.posthog.com/project/367765/insights/AfHcGQyF
- **Most Clicked Events** (event card engagement by title): https://us.posthog.com/project/367765/insights/k1hfsKjx
- **Nav Link Click Distribution** (navigation behavior): https://us.posthog.com/project/367765/insights/sBXcKbzH

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
