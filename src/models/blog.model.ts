import { Schema, model, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  image?: string;
  author: any;
  tags: string[];
  category: string;
  isPublished: boolean;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
      trim: true,
    },
    image: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Blog category is required'],
      trim: true,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Blog = model<IBlog>('Blog', BlogSchema);
export default Blog;
