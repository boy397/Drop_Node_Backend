import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  parentCategory?: any;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [32, 'Category name cannot exceed 32 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Category = model<ICategory>('Category', CategorySchema);
export default Category;
