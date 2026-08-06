import mongoose from 'mongoose'

// Student's attempt at a test
const ExamAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamTest',
      required: true,
      index: true,
    },
    // Start and end times
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
    timeSpent: { type: Number, default: 0 }, // in seconds
    // Answers submitted by the student
    // Format: { questionId: answer }
    // For MCQ/TrueFalse: answer is the option index or text
    // For multiple: answer is an array of selected options
    // For shortanswer/numerical: answer is the text/number
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Scoring
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    // Question-wise results for detailed analysis
    // Format: { questionId: { correct: boolean, marksObtained: number, marksTotal: number } }
    questionResults: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Status
    status: {
      type: String,
      enum: ['in-progress', 'submitted', 'evaluated'],
      default: 'in-progress',
    },
  },
  { timestamps: true }
)

// Compound index for finding user's attempts
ExamAttemptSchema.index({ userId: 1, testId: 1 })
ExamAttemptSchema.index({ status: 1, submittedAt: 1 })

export default (mongoose.models.ExamAttempt ||
  mongoose.model('ExamAttempt', ExamAttemptSchema)) as mongoose.Model<any>
