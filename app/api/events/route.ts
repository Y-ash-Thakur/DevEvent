import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        let event;

        try {
            event = await req.json();
            
            // Map the UI dropdown values to the mongoose schema enum values
            if (event.mode) {
                if (event.mode === 'Hybrid (In-Person & Online)') {
                    event.mode = 'hybrid';
                } else if (event.mode === 'Online') {
                    event.mode = 'online';
                } else if (event.mode === 'In-Person') {
                    event.mode = 'offline';
                } else {
                    event.mode = event.mode.toLowerCase();
                }
            }

        } catch (e) {
            return NextResponse.json({ message: 'Invalid JSON data format' }, { status: 400 });
        }

        const createdEvent = await Event.create(event);

        const posthog = getPostHogClient();
        posthog.capture({
            distinctId: 'anonymous',
            event: 'event_created',
            properties: {
                event_title: createdEvent.title,
                event_slug: createdEvent.slug,
                event_location: createdEvent.location,
                event_date: createdEvent.date,
            },
        });
        await posthog.shutdown();

        return NextResponse.json({ message: 'Event Created Successfully', event: createdEvent }, { status: 200 });

    } catch (e) {
        console.error(e);

        const posthog = getPostHogClient();
        posthog.capture({
            distinctId: 'anonymous',
            event: 'event_creation_failed',
            properties: {
                error_message: e instanceof Error ? e.message : 'Unknown error',
            },
        });
        await posthog.shutdown();

        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
    }
}