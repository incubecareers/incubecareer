#!/usr/bin/env node
/**
 * Create database indexes for performance optimization
 * Run with: node scripts/create-indexes.mjs
 */

import mongoose from 'mongoose'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local manually (handles Windows \r\n line endings)
try {
  const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf8')
  const lines = envFile.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (!match) continue
    const key = match[1].trim()
    let val = match[2].trim()
    val = val.replace(/^(['"`])(.*)(\1)$/, '$2')
    if (!process.env[key]) process.env[key] = val
  }
} catch (e) {
  console.log('Warning: Could not read .env.local:', e.message)
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local')
  process.exit(1)
}

async function createIndexes() {
  try {
    console.log('📊 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db

    // Course indexes
    console.log('\n📚 Creating Course indexes...')
    await db.collection('courses').createIndex({ status: 1, createdAt: -1 })
    await db.collection('courses').createIndex({ slug: 1 }, { unique: true })
    await db.collection('courses').createIndex({ status: 1, category: 1 })
    console.log('✅ Course indexes created')

    // User indexes
    console.log('\n👤 Creating User indexes...')
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ phone: 1 }, { unique: true, sparse: true })
    await db.collection('users').createIndex({ googleId: 1 }, { unique: true, sparse: true })
    await db.collection('users').createIndex({ role: 1 })
    console.log('✅ User indexes created')

    // Enrollment indexes
    console.log('\n📝 Creating Enrollment indexes...')
    await db.collection('enrollments').createIndex({ student: 1, course: 1 }, { unique: true })
    await db.collection('enrollments').createIndex({ student: 1 })
    await db.collection('enrollments').createIndex({ course: 1 })
    await db.collection('enrollments').createIndex({ createdAt: -1 })
    console.log('✅ Enrollment indexes created')

    // Payment indexes
    console.log('\n💳 Creating Payment indexes...')
    await db.collection('payments').createIndex({ student: 1, createdAt: -1 })
    await db.collection('payments').createIndex({ razorpayOrderId: 1 }, { unique: true, sparse: true })
    await db.collection('payments').createIndex({ status: 1 })
    console.log('✅ Payment indexes created')

    // Quiz/Exam indexes
    console.log('\n📋 Creating Quiz/Exam indexes...')
    await db.collection('quizattempts').createIndex({ student: 1, quiz: 1 })
    await db.collection('quizattempts').createIndex({ student: 1, createdAt: -1 })
    await db.collection('examattempts').createIndex({ student: 1, createdAt: -1 })
    console.log('✅ Quiz/Exam indexes created')

    console.log('\n✅ All indexes created successfully!')
    console.log('🚀 Database queries will be much faster now!')

  } catch (error) {
    console.error('\n❌ Error creating indexes:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n👋 Disconnected from MongoDB')
  }
}

createIndexes()
