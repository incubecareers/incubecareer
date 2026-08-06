import mongoose from 'mongoose'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables manually
let MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  try {
    const envFile = readFileSync(join(__dirname, '../.env.local'), 'utf-8')
    const mongoLine = envFile.split('\n').find(line => line.startsWith('MONGODB_URI='))
    if (mongoLine) {
      MONGODB_URI = mongoLine.split('=')[1].trim()
    }
  } catch (error) {
    console.error('Could not read .env.local file')
  }
}

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

// Define schemas
const ExamSubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true })

const ExamTopicSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamSubject', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true })

const ExamSubject = mongoose.models.ExamSubject || mongoose.model('ExamSubject', ExamSubjectSchema)
const ExamTopic = mongoose.models.ExamTopic || mongoose.model('ExamTopic', ExamTopicSchema)

// Subject and topic data
const subjectsData = [
  {
    name: '8th Grade',
    description: 'Questions for 8th standard students',
    icon: '🎒',
    order: 1,
    topics: [
      'Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Sanskrit'
    ]
  },
  {
    name: '9th Grade',
    description: 'Questions for 9th standard students',
    icon: '📚',
    order: 2,
    topics: [
      'Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Sanskrit'
    ]
  },
  {
    name: '10th Grade',
    description: 'Questions for 10th standard students (Board Exams)',
    icon: '🎓',
    order: 3,
    topics: [
      'Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Sanskrit'
    ]
  },
  {
    name: '11th Grade',
    description: 'Questions for 11th standard students',
    icon: '📖',
    order: 4,
    topics: [
      'Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'
    ]
  },
  {
    name: '12th Grade',
    description: 'Questions for 12th standard students (Board Exams)',
    icon: '🎯',
    order: 5,
    topics: [
      'Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'
    ]
  },
  {
    name: 'NEET',
    description: 'National Eligibility cum Entrance Test for Medical',
    icon: '🩺',
    order: 6,
    topics: [
      'Physics', 'Chemistry', 'Biology (Botany)', 'Biology (Zoology)', 'General Knowledge'
    ]
  },
  {
    name: 'CET',
    description: 'Common Entrance Test',
    icon: '🏆',
    order: 7,
    topics: [
      'Physics', 'Chemistry', 'Mathematics', 'Biology', 'General Aptitude'
    ]
  },
  {
    name: 'JEE Main',
    description: 'Joint Entrance Examination for Engineering',
    icon: '⚙️',
    order: 8,
    topics: [
      'Physics', 'Chemistry', 'Mathematics'
    ]
  },
  {
    name: 'JEE Advanced',
    description: 'Advanced level JEE for IITs',
    icon: '🔬',
    order: 9,
    topics: [
      'Physics', 'Chemistry', 'Mathematics'
    ]
  }
]

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    console.log('🗑️  Clearing existing exam subjects and topics...')
    await ExamTopic.deleteMany({})
    await ExamSubject.deleteMany({})
    console.log('✅ Cleared existing data')

    // Create subjects and topics
    console.log('📝 Creating subjects and topics...')
    
    for (const subjectData of subjectsData) {
      const { topics, ...subjectInfo } = subjectData
      
      // Create subject
      const subject = await ExamSubject.create(subjectInfo)
      console.log(`✅ Created subject: ${subject.name}`)
      
      // Create topics for this subject
      for (let i = 0; i < topics.length; i++) {
        await ExamTopic.create({
          subjectId: subject._id,
          name: topics[i],
          order: i + 1,
          status: 'active'
        })
      }
      console.log(`   ✅ Created ${topics.length} topics for ${subject.name}`)
    }

    // Display summary
    const totalSubjects = await ExamSubject.countDocuments()
    const totalTopics = await ExamTopic.countDocuments()
    
    console.log('\n🎉 Seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - ${totalSubjects} subjects created`)
    console.log(`   - ${totalTopics} topics created`)
    console.log('\n✨ Your exam system is ready to use!')
    console.log('   Go to /admin/exams/subjects to see the subjects')
    console.log('   Go to /admin/exams/questions to start adding questions')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await mongoose.connection.close()
    console.log('\n👋 Database connection closed')
  }
}

// Run the seeding
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
