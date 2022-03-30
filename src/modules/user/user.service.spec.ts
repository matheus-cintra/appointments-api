import { Test, TestingModule } from '@nestjs/testing';
import { PaginationParams } from 'src/shared/utils/types/pagination.params';
import { UserTypeEnum } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

const mockUserRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByCondition: jest.fn(),
  create: jest.fn().mockImplementationOnce(async () => Promise.resolve({ id: 'id', ...mockUserDto })),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUserDto = {
  name: 'User Test',
  email: 'user@test.com',
  password: 'hashed_password',
  active: true,
  userType: UserTypeEnum.USER,
  document: '99999999',
  phone: '19999999999',
};

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should success create a user', async () => {
    mockUserRepository.findByCondition.mockResolvedValue([]);
    const user = await service.create(mockUserDto);

    expect(user).toEqual({ id: 'id', ...mockUserDto });
  });

  it('should throw new error in create if user already exists', async () => {
    mockUserRepository.findByCondition.mockReturnValue(Promise.resolve([{ id: 'id', ...mockUserDto }]));

    expect(mockUserRepository.findByCondition).toHaveBeenCalledWith({ email: mockUserDto.email });
    await expect(service.create(mockUserDto)).rejects.toThrowError('User already exists');
  });

  it('should get a list of user with pagination', async () => {
    const data = [
      { id: '1', mockUserDto },
      { id: '2', mockUserDto },
    ];

    const paginate: PaginationParams = {
      page: 1,
      limit: 10,
    };
    mockUserRepository.findAll.mockReturnValueOnce(data);
    const response = await service.findAll({}, paginate);
    expect(response).toHaveLength(2);
    expect(response).toEqual(data);
  });

  it('should get a list of user', async () => {
    const data = [
      { id: '1', mockUserDto },
      { id: '2', mockUserDto },
    ];

    mockUserRepository.findAll.mockReturnValueOnce(data);
    const response = await service.findAll();
    expect(response).toHaveLength(2);
    expect(response).toEqual(data);
  });

  it('should find user by id', async () => {
    mockUserRepository.findById.mockReturnValueOnce(Promise.resolve({ id: 'id1', ...mockUserDto }));

    const response = await service.findOne('id1');
    expect(response).toEqual({ id: 'id1', ...mockUserDto });
  });

  it('should update user successfully', async () => {
    const updatedUser = {
      ...mockUserDto,
    };

    delete updatedUser.password;

    mockUserRepository.findById.mockReturnValueOnce(Promise.resolve({ id: 'id1', ...mockUserDto }));
    mockUserRepository.update.mockReturnValueOnce(Promise.resolve({ id: 'id1', ...updatedUser }));
    const response = await service.update('id1', mockUserDto);
    expect(response).toEqual({ id: 'id1', ...mockUserDto });
    expect(mockUserRepository.findById).toHaveBeenCalledWith('id1');
  });

  it('should throw if user not found on update', async () => {
    mockUserRepository.findById.mockReturnValueOnce(Promise.resolve(null));

    await expect(service.update('id1', mockUserDto)).rejects.toThrowError('User not found');
  });

  it('should remove a user', async () => {
    mockUserRepository.findById.mockReturnValueOnce(Promise.resolve({ id: 'id1', ...mockUserDto }));
    mockUserRepository.remove.mockReturnValueOnce(Promise.resolve({ id: 'id1', ...mockUserDto }));
    const response = await service.remove('id1');
    expect(response).toEqual(undefined);
    expect(mockUserRepository.findById).toHaveBeenCalledWith('id1');
  });

  it('should throw if user not found on delete', async () => {
    mockUserRepository.findById.mockReturnValueOnce(Promise.resolve(null));

    await expect(service.remove('id1')).rejects.toThrowError('User not found');
  });
});
