import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationResponseType } from '../../shared/utils/types/pagination-response';
import { PaginationParams } from '../../shared/utils/types/pagination.params';
import { ValidateObjectId } from '../../shared/validators/ValidateObjectId';
import { CreateUserDto } from './dto/create-user.dto';
import { UserSearchParams } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() { page, limit }: PaginationParams, @Query() options?: UserSearchParams): Promise<PaginationResponseType> {
    limit = limit > 100 ? 100 : limit;
    const pagination: PaginationParams = page && limit ? { page: Number(page), limit: Number(limit) } : { page: Number(1), limit: Number(10) };
    return await this.userService.findAll(options, pagination);
  }

  @Get(':id')
  async findOne(@Param('id', ValidateObjectId) id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ValidateObjectId) id: string, @Body() updateUserDto: UpdateUserDto): Promise<User | BadRequestException> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id', ValidateObjectId) id: string): Promise<void | BadRequestException> {
    return await this.userService.remove(id);
  }
}
