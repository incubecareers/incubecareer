import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Course from '@/models/Course'
import { serialize } from '@/lib/utils'
import SiteNavbar from '@/components/SiteNavbar'
import SiteFooter from '@/components/SiteFooter'
import SiteSetting from '@/models/SiteSetting'
import { SITE_DEFAULTS, mergeSiteSettings } from '@/lib/siteDefaults'
import Link from 'next/link'
import { BookOpen, Clock, PlayCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My Learning - Incube Careers',
  description: 'Access your enrolled courses and continue learning',
}

async function getSettings() {
  if (!process.env.MONGODB_URI) {
    return mergeSiteSettings(SITE_DEFAULTS)
  }
  await dbConnect()
  const setting = await SiteSetting.findOne().lean()
  return mergeSiteSettings(setting ? serialize(setting) : SITE_DEFAULTS)
}

async function getUserEnrollments(userId) {
  if (!process.env.MONGODB_URI) {
    return []
  }

  try {
    await dbConnect()
    const enrollments = await Enrollment.find({ 
      userId,
      status: { $in: ['active', 'completed'] }
    })
      .populate('courseId')
      .sort({ enrolledAt: -1 })
      .lean()

    return enrollments
      .filter(e => e.courseId) // Filter out enrollments with deleted courses
      .map(e => ({
        ...serialize(e),
        course: serialize(e.courseId)
      }))
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return []
  }
}

export default async function MyLearningPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/login?callbackUrl=/learn')
  }

  if (currentUser.role === 'student' && !currentUser.profileCompleted) {
    redirect('/complete-profile?callbackUrl=/learn')
  }

  const [enrollments, s] = await Promise.all([
    getUserEnrollments(currentUser._id),
    getSettings(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-brand-surface">
      <SiteNavbar links={s.navbarLinks} />

      {/* Header */}
      <section className="border-b border-brand-border bg-hero-mesh px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-brand-textPrimary sm:text-4xl">
            My Learning
          </h1>
          <p className="mt-2 text-base text-brand-textSecondary">
            Continue your learning journey
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {enrollments.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-brand-border bg-white p-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accentLight text-brand-accent">
              <BookOpen className="h-7 w-7" />
            </span>
            <p className="text-lg font-semibold text-brand-textPrimary">
              No courses enrolled yet
            </p>
            <p className="max-w-sm text-sm text-brand-textSecondary">
              Explore our courses and start your learning journey today
            </p>
            <Link
              href="/courses"
              className="mt-4 rounded-xl bg-brand-accent px-6 py-3 font-bold text-white transition hover:bg-brand-accentDark"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <Link
                key={enrollment._id}
                href={`/learn/${enrollment.course._id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {enrollment.course.thumbnail ? (
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <PlayCircle className="h-16 w-16 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-heading text-base font-bold leading-tight text-gray-900 line-clamp-2">
                    {enrollment.course.title}
                  </h3>

                  {enrollment.course.category && (
                    <p className="mt-2 text-xs text-gray-600">
                      {enrollment.course.category}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <span>{enrollment.progress || 0}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-brand-accent to-orange-600"
                        style={{ width: `${enrollment.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <button className="mt-4 w-full rounded-lg bg-gradient-to-r from-brand-accent to-orange-600 px-4 py-2.5 text-sm font-bold text-white transition hover:scale-105">
                    Continue Learning
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <SiteFooter
        about={s.footerAbout}
        columns={s.footerColumns}
        socials={s.socialLinks}
        footerText={s.footerText}
      />
    </div>
  )
}
