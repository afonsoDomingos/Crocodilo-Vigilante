/**
 * Mongoose connection singleton for Next.js (serverless-safe).
 * Reuses the connection across hot-reloads in dev and across
 * serverless function invocations in production.
 */
import mongoose from 'mongoose';
import dns from 'dns';

// Ensure SRV records can be resolved reliably across local DNS providers
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if running in environments with locked DNS
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// In development, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'Por favor defina a variável de ambiente MONGODB_URI no ficheiro .env.local ou na Vercel.'
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(uri, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
