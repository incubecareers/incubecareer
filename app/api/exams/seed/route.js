

import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamSubject from '@/models/ExamSubject'
import ExamTopic from '@/models/ExamTopic'

// Subject and topic data
const subjectsData = [
  {
    name: '8th Grade',
    description: 'Questions for 8th standard students',
    icon: '🎒',
    order: 1,
    topics: ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Sanskrit']
  },
  {
    name: '9th Grade',
    description: 'Questions for 9th standard students',
    icon: '📚',
    order: 2,
    topics: ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Sanskrit']
  },
  {
    name: '10th Grade',
    description: 'Questions for 10th standard students (Board Exams)',
    icon: '🎓',
    order: 3,
    topics: ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Sanskrit']
  },
  {
    name: '11th Grade',
    description: 'Questions for 11th standard students',
    icon: '📖',
    order: 4,
    topics: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science']
  },
  {
    name: '12th Grade',
    description: 'Questions for 12th standard students (Board Exams)',
    icon: '🎯',
    order: 5,
    topics: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science']
  },
  {
    name: 'NEET',
    description: 'National Eligibility cum Entrance Test for Medical',
    icon: '🩺',
    order: 6,
    topics: ['Physics', 'Chemistry', 'Biology (Botany)', 'Biology (Zoology)', 'General Knowledge']
  },
  {
    name: 'CET',
    description: 'Common Entrance Test',
    icon: '🏆',
    order: 7,
    topics: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General Aptitude']
  },
  {
    name: 'JEE Main',
    description: 'Joint Entrance Examination for Engineering',
    icon: '⚙️',
    order: 8,
    topics: ['Physics', 'Chemistry', 'Mathematics']
  },
  {
    name: 'JEE Advanced',
    description: 'Advanced level JEE for IITs',
    icon: '🔬',
    order: 9,
    topics: ['Physics', 'Chemistry', 'Mathematics']
  }
]

// POST /api/exams/seed - Seed initial subjects and topics
export async function POST(req) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await dbConnect()

    // Check if already seeded
    const existingCount = await ExamSubject.countDocuments()
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: 'Database already contains subjects. Clear them first if you want to re-seed.',
        existingCount 
      })
    }

    const results = []

    for (const subjectData of subjectsData) {
      const { topics, ...subjectInfo } = subjectData
      
      // Create subject
      const subject = await ExamSubject.create(subjectInfo)
      
      // Create topics for this subject
      const createdTopics = []
      for (let i = 0; i < topics.length; i++) {
        const topic = await ExamTopic.create({
          subjectId: subject._id,
          name: topics[i],
          order: i + 1,
          status: 'active'
        })
        createdTopics.push(topic.name)
      }
      
      results.push({
        subject: subject.name,
        topicsCount: createdTopics.length,
        topics: createdTopics
      })
    }

    const totalSubjects = await ExamSubject.countDocuments()
    const totalTopics = await ExamTopic.countDocuments()

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      summary: {
        totalSubjects,
        totalTopics
      },
      details: results
    })

  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json({ 
      error: 'Failed to seed database',
      details: error.message 
    }, { status: 500 })
  }
}
