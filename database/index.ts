// Single entry point for all database models and their TypeScript types.
// Import from "@/database" anywhere in the application instead of
// referencing individual model files directly.

export { default as Event } from "./event.model";
export type { IEvent, EventMode } from "./event.model";

export { default as Booking } from "./booking.model";
export type { IBooking } from "./booking.model";
