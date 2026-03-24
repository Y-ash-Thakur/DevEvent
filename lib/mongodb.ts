import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

/**
 * Cached connection shape — holds the resolved Mongoose instance
 * and any in-flight connection promise.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Augment the NodeJS global type so TypeScript recognises `global.mongoose`.
 * Using `var` here is intentional; `let`/`const` cannot be used in global declarations.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Reuse the cached object across module evaluations (e.g. Next.js hot reloads).
const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

/**
 * Connects to MongoDB via Mongoose and returns the Mongoose instance.
 *
 * - Returns the existing connection immediately if one is already open.
 * - Reuses a pending promise if a connection attempt is already in progress,
 *   preventing duplicate connections during parallel server-side requests.
 */
export async function connectDB(): Promise<Mongoose> {
  // Connection already established — return it right away.
  if (cached.conn) {
    return cached.conn;
  }

  // Kick off a new connection only if one isn't already in flight.
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // Do not queue operations while disconnected; surface errors immediately.
      bufferCommands: false,
    });
  }

  // Wait for the connection, cache the result, then return it.
  cached.conn = await cached.promise;
  return cached.conn;
}
