import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamTopic from '@/models/ExamTopic'
import { serialize } from '@/lib/utils'

// PATCH /api/exams/topics/:id - Update a topic
export async function PATCH(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, description, order, status } = body

  if (name && !name.trim()) {
    return NextResponse.json({ error: 'Topic name cannot be empty' }, { status: 400 })
  }

  await dbConnect()
  const updates = {}
  if (name !== undefined) updates.name = name.trim()
  if (description !== undefined) updates.description = description.trim()
  if (order !== undefined) updates.order = order
  if (status !== undefined) updates.status = status

  const topic = await ExamTopic.findByIdAndUpdate(
    params.id,
    updates,
    { new: true }
  ).lean()

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  }

  return NextResponse.json(serialize(topic))
}

// DELETE /api/exams/topics/:id - Delete a topic
export async function DELETE(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  
  // Delete the topic (questions with this topicId are NOT deleted, just orphaned)
  await ExamTopic.findByIdAndDelete(params.id)

  return NextResponse.json({ ok: true })
}
