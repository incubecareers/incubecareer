/* eslint-disable @next/next/no-img-element */
import SignInCta from '@/components/SignInCta'
import SiteNavbar from '@/components/SiteNavbar'
import SiteFooter from '@/components/SiteFooter'
import CareerProgramCard from '@/components/CareerProgramCard'
import { ArrowRight, Sparkles, Users, Video, Award, Clock } from 'lucide-react'
import { SITE_DEFAULTS, mergeSiteSettings } from '@/lib/siteDefaults'
import dbConnect from '@/lib/mongodb'
import SiteSetting from '@/models/SiteSetting'
import Course from '@/models/Course'
import { serialize } from '@/lib/utils'
import { getCurrentUser } from '@/lib/session'

export const revalidate = 300

async function getSettings() {
  if (!process.env.MONGODB_URI) {
    return mergeSiteSettings(SITE_DEFAULTS)
  }

  await dbConnect()
  const setting = await SiteSetting.findOne().lean()
  return mergeSiteSettings(setting ? serialize(setting) : SITE_DEFAULTS)
}

async function getFeaturedCourses(featuredIds = []) {
  if (!process.env.MONGODB_URI) {
    return []
  }

  try {
    await dbConnect()
    
    // If admin has specified featured course IDs, fetch those specific courses
    if (featuredIds && featuredIds.length > 0) {
      const courses = await Course.find({ 
        _id: { $in: featuredIds },
        status: 'published' 
      })
        .select('title slug description thumbnail category whatYouLearn')
        .lean()
      
      // Maintain the order specified by admin
      const courseMap = {}
      courses.forEach((c) => { courseMap[c._id.toString()] = c })
      const ordered = featuredIds.map((id) => courseMap[id]).filter(Boolean)
      return ordered.map(serialize)
    }
    
    // Fallback: fetch latest 4 published courses
    const courses = await Course.find({ status: 'published' })
      .select('title slug description thumbnail category whatYouLearn')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean()
    return courses.map(serialize)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

export default async function Home() {
  const s = await getSettings()
  const [courses, currentUser] = await Promise.all([
    getFeaturedCourses(s.featuredCourseIds || []),
    getCurrentUser(),
  ])
  const isAuthenticated = Boolean(currentUser)

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Incube Careers',
    url: 'https://www.incubecareers.com',
    logo: 'https://www.incubecareers.com/logo.png',
    description: 'Live learning with industry experts. Jobs at technology companies.',
    sameAs: (s.socialLinks || []).map((x) => x.href).filter((h) => h && h.startsWith('http')),
  }

  return (
    <div className="min-h-screen bg-brand-dark-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      <SiteNavbar links={s.navbarLinks} />

      <main>
        {/* Hero Section - Dark NextLeap Style */}
        <section className="relative overflow-hidden bg-brand-dark-bg px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          {/* Gradient orbs */}
          <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-brand-accent/20 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
          
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-dark-border bg-brand-dark-surface/50 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-brand-accent" />
                <span className="text-sm font-semibold text-brand-accent">Bangalore-Based · Live Online Training</span>
              </div>
              
              <h1 className="mb-6 font-heading text-5xl font-black leading-[1.1] tracking-tight text-brand-dark-text sm:text-6xl lg:text-7xl">
                Accelerate Your Career With{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-brand-accent via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                    Industry-Ready Skills
                  </span>
                </span>
              </h1>
              
              <p className="mx-auto mb-10 max-w-2xl text-lg text-brand-dark-textSecondary sm:text-xl">
                Online career training in HR, Business Analysis, Finance & Accounting — built on live learning, practical skills, and real placement assistance.
              </p>
              
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <SignInCta
                  label="Start learning free"
                  authedLabel="Go to dashboard"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand-accent/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-brand-accent/50"
                />
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-dark-border bg-brand-dark-surface/50 px-8 py-4 text-lg font-bold text-brand-dark-text backdrop-blur-sm transition-all hover:bg-brand-dark-surface"
                >
                  Explore courses
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>

              {/* Social Proof */}
              <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-brand-dark-textSecondary">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full border-2 border-brand-dark-bg bg-gradient-to-br from-purple-500 to-pink-600" />
                    <div className="h-8 w-8 rounded-full border-2 border-brand-dark-bg bg-gradient-to-br from-blue-500 to-cyan-600" />
                    <div className="h-8 w-8 rounded-full border-2 border-brand-dark-bg bg-gradient-to-br from-green-500 to-emerald-600" />
                  </div>
                  <span className="font-medium text-brand-dark-text">5,000+ learners</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                  <span className="font-medium text-brand-dark-text">4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-brand-dark-border bg-brand-dark-surface/30 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { value: '5k+', label: 'Career transitions', icon: Users },
                { value: '100+', label: 'Live sessions', icon: Video },
                { value: '95%', label: 'Job placement', icon: Award },
                { value: '24/7', label: 'Support', icon: Clock },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} className="text-center">
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="font-heading text-3xl font-bold text-brand-dark-text">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-sm text-brand-dark-textSecondary">
                      {stat.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Career Programs Section */}
        <section className="bg-brand-dark-bg px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-heading text-4xl font-black text-brand-dark-text sm:text-5xl">
                Which Career Path Is Right for You?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-brand-dark-textSecondary">
                Whether you&apos;re a student, graduate, working professional, or switching careers — choose a program built around real workplace skills.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <CareerProgramCard key={course._id} course={course} initialAuthenticated={isAuthenticated} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-brand-dark-textSecondary">No courses available at the moment. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Placement Support Section */}
        <section className="bg-brand-dark-bg px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <h2 className="mb-4 font-heading text-4xl font-black text-brand-dark-text sm:text-5xl">
                1 Year Placement Support to Get Your Dream Job
              </h2>
              <p className="max-w-3xl text-lg text-brand-dark-textSecondary">
                Clear the cut-off marks in your graduation project to get access to 1 year placement support.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {[
                {
                  icon: (
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                  title: 'Resume review',
                  description: 'Perfect your resume with detailed feedback from mentors to make sure you don\'t miss out on getting shortlisted for your dream role.',
                },
                {
                  icon: (
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                  title: '1:1 mock interviews with mentors',
                  description: 'Crack interviews at top tech companies by practising your interviewing skills with industry professionals.',
                },
                {
                  icon: (
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: 'Practice real world interview questions',
                  description: 'Practise from our database of real world interview questions and get ready to tackle any challenge that comes your way.',
                },
                {
                  icon: (
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: 'Interviews with hiring partners',
                  description: 'Get access to interviews with top technology companies.',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="mb-2 font-heading text-xl font-bold text-brand-dark-text">
                      {item.title}
                    </h3>
                    <p className="text-brand-dark-textSecondary">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Network Section */}
        <section className="relative overflow-hidden bg-brand-dark-bg px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          {/* Background Image */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'url(https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark-bg/80 via-brand-dark-bg/60 to-brand-dark-bg/80" />
          
          <div className="relative mx-auto max-w-7xl text-center">
            <h2 className="mb-16 font-heading text-4xl font-black text-brand-dark-text sm:text-5xl">
              Join our rapidly growing learning network
            </h2>

            <div className="grid gap-12 md:grid-cols-3">
              <div>
                <div className="mb-4 font-heading text-6xl font-black text-brand-dark-text sm:text-7xl">
                  26
                </div>
                <p className="text-xl font-semibold text-brand-dark-text">
                  Countries
                </p>
              </div>
              
              <div>
                <div className="mb-4 font-heading text-6xl font-black text-brand-dark-text sm:text-7xl">
                  1000+
                </div>
                <p className="text-xl font-semibold text-brand-dark-text">
                  Companies
                </p>
              </div>
              
              <div>
                <div className="mb-4 font-heading text-6xl font-black text-brand-dark-text sm:text-7xl">
                  15000+
                </div>
                <p className="text-xl font-semibold text-brand-dark-text">
                  Learners
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hire from Us Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-accent via-orange-600 to-yellow-600 px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around">
              {/* Decorative shapes */}
              <div className="h-32 w-32 rounded-t-full bg-white" />
              <div className="h-24 w-24 -translate-y-8 rounded-t-full bg-white" />
              <div className="h-40 w-40 rounded-t-full bg-white" />
              <div className="h-28 w-28 -translate-y-4 rounded-t-full bg-white" />
              <div className="h-36 w-36 rounded-t-full bg-white" />
              <div className="h-24 w-24 -translate-y-8 rounded-t-full bg-white" />
              <div className="h-32 w-32 rounded-t-full bg-white" />
            </div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-orange-600/20" />
          
          <div className="relative mx-auto max-w-7xl text-center">
            <h2 className="mb-4 font-heading text-4xl font-black text-white sm:text-5xl">
              Hire from us
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/95">
              Become a partner companies and be first in line to the amazing talent that graduates from our cohorts
            </p>
            
            <button className="rounded-xl bg-black px-8 py-4 font-bold text-white shadow-xl transition hover:bg-gray-900 hover:scale-105">
              Get in touch
            </button>
          </div>
        </section>

      </main>

      <SiteFooter
        about={s.footerAbout}
        columns={s.footerColumns}
        socials={s.socialLinks}
        footerText={s.footerText}
      />
    </div>
  )
}
