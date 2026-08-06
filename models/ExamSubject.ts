import mongoose from 'mongoose'

// Subject in the Exam Question Bank (e.g., Mathematics, Physics, etc.)
const ExamSubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' }, // icon name or emoji
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
)

export default (mongoose.models.ExamSubject ||
  mongoose.model('ExamSubject', ExamSubjectSchema)) as mongoose.Model<any>
