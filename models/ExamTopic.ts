import mongoose from 'mongoose'

// Topic within a subject (e.g., Algebra under Mathematics)
const ExamTopicSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamSubject',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
)

export default (mongoose.models.ExamTopic ||
  mongoose.model('ExamTopic', ExamTopicSchema)) as mongoose.Model<any>
