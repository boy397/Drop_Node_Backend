import { Schema, model, Document } from 'mongoose';

export interface IDeal extends Document {
  name: string;
  description: string;
  discountPercentage: number;
  startTime: Date;
  endTime: Date;
  products: any[];
  isActive: boolean;
  isCurrentlyActive(): boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    name: {
      type: String,
      required: [true, 'Deal name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Deal description is required'],
      trim: true,
    },
    discountPercentage: {
      type: Number,
      required: [true, 'Discount percentage is required'],
      min: [1, 'Discount percentage must be at least 1%'],
      max: [99, 'Discount percentage cannot exceed 99%'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

DealSchema.methods.isCurrentlyActive = function (): boolean {
  if (!this.isActive) return false;
  const now = new Date();
  return now >= this.startTime && now <= this.endTime;
};

export const Deal = model<IDeal>('Deal', DealSchema);
export default Deal;
