import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamChapter from '@/models/ExamChapter'
import { serialize } from '@/lib/utils'

// GET /api/exams/chapters/:id - Get single chapter
export async function GET(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const chapter = await ExamChapter.findById(params.id).lean()

  if (!chapter) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
  }

  return NextResponse.json(serialize(chapter))
}

// PATCH /api/exams/chapters/:id - Update chapter
export async function PATCH(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  await dbConnect()
  const updates = {}
  
  if (body.name !== undefined) updates.name = body.name.trim()
  if (body.description !== undefined) updates.description = body.description.trim()
  if (body.order !== undefined) updates.order = body.order
  if (body.status !== undefined) updates.status = body.status

  const chapter = await ExamChapter.findByIdAndUpdate(
    params.id,
    updates,
    { new: true }
  ).lean()

  if (!chapter) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
  }

  return NextResponse.json(serialize(chapter))
}

// DELETE /api/exams/chapters/:id - Delete chapter
export async function DELETE(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  
  // TODO: Check if chapter has questions before deleting
  // const questionCount = await ExamQuestion.countDocuments({ chapterId: params.id })
  // if (questionCount > 0) {
  //   return NextResponse.json({ 
  //     error: 'Cannot delete chapter with existing questions.' 
  //   }, { status: 400 })
  // }

  await ExamChapter.findByIdAndDelete(params.id)
  return NextResponse.json({ ok: true })
}
