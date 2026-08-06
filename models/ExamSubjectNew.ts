import mongoose from 'mongoose'

const ExamSubjectNewSchema = new mongoose.Schema(
  {
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamGrade',
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
    icon: {
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

const ExamSubjectNew = mongoose.models.ExamSubjectNew || mongoose.model('ExamSubjectNew', ExamSubjectNewSchema)

export default ExamSubjectNew
