import type { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { verifyPassword } from '@/lib/password'

// Emails listed here (comma-separated in the env var) are granted the "admin"
// role the first time they sign in. Everyone else defaults to "student".
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

// Emails listed here are granted the "faculty" role on first sign-in. Faculty
// can log into the admin panel to create courses, quizzes and questions.
const FACULTY_EMAILS = (process.env.FACULTY_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // Login ID + password login for staff (admin / faculty).
    CredentialsProvider({
      name: 'Staff login',
      credentials: {
        loginId: { label: 'Login ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.loginId || !credentials?.password) return null
        await dbConnect()

        const id = credentials.loginId.trim().toLowerCase()
        const user = await User.findOne({
          $or: [{ username: id }, { email: id }],
        }).select('+password')

        if (!user?.password) return null
        if (!verifyPassword(credentials.password, user.password)) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        } as any
      },
    }),
    // Student phone-OTP login is handled outside NextAuth by the MSG91 OTP
    // Widget flow: the browser verifies the OTP, POSTs the widget access-token
    // to /api/otp/verify, and that route issues the student `auth_token` cookie
    // (see lib/session.ts). No credentials provider is needed here.
  ],

  // Store the session as a JWT in an httpOnly cookie (no DB session table).
  session: {
    strategy: 'jwt',
    maxAge: 20 * 60, // 20 minutes
    updateAge: 0, // do not refresh session automatically
  },
  jwt: {
    maxAge: 20 * 60, // 20 minutes
  },
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login',
  },

  callbacks: {
    // Create the user record in MongoDB on first Google sign-in.
    async signIn({ user, account }: any) {
      // Staff password logins are validated in their authorize() already.
      if (account?.provider === 'credentials') return true
      if (account?.provider !== 'google') return false
      await dbConnect()

      const googleId = account.providerAccountId
      const existing = await User.findOne({
        $or: [{ googleId }, { email: user.email }],
      })

      if (!existing) {
        const email = (user.email || '').toLowerCase()
        const role = ADMIN_EMAILS.includes(email)
          ? 'admin'
          : FACULTY_EMAILS.includes(email)
            ? 'faculty'
            : 'student'
        await User.create({
          googleId,
          name: user.name,
          email: user.email,
          image: user.image,
          role,
        })
      } else {
        // Keep the profile in sync with the Google account on every sign-in
        // (name and photo are sourced from Google, not edited in the app).
        existing.googleId = googleId
        existing.name = user.name
        existing.image = user.image
        await existing.save()
      }

      return true
    },

    // Persist the Mongo _id, role, and profileCompleted into the JWT
    async jwt({ token, user, account }: any) {
      if (account && user) {
        await dbConnect()
        const dbUser = await User.findOne({ email: user.email })
        if (dbUser) {
          token.uid = dbUser._id.toString()
          token.role = dbUser.role
          token.profileCompleted = dbUser.profileCompleted || false
        }
      }
      return token
    },

    // Expose id, role, and profileCompleted on the session object.
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.uid
        session.user.role = token.role
        session.user.profileCompleted = token.profileCompleted
      }
      return session
    },

    // After Google sign-in, redirect based on profile completion
    async redirect({ url, baseUrl, token }: any) {
      // If url is relative, prefix with baseUrl
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // If url starts with baseUrl, allow it
      if (url.startsWith(baseUrl)) return url
      
      // Check if profile is complete
      if (token?.profileCompleted === false) {
        // Profile not complete - redirect to complete-profile
        return `${baseUrl}/complete-profile?callbackUrl=/dashboard`
      }
      
      // Profile complete - go to dashboard
      return `${baseUrl}/dashboard`
    },
  },
}
