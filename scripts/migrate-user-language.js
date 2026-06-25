// MongoDB shell migration: backfill language field on existing users
// Run in MongoDB shell: load('scripts/migrate-user-language.js')
// Or via mongosh: mongosh <connection-string> --file scripts/migrate-user-language.js

/* global db, print */

const result = db.users.updateMany({ language: { $exists: false } }, { $set: { language: 'pt' } })

print('Matched:', result.matchedCount)
print('Modified:', result.modifiedCount)
