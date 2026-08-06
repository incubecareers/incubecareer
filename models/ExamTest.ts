import mongoose from 'mongoose'

// A test/exam created from the Question Bank
const ExamTestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    instructions: { type: String, default: '' },
    // Questions included in this test
    questionIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ExamQuestion' }],
      default: [],
    },
    // Test settings
    duration: { type: Number, default: 60 }, // in minutes, 0 = no limit
    totalMarks: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },
    shuffleQuestions: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: true }, // after submission
    allowReview: { type: Boolean, default: true }, // allow reviewing questions before submit
    // Access control
    isPublic: { type: Boolean, default: false }, // public tests visible to all students
    // If not public, specific users can be assigned
    assignedTo: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    // Scheduling
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    // Status
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'active', 'completed', 'archived'],
      default: 'draft',
    },
    // Created by
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Statistics
    attemptCount: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
  },
  { timestamps: true }
)

ExamTestSchema.index({ status: 1, isPublic: 1 })
ExamTestSchema.index({ createdBy: 1 })

export default (mongoose.models.ExamTest ||
  mongoose.model('ExamTest', ExamTestSchema)) as mongoose.Model<any>
