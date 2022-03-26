import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { findAllWithPaginate } from '../../shared/utils/mongoose/common-querys';
import { FindAllParameters } from '../../shared/utils/types/find-all-parameters';
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

  async findOne(condition: any): Promise<User> {
    return await this.userModel.findOne(condition);
  }

  async findById(id: string): Promise<User> {
    return await this.userModel.findById(id);
  }

  async findAll({ active = 'true' }: UserSearchParams, params?: PaginationParams): Promise<PaginationResponseType> {
    const options: FindAllParameters = {
      where: {
        active: active === 'true',
      },
      paginate: {
        page: params.page,
        limit: params.limit,
      },
      sort: 'name',
    };

    return await findAllWithPaginate(this.userModel, options);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  async remove(id: string): Promise<User> {
    return await this.userModel.findByIdAndDelete(id);
  }
}
