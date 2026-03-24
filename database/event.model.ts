import mongoose, { Document, Model, Schema } from "mongoose";

// Union type restricts mode to the three valid values.
export type EventMode = "online" | "offline" | "hybrid";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as YYYY-MM-DD
  time: string; // stored as HH:MM AM/PM
  mode: EventMode;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Converts a title to a URL-safe slug (e.g. "React Summit 2025" → "react-summit-2025"). */
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric characters
    .replace(/[\s_]+/g, "-")  // spaces and underscores → single hyphen
    .replace(/-+/g, "-")      // collapse consecutive hyphens
    .replace(/^-|-$/g, "");   // strip leading / trailing hyphens
}

/**
 * Normalises a time string to zero-padded "HH:MM AM/PM" format.
 * Accepts variants such as "9:00am", "9:00 AM", or "09:00 PM".
 */
function normaliseTime(raw: string): string {
  const match = raw
    .trim()
    .match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s*(AM|PM)$/i);

  if (!match) {
    throw new Error(
      `Invalid time "${raw}". Expected format: HH:MM AM or HH:MM PM.`
    );
  }

  const hours = match[1].padStart(2, "0");
  const minutes = match[2];
  const period = match[3].toUpperCase();

  return `${hours}:${minutes} ${period}`;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    // Auto-generated from title in the pre-save hook; unique index keeps slugs distinct.
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"] as EventMode[],
        message: 'Mode must be "online", "offline", or "hybrid".',
      },
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Agenda must contain at least one item.",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one tag is required.",
      },
    },
  },
  {
    // Automatically manages createdAt and updatedAt fields.
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Pre-save hook
// ---------------------------------------------------------------------------

/**
 * Runs before every save operation:
 *
 * 1. Slug   — regenerated only when `title` is new or modified, keeping
 *             existing slugs stable after the first save.
 * 2. Date   — parsed and re-serialised to YYYY-MM-DD (ISO date portion) so
 *             storage is always consistent regardless of input format.
 * 3. Time   — normalised to zero-padded "HH:MM AM/PM" uppercase format.
 */
EventSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = toSlug(this.title);
  }

  if (this.isModified("date")) {
    const parsed = new Date(this.date);
    if (isNaN(parsed.getTime())) {
      return next(
        new Error(
          `Invalid date "${this.date}". Use a recognisable format such as YYYY-MM-DD.`
        )
      );
    }
    // toISOString() → "YYYY-MM-DDTHH:mm:ss.sssZ"; slice the date portion only.
    this.date = parsed.toISOString().split("T")[0];
  }

  if (this.isModified("time")) {
    try {
      this.time = normaliseTime(this.time);
    } catch (err) {
      return next(err instanceof Error ? err : new Error(String(err)));
    }
  }

  next();
});

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

// Guard against model recompilation during Next.js hot reloads in development.
const Event =
  (mongoose.models.Event as Model<IEvent>) ??
  mongoose.model<IEvent>("Event", EventSchema);

export default Event;
