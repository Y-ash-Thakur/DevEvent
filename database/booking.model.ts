import mongoose, { Document, Model, Schema, Types } from "mongoose";

import Event from "./event.model";

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Simple but robust email regex — sufficient for most real-world addresses.
 * Heavy RFC 5322 parsers are overkill here; the pre-save hook catches invalid values.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<IBooking>(
  {
    // ObjectId ref keeps the collection loosely coupled to Event without
    // MongoDB-level foreign-key constraints (which MongoDB doesn't support).
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true, // speeds up queries that filter bookings by event
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true, // normalise storage; avoids duplicate-email edge cases
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: "Invalid email address.",
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
 * Verifies the referenced event exists before persisting the booking.
 *
 * MongoDB does not enforce referential integrity, so this hook provides that
 * guarantee at the application layer. The check only runs when eventId is new
 * or modified to avoid an extra DB round-trip on unrelated updates.
 */
BookingSchema.pre("save", async function (next) {
  if (this.isModified("eventId")) {
    const eventExists = await Event.exists({ _id: this.eventId });

    if (!eventExists) {
      return next(
        new Error(`Event with ID "${this.eventId.toString()}" does not exist.`)
      );
    }
  }

  next();
});

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

// Guard against model recompilation during Next.js hot reloads in development.
const Booking =
  (mongoose.models.Booking as Model<IBooking>) ??
  mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
