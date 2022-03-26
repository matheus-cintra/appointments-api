import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PaginationResponseType } from '../../shared/utils/types/pagination-response';
import { PaginationParams } from '../../shared/utils/types/pagination.params';
import { CreateUserDto } from './dto/create-user.dto';
import { UserSearchParams } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existUser = await this.userRepository.findOne({ email: createUserDto.email });

    if (existUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await hash(createUserDto.password, 10);

    Object.assign(createUserDto, { password: hashedPassword });

    return await this.userRepository.create(createUserDto);
  }

  async findAll(options?: UserSearchParams, pagination?: PaginationParams): Promise<PaginationResponseType> {
    if (pagination) {
      return await this.userRepository.findAll(options, pagination);
    }

    return await this.userRepository.findAll(options, undefined);
  }

  async findOne(id: string): Promise<User> {
    return await this.userRepository.findOne({ id });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | BadRequestException> {
    const user = await this.userRepository.findById(id);

    if (!user) throw new BadRequestException('User not found');

    delete updateUserDto.password;

    return await this.userRepository.update(id, updateUserDto);
  }

  async remove(id: string): Promise<void | BadRequestException> {
    const user = await this.userRepository.findById(id);

    if (!user) throw new BadRequestException('User not found');

    await this.userRepository.remove(id);
  }
}
