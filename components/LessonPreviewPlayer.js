'use client'

import { useState } from 'react'
import { PlayCircle, X } from 'lucide-react'
import { toEmbedUrl, isDirectVideo } from '@/lib/utils'

export default function LessonPreviewPlayer({ videoUrl, title }) {
  const [open, setOpen] = useState(false)

  if (!videoUrl) return null

  const direct = isDirectVideo(videoUrl)
  const embed = toEmbedUrl(videoUrl)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ml-auto flex items-center gap-1 rounded-full bg-brand-accent/10 px-2.5 py-1 text-xs font-medium text-brand-accent hover:bg-brand-accent/20 transition-colors"
      >
        <PlayCircle className="h-3.5 w-3.5" />
        Play
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              {direct ? (
                <video src={videoUrl} controls autoPlay controlsList="nodownload" className="h-full w-full">
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  src={embed}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              )}
            </div>
            <p className="mt-2 text-center text-sm text-white">{title}</p>
          </div>
        </div>
      )}
    </>
  )
}
