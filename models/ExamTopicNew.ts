import mongoose from 'mongoose'

// Topics within a chapter (4th level: Grade → Subject → Chapter → Topic)
const ExamTopicNewSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamChapter',
      required: true,
      index: true,
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
  { timestamps: true }
)

export default (mongoose.models.ExamTopicNew ||
  mongoose.model('ExamTopicNew', ExamTopicNewSchema)) as mongoose.Model<any>
