import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { verifyStudentToken, STUDENT_TOKEN_NAME } from '@/lib/studentJwt'

// SECURITY: Auth bypass removed. Never disable authentication in any environment.

// Resolves the current user as a real MongoDB document (so queries that need a
// real userId work).
export async function getCurrentUser() {
  if (!process.env.MONGODB_URI) return null
  await dbConnect()

  const session = await getServerSession(authOptions)
  if (session?.user?.email) {
    const existing = await User.findOne({ email: session.user.email })
    if (existing) return existing
  }

  const cookieStore = cookies()
  const token = cookieStore.get(STUDENT_TOKEN_NAME)?.value
  if (!token) return null

  const verification = await verifyStudentToken(token)
  if (!verification.valid || !verification.payload.userId) return null

  return User.findById(verification.payload.userId)
}
