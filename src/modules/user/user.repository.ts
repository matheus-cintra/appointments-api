import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { paginateResponse } from '../../shared/utils/pagination-response/pagination-response';
import { PaginationResponseType } from '../../shared/utils/types/pagination-response';
import { PaginationParams } from '../../shared/utils/types/pagination.params';
import { CreateUserDto } from './dto/create-user.dto';
import { UserSearchParams } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

export class UserRepository {
  constructor(@InjectModel('users') private readonly userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return await new this.userModel(createUserDto).save();
  }

  async findByCondition(condition: any): Promise<User[]> {
    return await this.userModel.find(condition);
  }

  async findById(id: string): Promise<User> {
    return await this.userModel.findById(id);
  }

  async findAll({ active = 'true' }: UserSearchParams, { page = 1, limit = 10 }: PaginationParams): Promise<PaginationResponseType> {
    const result = await this.userModel.find({ active: active === 'true' }, { password: 0 }, { skip: (page - 1) * limit, limit: limit });

    const count = await this.userModel.countDocuments({ active: active === 'true' });

    return paginateResponse([count, result], page, limit);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  async remove(id: string): Promise<User> {
    return await this.userModel.findByIdAndDelete(id);
  }
}
