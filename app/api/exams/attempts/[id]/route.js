import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import ExamAttempt from '@/models/ExamAttempt'
import { serialize } from '@/lib/utils'

// PATCH /api/exams/attempts/:id - Update attempt (for auto-save)
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { answers } = body

  await dbConnect()

  // Get the attempt
  const attempt = await ExamAttempt.findById(params.id)
  if (!attempt) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
  }

  // Check if user owns this attempt
  if (attempt.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Don't allow updates after submission
  if (attempt.status !== 'in-progress') {
    return NextResponse.json({ error: 'Cannot update submitted attempt' }, { status: 400 })
  }

  // Update answers
  attempt.answers = answers
  await attempt.save()

  return NextResponse.json(serialize(attempt))
}
