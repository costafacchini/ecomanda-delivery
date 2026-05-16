/**
 * One-time migration: backfill active: true for all Contact records that
 * predate the active field introduction.
 *
 * Usage:
 *   node --experimental-vm-modules scripts/migrate-contact-active.js
 *
 * Requires MONGODB_URI in the environment (or .env file at project root).
 *
 * Idempotent: only updates documents where active is not already set.
 * Safe to run multiple times.
 */

import 'dotenv/config'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set.')
  process.exit(1)
}

await mongoose.connect(MONGODB_URI)
console.log('Connected to MongoDB.')

const result = await mongoose.connection.collection('contacts').updateMany(
  { active: { $exists: false } },
  { $set: { active: true } },
)

console.log(`Migration complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`)

await mongoose.disconnect()
