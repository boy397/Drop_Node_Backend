import { cmsRepository, CMSRepository } from '../repositories/cms.repository';
import { ICMSPage } from '../models/cms.model';
import { BadRequestError, NotFoundError } from '@shared/errors/app-error';

export class CMSService {
  private cmsRepo: CMSRepository;

  constructor(cmsRepo = cmsRepository) {
    this.cmsRepo = cmsRepo;
  }

  // Get static page by slug
  public async getPage(slug: string): Promise<ICMSPage> {
    const page = await this.cmsRepo.findBySlug(slug);
    if (!page) {
      throw new NotFoundError(`Static page "${slug}" not found`);
    }
    return page;
  }

  // Create static page (Admin)
  public async createPage(pageData: Partial<ICMSPage>): Promise<ICMSPage> {
    if (!pageData.title || !pageData.content || !pageData.section) {
      throw new BadRequestError('Page title, content, and section are required');
    }

    const slug = pageData.slug 
      ? pageData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : pageData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await this.cmsRepo.findBySlug(slug);
    if (existing) {
      throw new BadRequestError(`Static page with slug "${slug}" already exists`);
    }

    return this.cmsRepo.create({
      ...pageData,
      slug,
    });
  }

  // Update static page (Admin)
  public async updatePage(slug: string, updateData: Partial<ICMSPage>): Promise<ICMSPage> {
    const page = await this.cmsRepo.findBySlug(slug);
    if (!page) {
      throw new NotFoundError(`Static page "${slug}" not found`);
    }

    const updated = await this.cmsRepo.update(slug, updateData);
    if (!updated) {
      throw new NotFoundError(`Static page "${slug}" not found`);
    }

    return updated;
  }

  // Delete static page (Admin)
  public async deletePage(slug: string): Promise<void> {
    const page = await this.cmsRepo.findBySlug(slug);
    if (!page) {
      throw new NotFoundError(`Static page "${slug}" not found`);
    }
    await this.cmsRepo.delete(slug);
  }

  // Get all pages
  public async getAllPages(): Promise<ICMSPage[]> {
    return this.cmsRepo.findAll();
  }
}

export const cmsService = new CMSService();
export default cmsService;
