import mongoose, { Document, Schema } from 'mongoose';
import { StatisticsData } from '../types/models';

const StatisticsSchema = new Schema<StatisticsData & Document>(
  {
    statistics: {
      type: Object,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

StatisticsSchema.pre('save', function (next) {
  if (!this.isModified('name')) {
    next();
  }
  next();
});

export default mongoose.model('Statistics', StatisticsSchema);
