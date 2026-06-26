import { CMSPage, ICMSPage } from '../models/cms.model';

export class CMSRepository {
  public async findBySlug(slug: string): Promise<ICMSPage | null> {
    return CMSPage.findOne({ slug }).exec();
  }

  public async findById(id: string): Promise<ICMSPage | null> {
    return CMSPage.findById(id).exec();
  }

  public async create(pageData: Partial<ICMSPage>): Promise<ICMSPage> {
    const page = new CMSPage(pageData);
    return page.save();
  }

  public async update(slug: string, updateData: Partial<ICMSPage>): Promise<ICMSPage | null> {
    return CMSPage.findOneAndUpdate({ slug }, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  public async delete(slug: string): Promise<ICMSPage | null> {
    return CMSPage.findOneAndDelete({ slug }).exec();
  }

  public async findAll(): Promise<ICMSPage[]> {
    return CMSPage.find({}).sort({ title: 1 }).exec();
  }
}

export const cmsRepository = new CMSRepository();
export default cmsRepository;
