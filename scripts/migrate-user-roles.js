/**
 * One-time migration: backfill role field for all User records.
 *
 * Rules:
 *   - isSuper: true  → role: 'super'
 *   - isAdmin: true (and not super) → role: 'admin'
 *   - all remaining → role: 'agent'
 *
 * Usage:
 *   node --experimental-vm-modules scripts/migrate-user-roles.js
 *
 * Requires MONGODB_URI in the environment (or .env file at project root).
 *
 * Idempotent: safe to run multiple times.
 */

import 'dotenv/config'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set.')
  process.exit(1)
}

async function migrate() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB. Running role migration...')

  const users = mongoose.connection.collection('users')

  const superResult = await users.updateMany({ isSuper: true }, { $set: { role: 'super' } })
  console.log(`  super: ${superResult.modifiedCount} updated`)

  const adminResult = await users.updateMany({ isAdmin: true, isSuper: false }, { $set: { role: 'admin' } })
  console.log(`  admin: ${adminResult.modifiedCount} updated`)

  const agentResult = await users.updateMany({ role: { $exists: false } }, { $set: { role: 'agent' } })
  console.log(`  agent: ${agentResult.modifiedCount} updated`)

  const counts = await users.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]).toArray()
  console.log('Role distribution after migration:', counts)

  await mongoose.disconnect()
}

migrate().catch(console.error)
