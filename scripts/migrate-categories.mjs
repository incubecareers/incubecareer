/**
 * Seed/update the Category collection with the canonical degree-based categories.
 * Run with: npm run migrate:categories
 *
 * Safe to re-run — uses upsert so it won't duplicate categories.
 * Deactivates categories not in the new list (old school/exam categories).
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local manually (handles Windows \r\n line endings)
try {
  const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf8')
  // Replace Windows line endings with Unix
  const lines = envFile.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    // Value: everything after = , strip surrounding quotes
    let val = trimmed.slice(eqIdx + 1)
    // Remove inline comments (but be careful with URIs that contain #)
    // Only strip if # is preceded by whitespace
    val = val.replace(/\s+#.*$/, '').trim()
    val = val.replace(/^(['"`])(.*)(\1)$/, '$2')
    if (!process.env[key]) process.env[key] = val
  }
} catch (e) {
  console.log('Warning: Could not read .env.local:', e.message)
}

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set in .env.local')
  process.exit(1)
}

const CATEGORIES = [
  // Undergraduate degrees
  { name: 'BCA', slug: 'bca', kind: 'degree', order: 1 },
  { name: 'BBA', slug: 'bba', kind: 'degree', order: 2 },
  { name: 'BCom', slug: 'bcom', kind: 'degree', order: 3 },
  { name: 'BSc', slug: 'bsc', kind: 'degree', order: 4 },
  { name: 'BA', slug: 'ba', kind: 'degree', order: 5 },
  { name: 'BTech / BE', slug: 'btech-be', kind: 'degree', order: 6 },
  // Postgraduate degrees
  { name: 'MCA', slug: 'mca', kind: 'degree', order: 7 },
  { name: 'MBA', slug: 'mba', kind: 'degree', order: 8 },
  { name: 'MCom', slug: 'mcom', kind: 'degree', order: 9 },
  { name: 'MSc', slug: 'msc', kind: 'degree', order: 10 },
  { name: 'MA', slug: 'ma', kind: 'degree', order: 11 },
  { name: 'MTech / ME', slug: 'mtech-me', kind: 'degree', order: 12 },
  // Working professionals / career changers
  { name: 'Working Professional', slug: 'working-professional', kind: 'professional', order: 13 },
  { name: 'Career Changer', slug: 'career-changer', kind: 'professional', order: 14 },
  { name: 'Fresh Graduate', slug: 'fresh-graduate', kind: 'professional', order: 15 },
]

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  kind: { type: String, enum: ['school', 'exam', 'degree', 'professional'], default: 'degree', index: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)

async function migrate() {
  await mongoose.connect(MONGODB_URI)
  console.log('✅  Connected to MongoDB')

  const newSlugs = CATEGORIES.map(c => c.slug)

  // Deactivate old categories not in new list
  const deactivated = await Category.updateMany(
    { slug: { $nin: newSlugs } },
    { $set: { active: false } }
  )
  console.log(`⚠️   Deactivated ${deactivated.modifiedCount} old categories`)

  // Upsert all new categories
  let created = 0
  let updated = 0
  for (const cat of CATEGORIES) {
    const result = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: { ...cat, active: true } },
      { upsert: true, new: true }
    )
    if (result.createdAt?.getTime() === result.updatedAt?.getTime()) {
      created++
    } else {
      updated++
    }
  }

  console.log(`✅  Created ${created} new categories, updated ${updated} existing categories`)
  console.log('\n📚  Current categories:')
  const all = await Category.find({ active: true }).sort({ order: 1 })
  all.forEach(c => console.log(`   ${c.order}. ${c.name} (${c.kind})`))

  await mongoose.disconnect()
  console.log('\n✅  Migration complete!')
}

migrate().catch(err => {
  console.error('❌  Migration failed:', err)
  process.exit(1)
})
