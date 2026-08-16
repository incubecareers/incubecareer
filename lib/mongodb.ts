import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined
}

// Cache the connection across hot reloads in dev and across lambda
// invocations in production so we don't open a new connection per request.
let cached = global._mongoose
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

export default async function dbConnect(): Promise<typeof mongoose> {
  if (cached!.conn) {
    // Check if connection is alive
    if (mongoose.connection.readyState === 1) {
      return cached!.conn
    }
    // Connection dropped, clear cache
    cached!.conn = null
    cached!.promise = null
  }

  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable')
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      // Keep a warm pool of connections
      maxPoolSize: 10,
      minPoolSize: 2,
      // Longer timeouts for more stable connections
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 15000,
      // Retry writes on network errors
      retryWrites: true,
      retryReads: true,
      // Connection heartbeat
      heartbeatFrequencyMS: 10000,
    }

    cached!.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log('✅ MongoDB connected successfully')
        return m
      })
      .catch((err) => {
        cached!.promise = null
        console.error('❌ MongoDB connection error:', err.message)
        throw err
      })
  }

  try {
    cached!.conn = await cached!.promise
    return cached!.conn
  } catch (error) {
    cached!.promise = null
    cached!.conn = null
    throw error
  }
}
