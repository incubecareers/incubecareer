'use client'

import { useState, useMemo } from 'react'
import CourseCard from '@/components/CourseCard'
import { BookOpen, ChevronDown } from 'lucide-react'

// Category-aware catalog: renders filter tabs and the filtered course grid.
// A course matches a category by its linked categoryId (preferred) or, for
// not-yet-migrated rows, by its denormalized category name.
export default function CourseCatalog({ courses = [], categories = [] }) {
  const [active, setActive] = useState('all')

  const counts = useMemo(() => {
    const map = { all: courses.length }
    for (const cat of categories) {
      map[cat._id] = courses.filter(
        (c) => 
          c.categoryId === cat._id || 
          c.category === cat.name ||
          (c.categoryIds && Array.isArray(c.categoryIds) && c.categoryIds.includes(cat._id))
      ).length
    }
    return map
  }, [courses, categories])

  const filtered = useMemo(() => {
    if (active === 'all') return courses
    const cat = categories.find((c) => c._id === active)
    if (!cat) return courses
    return courses.filter(
      (c) => 
        c.categoryId === cat._id || 
        c.category === cat.name ||
        (c.categoryIds && Array.isArray(c.categoryIds) && c.categoryIds.includes(cat._id))
    )
  }, [active, courses, categories])

  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const activeCategoryName = useMemo(() => {
    if (active === 'all') return 'All Categories'
    const cat = categories.find((c) => c._id === active)
    return cat ? cat.name : 'All Categories'
  }, [active, categories])

  return (
    <div>
      {categories.length > 0 && (
        <div className="mb-8 relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="inline-flex items-center justify-between gap-3 rounded-xl border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-textPrimary shadow-sm transition hover:bg-brand-surface min-w-[240px]"
          >
            <span>
              {activeCategoryName}
              <span className="ml-2 text-brand-textSecondary">({active === 'all' ? counts.all : counts[active] || 0})</span>
            </span>
            <ChevronDown className={`h-4 w-4 text-brand-textSecondary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownOpen(false)}
              />
              
              {/* Dropdown menu */}
              <div className="absolute left-0 top-full z-40 mt-2 w-full min-w-[240px] max-w-md rounded-xl border border-brand-border bg-white shadow-lg overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setActive('all')
                      setDropdownOpen(false)
                    }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition hover:bg-brand-surface ${
                      active === 'all' ? 'bg-brand-accentLight text-brand-accent' : 'text-brand-textPrimary'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-xs text-brand-textSecondary">({counts.all})</span>
                  </button>
                  
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => {
                        setActive(cat._id)
                        setDropdownOpen(false)
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition hover:bg-brand-surface ${
                        active === cat._id ? 'bg-brand-accentLight text-brand-accent' : 'text-brand-textPrimary'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-brand-textSecondary">({counts[cat._id] || 0})</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-brand-border bg-white p-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accentLight text-brand-accent">
            <BookOpen className="h-7 w-7" />
          </span>
          <p className="text-lg font-semibold text-brand-textPrimary">
            No courses in this category yet
          </p>
          <p className="max-w-sm text-sm text-brand-textSecondary">
            Try another category — new courses are added regularly.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
        </div>
      )}
    </div>
  )
}
