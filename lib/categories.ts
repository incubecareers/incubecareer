// Single source of truth for the course/question-bank category taxonomy.
// Degree-based categories so students can filter by their educational background.
// The `Category` collection is seeded from this list (scripts/migrate-categories.mjs)
// and the API validates course category assignments against it.

export type CategoryKind = 'degree' | 'professional'

export interface CanonicalCategory {
  name: string
  slug: string
  kind: CategoryKind
  order: number
}

export const CATEGORIES: CanonicalCategory[] = [
  // Undergraduate degrees
  { name: 'BCA', slug: 'bca', kind: 'degree', order: 1 },
  { name: 'BBA', slug: 'bba', kind: 'degree', order: 2 },
  { name: 'BCom', slug: 'bcom', kind: 'degree', order: 3 },
  { name: 'BSc', slug: 'bsc', kind: 'degree', order: 4 },
  { name: 'BA', slug: 'ba', kind: 'degree', order: 5 },
  { name: 'BTech / BE', slug: 'btech-be', kind: 'degree', order: 6 },
  // Postgraduate degrees
  { name: 'MCA', slug: 'mca', kind: 'degree', order: 7 },
  { name: 'MBA', slug: 'mba', kind: 'degree', order: 8 },
  { name: 'MCom', slug: 'mcom', kind: 'degree', order: 9 },
  { name: 'MSc', slug: 'msc', kind: 'degree', order: 10 },
  { name: 'MA', slug: 'ma', kind: 'degree', order: 11 },
  { name: 'MTech / ME', slug: 'mtech-me', kind: 'degree', order: 12 },
  // Working professionals / career changers
  { name: 'Working Professional', slug: 'working-professional', kind: 'professional', order: 13 },
  { name: 'Career Changer', slug: 'career-changer', kind: 'professional', order: 14 },
  { name: 'Fresh Graduate', slug: 'fresh-graduate', kind: 'professional', order: 15 },
]

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name)
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug)

// Maps legacy category values to canonical names during migration.
export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  'Class 8': 'Fresh Graduate',
  'Class 9': 'Fresh Graduate',
  'Class 10': 'Fresh Graduate',
  'Class 11': 'Fresh Graduate',
  'Class 12': 'Fresh Graduate',
  '8th Standard': 'Fresh Graduate',
  '9th Standard': 'Fresh Graduate',
  '10th Standard': 'Fresh Graduate',
  '11th Standard': 'Fresh Graduate',
  '12th Standard': 'Fresh Graduate',
  NEET: 'BSc',
  CET: 'BTech / BE',
  KCET: 'BTech / BE',
  BCA: 'BCA',
  BBA: 'BBA',
  BCom: 'BCom',
  BSc: 'BSc',
  BA: 'BA',
  MCA: 'MCA',
  MBA: 'MBA',
  MCom: 'MCom',
  MSc: 'MSc',
  MA: 'MA',
}

// Resolve any incoming category string (legacy or canonical) to a canonical
// name, or null if it is unknown.
export function toCanonicalCategory(value?: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (CATEGORY_NAMES.includes(trimmed)) return trimmed
  return LEGACY_CATEGORY_MAP[trimmed] || null
}
