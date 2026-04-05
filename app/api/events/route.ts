import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        let event;

        try{
            event = Object.fromEntries(formData.entries());
        } catch (error) {
            return NextResponse.json({ message: 'Invalid JSON data format'}, { status: 400 });
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

    } catch (error) {
        console.error(error);

        const posthog = getPostHogClient();
        posthog.capture({
            distinctId: 'anonymous',
            event: 'event_creation_failed',
            properties: {
                error_message: error instanceof Error ? error.message : 'Unknown error',
            },
        });
        await posthog.shutdown();

        return NextResponse.json({ message: 'Event Creation Failed', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}