import { Schema, model, Document } from 'mongoose';

export interface ICMSPage extends Document {
  title: string;
  slug: string;
  content: string;
  section: string;
  metaData?: Record<string, any>;
}

const CMSPageSchema = new Schema<ICMSPage>(
  {
    title: {
      type: String,
      required: [true, 'Page title is required'],
      trim: true,
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
      required: [true, 'Page content is required'],
      trim: true,
    },
    section: {
      type: String,
      required: true,
      index: true, // e.g. 'faq', 'about', 'banner', 'terms'
    },
    metaData: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const CMSPage = model<ICMSPage>('CMSPage', CMSPageSchema);
export default CMSPage;
