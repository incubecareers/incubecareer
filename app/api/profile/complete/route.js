import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/session'
import { serialize } from '@/lib/utils'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /api/profile/complete  { name, phone, email }
//
// First-time details form. Saves the student's name, mobile number and (for
// phone-OTP accounts) email, then marks the profile complete so they can browse
// courses. Google accounts keep their Google email — it's the session key, so we
// never overwrite it here.
export async function POST(req) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const body = await req.json().catch(() => ({}))

  const name = (body.name || '').trim()
  const email = (body.email || '').trim().toLowerCase()
  const digits = (body.phone || '').replace(/\D/g, '')
  const phone = digits.length >= 10 ? digits.slice(-10) : ''

  if (!name) {
    return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  }

  // Build update object - only update phone if it's different from current
  const update = { name, profileCompleted: true }
  
  // Only update phone if provided and different from current
  if (phone.length === 10 && phone !== user.phone) {
    update.phone = phone
  } else if (!user.phone && phone.length !== 10) {
    return NextResponse.json({ error: 'Enter a valid 10-digit mobile number.' }, { status: 400 })
  }

  // Only phone-OTP accounts set their email here. Google accounts are keyed on
  // the Google email, so changing it would break their session lookup.
  const isGoogleUser = Boolean(user.googleId)
  if (!isGoogleUser) {
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }
    update.email = email
  }

  try {
    // Check if email is taken by someone else (not their own record)
    if (!isGoogleUser) {
      const emailTaken = await User.findOne({ 
        email,
        _id: { $ne: user._id } // not their own record
      })
      if (emailTaken) {
        return NextResponse.json(
          { error: 'That email is already registered. Please use a different one or sign in with it.' },
          { status: 409 }
        )
      }
    }

    // Only check phone duplication if we're actually updating it
    if (update.phone) {
      const phoneTaken = await User.findOne({
        phone: update.phone,
        _id: { $ne: user._id } // not their own record
      })
      if (phoneTaken) {
        return NextResponse.json(
          { error: 'That phone number is already registered. Please use a different one.' },
          { status: 409 }
        )
      }
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: update },
      { new: true }
    ).lean()
    return NextResponse.json({ ok: true, user: serialize(updated) })
  } catch (err) {
    if (err?.code === 11000) {
      // Duplicate key error - check which field
      const field = err.message.includes('phone') ? 'phone number' : 'email'
      return NextResponse.json(
        { error: `That ${field} is already registered. Please use a different one.` },
        { status: 409 }
      )
    }
    console.error('POST /api/profile/complete error', err)
    return NextResponse.json({ error: 'Could not save your details. Please try again.' }, { status: 500 })
  }
}
