import { Test, TestingModule } from '@nestjs/testing';
import { PaginationParams } from 'src/shared/utils/types/pagination.params';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserTypeEnum } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const userArray: User[] = [];

const mockUserDto: CreateUserDto = {
  name: 'User Test',
  email: 'user@test.com',
  password: 'hashed_password',
  active: true,
  userType: UserTypeEnum.USER,
  document: '99999999',
  phone: '19999999999',
};

const mockUserService = {
  create: jest.fn().mockImplementationOnce(async () => Promise.resolve({ id: 'id', ...mockUserDto })),
  findAll: jest.fn().mockImplementationOnce(async () => Promise.resolve(userArray)),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await controller.create(mockUserDto);

    expect(user).toEqual({ id: 'id', ...mockUserDto });
  });

  it('should get a array of users using paginate', async () => {
    const paginate: PaginationParams = {
      page: 1,
      limit: 10,
    };

    const response = await controller.findAll(paginate);
    expect(response).toEqual(userArray);
  });

  it('should get an array of users, exceed pagination', async () => {
    const users = [
      { id: 'id1', ...mockUserDto },
      { id: 'id2', ...mockUserDto },
    ];

    mockUserService.findAll.mockReturnValueOnce(Promise.resolve(users));

    const paginate: PaginationParams = {
      page: 1,
      limit: 101,
    };

    const response = await controller.findAll(paginate);

    expect(response).toEqual(users);
    expect(response).toHaveLength(2);
  });

  it('should get an array of user without pagination', async () => {
    const users = [
      { id: 'id1', ...mockUserDto },
      { id: 'id2', ...mockUserDto },
    ];

    mockUserService.findAll.mockReturnValueOnce(Promise.resolve(users));

    const paginate: PaginationParams = {};

    const response = await controller.findAll(paginate);

    expect(response).toEqual(users);
    expect(response).toHaveLength(2);
  });

  it('should find user by id', async () => {
    const user = { id: 'id1', ...mockUserDto };

    mockUserService.findOne.mockReturnValueOnce(Promise.resolve(user));

    const response = await controller.findOne('id1');

    expect(response).toEqual(user);
  });

  it('should update user by id', async () => {
    const user = { id: 'id1', ...mockUserDto };

    mockUserService.update.mockReturnValueOnce(Promise.resolve(user));

    const response = await controller.update('id1', user);

    expect(response).toEqual(user);
  });

  it('should remove a user', async () => {
    mockUserService.remove.mockReturnValueOnce(Promise.resolve());
    const response = await controller.remove('id1');

    expect(response).toBeUndefined();
  });
});
