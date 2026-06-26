import { CMSPage, ICMSPage } from '../models/cms.model';

export class CMSRepository {
  // Find page by slug
  public async findBySlug(slug: string): Promise<ICMSPage | null> {
    return CMSPage.findOne({ slug }).exec();
  }

  // Find page by ID
  public async findById(id: string): Promise<ICMSPage | null> {
    return CMSPage.findById(id).exec();
  }

  // Create page
  public async create(pageData: Partial<ICMSPage>): Promise<ICMSPage> {
    const page = new CMSPage(pageData);
    return page.save();
  }

  // Update page
  public async update(slug: string, updateData: Partial<ICMSPage>): Promise<ICMSPage | null> {
    return CMSPage.findOneAndUpdate({ slug }, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  // Delete page
  public async delete(slug: string): Promise<ICMSPage | null> {
    return CMSPage.findOneAndDelete({ slug }).exec();
  }

  // Find all pages
  public async findAll(): Promise<ICMSPage[]> {
    return CMSPage.find({}).sort({ title: 1 }).exec();
  }
}

export const cmsRepository = new CMSRepository();
export default cmsRepository;
