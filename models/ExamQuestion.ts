import mongoose from 'mongoose'

// One option for MCQ/Multiple Choice questions
const ExamOptionSchema = new mongoose.Schema(
  {
    text: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
)

// Questions in the Exam Question Bank - 3-level hierarchy
const ExamQuestionSchema = new mongoose.Schema(
  {
    // 3-Level Hierarchy: Grade → Subject → Chapter
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamGrade',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamSubjectNew',
      required: true,
      index: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamChapter',
      default: null,
      index: true,
    },
    // Question types
    // mcq = single correct answer (radio)
    // multiple = multiple correct answers (checkbox)
    // truefalse = True/False
    // shortanswer = short text answer
    // numerical = numerical answer
    type: {
      type: String,
      enum: ['mcq', 'multiple', 'truefalse', 'fillinblank', 'oneword', 'numerical', 'shortanswer', 'essay', 'matchfollowing', 'assertionreason', 'casestudy', 'comprehension', 'imagebased', 'diagrambased'],
      default: 'mcq',
    },
    questionText: { type: String, required: true },
    // For MCQ, multiple, truefalse
    options: { type: [ExamOptionSchema], default: [] },
    // For shortanswer and numerical types
    correctAnswer: { type: String, default: '' },
    // Explanation shown after answering
    explanation: { type: String, default: '' },
    // Marks for this question
    marks: { type: Number, default: 1 },
    // Difficulty level
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    // Tags for better organization and search
    tags: { type: [String], default: [] },
    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    // Usage statistics
    usageCount: { type: Number, default: 0 },
    // Created by
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
)

// Index for efficient filtering
ExamQuestionSchema.index({ gradeId: 1, subjectId: 1, chapterId: 1, status: 1 })
ExamQuestionSchema.index({ difficulty: 1, status: 1 })

export default (mongoose.models.ExamQuestion ||
  mongoose.model('ExamQuestion', ExamQuestionSchema)) as mongoose.Model<any>
