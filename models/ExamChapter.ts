import mongoose from 'mongoose'

const ExamChapterSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamSubjectNew',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
)

const ExamChapter = mongoose.models.ExamChapter || mongoose.model('ExamChapter', ExamChapterSchema)

export default ExamChapter
