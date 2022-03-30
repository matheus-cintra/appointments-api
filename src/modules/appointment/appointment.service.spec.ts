import { Test, TestingModule } from '@nestjs/testing';
import { PaginationResponseType } from '../../shared/utils/types/pagination-response';
import { PaginationParams } from '../../shared/utils/types/pagination.params';
import { UserTypeEnum } from '../user/entities/user.entity';
import { UserRepository } from '../user/user.repository';
import { AppointmentRepository } from './appointment.repository';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

const mockAppointmentRepository = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByCondition: jest.fn(),
  create: jest.fn().mockImplementationOnce(async () => Promise.resolve({ id: 'id', ...mockAppointmentDto })),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUserRepository = {
  findById: jest.fn(),
};

const mockUserDto = {
  name: 'User Test',
  email: 'user@test.com',
  password: 'hashed_password',
  active: true,
  userType: UserTypeEnum.PROFESSIONAL,
  document: '99999999',
  phone: '19999999999',
};

const mockAppointmentDto: CreateAppointmentDto = {
  providerId: '1111111111111',
  scheduleDate: '2022-04-01 14:00',
};

describe('AppointmentService', () => {
  let service: AppointmentService;
  let repository: AppointmentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: AppointmentRepository,
          useValue: mockAppointmentRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should success create an appointment', async () => {
    mockUserRepository.findById.mockImplementationOnce(() => Promise.resolve({ id: 'id', ...mockUserDto }));
    mockAppointmentRepository.findByCondition.mockImplementationOnce(() => Promise.resolve([]));
    const appointment = await service.create('1111111111111', mockAppointmentDto);
    expect(appointment).toEqual({ id: 'id', ...mockAppointmentDto });
  });

  it('should throw if appointment is on past', async () => {
    const appointmentDate = '2022-02-01 14:00';
    await expect(service.create('1111111111111', { ...mockAppointmentDto, scheduleDate: appointmentDate })).rejects.toThrowError(
      'You can not create an appointment on a past date',
    );
  });

  it('should throw if appointment is outside opening hours', async () => {
    const appointmentDate = '2022-04-01 19:00';
    await expect(service.create('1111111111111', { ...mockAppointmentDto, scheduleDate: appointmentDate })).rejects.toThrowError(
      'You can only create appointments between 8am and 5pm',
    );
  });

  it('should throw if appointment is booked in same date', async () => {
    const appointmentDate = '2022-04-01 14:00';
    mockUserRepository.findById.mockImplementationOnce(() => Promise.resolve({ id: 'id', ...mockUserDto }));
    mockAppointmentRepository.findByCondition.mockImplementationOnce(() => Promise.resolve([{ id: 'id', ...mockAppointmentDto }]));
    await expect(service.create('1111111111111', { ...mockAppointmentDto, scheduleDate: appointmentDate })).rejects.toThrowError('This appointment is already booked');
  });

  it('should get a list of appointments', async () => {
    const data = [
      { id: 'id', ...mockAppointmentDto },
      { id: 'id2', ...mockAppointmentDto },
    ];

    const paginate: PaginationParams = {
      page: 1,
      limit: 10,
    };

    mockAppointmentRepository.findAll.mockReturnValueOnce(data);
    const response = await service.findAll(paginate, 'id');

    expect(response).toEqual(data);
    expect(response).toHaveLength(2);
  });

  it('should get a list of appointments with paginate', async () => {
    mockAppointmentRepository.findAll.mockImplementation(() => {
      const pagination: PaginationResponseType = {
        data: [mockAppointmentDto, mockAppointmentDto],
        count: 2,
        currentPage: 1,
        prevPage: null,
        nextPage: null,
        lastPage: 1,
      };
      return pagination;
    });
    const appointments = await service.findAll({ page: 1, limit: 10 }, 'id');
    expect(appointments).toHaveProperty('data');
    expect(appointments).toHaveProperty('count');
    expect(appointments).toHaveProperty('currentPage');
    expect(appointments).toHaveProperty('prevPage');
    expect(appointments).toHaveProperty('nextPage');
    expect(appointments).toHaveProperty('lastPage');
    expect(appointments.data).toHaveLength(2);
    expect(appointments.count).toBe(2);
    expect(appointments.currentPage).toBe(1);
    expect(appointments.prevPage).toBeNull();
    expect(appointments.nextPage).toBeNull();
    expect(appointments.lastPage).toBe(1);
  });

  it('should get a list of appointments without paginate', async () => {
    mockAppointmentRepository.findAll.mockImplementation(() => {
      const pagination: PaginationResponseType = {
        data: [mockAppointmentDto, mockAppointmentDto],
        count: 2,
        currentPage: 1,
        prevPage: null,
        nextPage: null,
        lastPage: 1,
      };
      return pagination;
    });
    const appointments = await service.findAll(undefined, 'id');
    expect(appointments).toHaveProperty('data');
    expect(appointments).toHaveProperty('count');
    expect(appointments).toHaveProperty('currentPage');
    expect(appointments).toHaveProperty('prevPage');
    expect(appointments).toHaveProperty('nextPage');
    expect(appointments).toHaveProperty('lastPage');
    expect(appointments.data).toHaveLength(2);
    expect(appointments.count).toBe(2);
    expect(appointments.currentPage).toBe(1);
    expect(appointments.prevPage).toBeNull();
    expect(appointments.nextPage).toBeNull();
    expect(appointments.lastPage).toBe(1);
  });

  it('should find appointment by id', async () => {
    mockAppointmentRepository.findOne.mockReturnValueOnce(Promise.resolve({ id: 'idAppointment', ...mockAppointmentDto }));

    const response = await service.findOne('idAppointment', 'idCustomer');
    expect(response).toEqual({ id: 'idAppointment', ...mockAppointmentDto });
  });

  it('should throw if find appointment by id not found', async () => {
    mockAppointmentRepository.findOne.mockReturnValueOnce(Promise.resolve(null));
    await expect(service.findOne('idAppointment', 'idCustomer')).rejects.toThrowError('Appointment with id idAppointment not found');
  });

  it('should update appointment successfully', async () => {
    mockUserRepository.findById.mockImplementationOnce(() => Promise.resolve({ id: 'id', ...mockUserDto }));
    mockAppointmentRepository.findByCondition.mockImplementationOnce(() => Promise.resolve([]));
    mockAppointmentRepository.findOne.mockImplementationOnce(() => Promise.resolve({ id: 'id1', ...mockAppointmentDto }));

    const updateAppointmentDto = {
      ...mockAppointmentDto,
      scheduleDate: '2022-04-01 14:00',
      customerId: 'idCustomer'
    };

    mockAppointmentRepository.update.mockReturnValueOnce(Promise.resolve({ id: 'id1', ...updateAppointmentDto }));
    const response = await service.update('id1', updateAppointmentDto, 'idCustomer');
    expect(response).toEqual({ id: 'id1', ...updateAppointmentDto, customerId: 'idCustomer' });
  });
});
