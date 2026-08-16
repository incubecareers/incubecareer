// Single source of truth for public-page content defaults. Used to seed the DB,
// as the admin editor's initial state, and as the render-time fallback — so the
// three never drift. Every field here is editable in /admin/site-settings.

export const SITE_DEFAULTS = {
  navbarLinks: [
    { label: 'Courses', href: '/courses' },
    { label: 'Learn', href: '/learn' },
    { label: 'Login', href: '/login' },
  ],

  heroBanners: [
    { title: 'Accelerate your career', subtitle: 'Live learning with industry experts. Jobs at technology companies.', imageUrl: '', bgColor: '#FE5529', textColor: '#FFFFFF', ctaText: 'Explore Courses', ctaHref: '/courses', size: 'medium', position: 1 },
    { title: 'Live Classes Every Day', subtitle: 'Learn directly from industry experts in real-time sessions.', imageUrl: '', bgColor: '#E04820', textColor: '#FFFFFF', ctaText: 'Join Live Now', ctaHref: '/learn', size: 'medium', position: 2 },
    { title: 'Career-Ready Skills', subtitle: 'Master in-demand tech skills and get job-ready with expert guidance.', imageUrl: '', bgColor: '#FE6B42', textColor: '#FFFFFF', ctaText: 'Start Learning', ctaHref: '/courses', size: 'medium', position: 3 },
    { title: 'Industry Expert Mentorship', subtitle: 'Learn from professionals working at top technology companies.', imageUrl: '', bgColor: '#D94419', textColor: '#FFFFFF', ctaText: 'Meet Mentors', ctaHref: '/login', size: 'medium', position: 4 },
    { title: 'Track Your Progress', subtitle: 'Monitor your learning journey and stay on track to reach your career goals.', imageUrl: '', bgColor: '#C93D16', textColor: '#FFFFFF', ctaText: 'View Dashboard', ctaHref: '/dashboard', size: 'medium', position: 5 },
  ],

  heroStats: [
    { value: '5k+', label: 'Career transitions' },
    { value: '100+', label: 'Live sessions' },
    { value: '95%', label: 'Job placement rate' },
  ],

  highlights: [
    { icon: 'Video', title: 'Daily Live', sub: 'Expert Sessions' },
    { icon: 'Briefcase', title: 'Tech Jobs', sub: 'Career Support' },
    { icon: 'Users', title: 'Industry', sub: 'Expert Mentors' },
  ],

  examBadge: '',
  examHeading: '',
  examSubheading: '',
  examCategories: [],

  whyBadge: '',
  whyHeading: '',
  whySubheading: '',
  featureLabels: [],

  ctaHeading: '',
  ctaSubtitle: '',
  ctaPrimaryLabel: '',
  ctaSecondaryLabel: '',
  ctaSecondaryHref: '/courses',

  coursesBadge: '',
  coursesTitle: '',
  coursesSubtitle: '',

  footerAbout: 'Live learning with industry experts. Jobs at technology companies. Accelerate your career with Incube Careers.',
  footerColumns: [
    { title: 'Explore', links: [{ label: 'Courses', href: '/courses' }, { label: 'Learn', href: '/learn' }, { label: 'Dashboard', href: '/dashboard' }] },
    { title: 'Career Tracks', links: [{ label: 'Software Development', href: '/courses' }, { label: 'Data & AI', href: '/courses' }, { label: 'Cloud & DevOps', href: '/courses' }] },
    { title: 'Company', links: [{ label: 'Sign in', href: '/login' }, { label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }] },
  ],
  socialLinks: [
    { type: 'instagram', href: 'https://www.instagram.com' },
    { type: 'linkedin', href: 'https://www.linkedin.com' },
    { type: 'youtube', href: 'https://www.youtube.com' },
    { type: 'mail', href: 'mailto:incubecareers@gmail.com' },
  ],

  footerText: '© 2026 Incube Careers. All rights reserved.',
}

export const SOCIAL_TYPES = ['instagram', 'linkedin', 'youtube', 'twitter', 'facebook', 'whatsapp', 'mail']

// Fill any missing/undefined field from defaults so older DB rows render.
// Empty strings from DB are intentional (admin cleared them) — don't overwrite.
// Empty arrays from DB fall back to defaults only for heroBanners/heroStats/highlights/footerColumns/socialLinks/navbarLinks.
const ARRAY_KEYS_WITH_DEFAULTS = ['heroBanners', 'heroStats', 'highlights', 'footerColumns', 'socialLinks', 'navbarLinks']

export function mergeSiteSettings(settings) {
  const merged = { ...SITE_DEFAULTS, ...(settings || {}) }
  for (const key of Object.keys(SITE_DEFAULTS)) {
    const val = settings?.[key]
    // Only fall back to default if truly missing/null/undefined
    if (val === undefined || val === null) {
      merged[key] = SITE_DEFAULTS[key]
      continue
    }
    // For certain arrays, fall back to defaults if empty (structural arrays)
    const isEmptyArray = Array.isArray(val) && val.length === 0
    if (isEmptyArray && ARRAY_KEYS_WITH_DEFAULTS.includes(key)) {
      merged[key] = SITE_DEFAULTS[key]
    }
  }
  return merged
}
