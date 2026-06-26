import { User, IUser } from '../models/user.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class UserRepository {
  public async findByEmail(email: string, selectFields?: string): Promise<IUser | null> {
    const query = User.findOne({ email });
    if (selectFields) {
      query.select(selectFields);
    }
    return query.exec();
  }

  public async findById(id: string, selectFields?: string): Promise<IUser | null> {
    const query = User.findById(id);
    if (selectFields) {
      query.select(selectFields);
    }
    return query.exec();
  }

  public async findOne(filter: FilterQuery<IUser>, selectFields?: string): Promise<IUser | null> {
    const query = User.findOne(filter);
    if (selectFields) {
      query.select(selectFields);
    }
    return query.exec();
  }

  public async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  public async update(id: string, updateData: UpdateQuery<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  public async findAll(
    filter: FilterQuery<IUser> = {},
    skip = 0,
    limit = 10,
    sort: Record<string, any> = { createdAt: -1 }
  ): Promise<{ users: IUser[]; total: number }> {
    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      User.countDocuments(filter).exec(),
    ]);

    return { users, total };
  }

  public async delete(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id).exec();
  }
}

export const userRepository = new UserRepository();
export default userRepository;
