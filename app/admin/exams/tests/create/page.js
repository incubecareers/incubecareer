import { getAdminSession } from '@/lib/admin'
import { redirect } from 'next/navigation'
import TestBuilder from '@/components/admin/TestBuilder'
import dbConnect from '@/lib/mongodb'
import ExamSubject from '@/models/ExamSubject'
import { serialize } from '@/lib/utils'

export default async function CreateTestPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  await dbConnect()
  const subjects = await ExamSubject.find({ status: 'active' })
    .sort({ order: 1, name: 1 })
    .lean()

  return <TestBuilder initialSubjects={serialize(subjects)} userId={session.user.id} />
}
