import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamGrade from '@/models/ExamGrade'
import { serialize } from '@/lib/utils'

// GET /api/exams/grades - List all grades
export async function GET(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  
  // Auto-create default grades if none exist
  const count = await ExamGrade.countDocuments()
  if (count === 0) {
    const defaultGrades = [
      { name: '8th Grade', description: 'Questions for 8th standard students', icon: '🎒', order: 1, status: 'active' },
      { name: '9th Grade', description: 'Questions for 9th standard students', icon: '📚', order: 2, status: 'active' },
      { name: '10th Grade', description: 'Questions for 10th standard students (Board Exams)', icon: '🎓', order: 3, status: 'active' },
      { name: '11th Grade', description: 'Questions for 11th standard students', icon: '📖', order: 4, status: 'active' },
      { name: '12th Grade', description: 'Questions for 12th standard students (Board Exams)', icon: '🎯', order: 5, status: 'active' },
      { name: 'NEET', description: 'National Eligibility cum Entrance Test for Medical', icon: '🩺', order: 6, status: 'active' },
      { name: 'CET', description: 'Common Entrance Test', icon: '🏆', order: 7, status: 'active' },
      { name: 'JEE Main', description: 'Joint Entrance Examination for Engineering', icon: '⚙️', order: 8, status: 'active' },
      { name: 'JEE Advanced', description: 'Advanced JEE for IITs', icon: '🔬', order: 9, status: 'active' },
    ]
    await ExamGrade.insertMany(defaultGrades)
  }

  const grades = await ExamGrade.find({})
    .sort({ order: 1, name: 1 })
    .lean()
  
  return NextResponse.json(serialize(grades))
}

// POST /api/exams/grades - Create a new grade
export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, description, icon, order } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Grade name is required' }, { status: 400 })
  }

  await dbConnect()
  const grade = await ExamGrade.create({
    name: name.trim(),
    description: description?.trim() || '',
    icon: icon || '',
    order: order || 0,
    status: 'active',
  })

  return NextResponse.json(serialize(grade))
}
