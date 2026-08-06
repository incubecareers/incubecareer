import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamTopicNew from '@/models/ExamTopicNew'
import { serialize } from '@/lib/utils'

// GET /api/exams/chapter-topics/:id
export async function GET(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const topic = await ExamTopicNew.findById(params.id).lean()

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  }

  return NextResponse.json(serialize(topic))
}

// PATCH /api/exams/chapter-topics/:id
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

  const topic = await ExamTopicNew.findByIdAndUpdate(
    params.id,
    updates,
    { new: true }
  ).lean()

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  }

  return NextResponse.json(serialize(topic))
}

// DELETE /api/exams/chapter-topics/:id
export async function DELETE(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  await ExamTopicNew.findByIdAndDelete(params.id)
  return NextResponse.json({ ok: true })
}
