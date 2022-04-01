import { Test, TestingModule } from '@nestjs/testing';
import { SqsService } from '../../shared/sqs/sqs.service';
import { PaginationResponseType } from '../../shared/utils/types/pagination-response';
import { PaginationParams } from '../../shared/utils/types/pagination.params';
import { UserTypeEnum } from '../user/entities/user.entity';
import { UserRepository } from '../user/user.repository';
import { AppointmentRepository } from './appointment.repository';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

jest.useFakeTimers()

const mockAppointmentRepository = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByCondition: jest.fn(),
  create: jest.fn(),
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
  scheduleDate: '2022-05-01 14:00',
};

describe('AppointmentService', () => {
  let service: AppointmentService;
  let repository: AppointmentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        SqsService,
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

  afterEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should success create an appointment', async () => {
    mockUserRepository.findById.mockImplementationOnce(() => Promise.resolve({ id: 'id', ...mockUserDto }));
    mockAppointmentRepository.findByCondition.mockImplementationOnce(() => Promise.resolve([]));
    mockAppointmentRepository.create.mockImplementationOnce(async () => Promise.resolve({ id: 'id', ...mockAppointmentDto }));
    const appointment = await service.create('1111111111111', mockAppointmentDto);
    expect(appointment).toEqual({ id: 'id', ...mockAppointmentDto });
  });

  it('should throw if provider not found', async () => {
    mockUserRepository.findById.mockImplementationOnce(() => Promise.resolve(null));
    await expect(service.create('1111111111111', mockAppointmentDto)).rejects.toThrowError('Provider not found');
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
    const appointmentDate = '2022-05-01 14:00';
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

  it('should throw if appointment not found on update', async () => {
    mockAppointmentRepository.findOne.mockReturnValueOnce(Promise.resolve(null));

    const updateAppointmentDto = {
      ...mockAppointmentDto,
      scheduleDate: '2022-04-01 14:00',
      customerId: 'idCustomer',
    };

    await expect(service.update('idAppointment', updateAppointmentDto, 'idCustomer')).rejects.toThrowError('Appointment with id idAppointment not found');
  });

  it('should throw if provider not found on update', async () => {
    mockAppointmentRepository.findOne.mockReturnValueOnce(Promise.resolve({ id: 'idAppointment', ...mockAppointmentDto }));
    mockUserRepository.findById.mockImplementationOnce(() => Promise.resolve(null));
    await expect(service.update('idAppointment', mockAppointmentDto, 'idCustomer')).rejects.toThrowError('Provider not found');
  });

  it('should update appointment successfully', async () => {
    mockUserRepository.findById.mockImplementationOnce(() => Promise.resolve({ id: 'id', ...mockUserDto }));
    mockAppointmentRepository.findByCondition.mockImplementationOnce(() => Promise.resolve([]));
    mockAppointmentRepository.findOne.mockImplementationOnce(() => Promise.resolve({ id: 'id1', ...mockAppointmentDto }));

    const updateAppointmentDto = {
      ...mockAppointmentDto,
      scheduleDate: '2022-05-01 14:00',
      customerId: 'idCustomer',
    };

    mockAppointmentRepository.update.mockReturnValueOnce(Promise.resolve({ id: 'id1', ...updateAppointmentDto }));
    const response = await service.update('id1', updateAppointmentDto, 'idCustomer');
    expect(response).toEqual({ id: 'id1', ...updateAppointmentDto, customerId: 'idCustomer' });
  });

  it('should throw if appointment date is in the past on update', async () => {
    mockUserRepository.findById.mockImplementationOnce(() => Promise.resolve({ id: 'id', ...mockUserDto }));
    mockAppointmentRepository.findByCondition.mockImplementationOnce(() => Promise.resolve([]));
    mockAppointmentRepository.findOne.mockImplementationOnce(() => Promise.resolve({ id: 'id1', ...mockAppointmentDto }));

    const updateAppointmentDto = {
      ...mockAppointmentDto,
      scheduleDate: '2020-05-01 14:00',
      customerId: 'idCustomer',
    };

    await expect(service.update('id1', updateAppointmentDto, 'idCustomer')).rejects.toThrowError('You can not update an appointment on a past date');
  });

  it('should throw if appointment date is before 8 and after 17', async () => {
    mockUserRepository.findById.mockImplementationOnce(() => Promise.resolve({ id: 'id', ...mockUserDto }));
    mockAppointmentRepository.findByCondition.mockImplementationOnce(() => Promise.resolve([]));
    mockAppointmentRepository.findOne.mockImplementationOnce(() => Promise.resolve({ id: 'id1', ...mockAppointmentDto }));

    const updateAppointmentDto = {
      ...mockAppointmentDto,
      scheduleDate: '2022-04-02 07:00',
      customerId: 'idCustomer',
    };

    await expect(service.update('id1', updateAppointmentDto, 'idCustomer')).rejects.toThrowError('You can only update appointments between 8am and 5pm');
  });

  it('should throw if appointment date already booked', async () => {
    mockAppointmentRepository.findOne.mockImplementationOnce(() => Promise.resolve({ id: 'id1', ...mockAppointmentDto }));
    mockUserRepository.findById.mockImplementationOnce(() => Promise.resolve({ id: 'id', ...mockUserDto }));
    mockAppointmentRepository.findByCondition.mockImplementationOnce(() => Promise.resolve([{ id: 'id2', ...mockAppointmentDto }]));

    const updateAppointmentDto = {
      ...mockAppointmentDto,
      scheduleDate: '2022-05-01 14:00',
      customerId: 'idCustomer',
    };

    await expect(service.update('id1', updateAppointmentDto, 'idCustomer')).rejects.toThrowError('This appointment is already booked');
  });

  it('should throw if not find appointment in remove', async () => {
    mockAppointmentRepository.findOne.mockReturnValueOnce(Promise.resolve(null));
    await expect(service.remove('idAppointment', 'idCustomer')).rejects.toThrowError('Appointment with id idAppointment not found');
  });

  it('should remove an appointment with a void return', async () => {
    mockAppointmentRepository.findOne.mockReturnValueOnce(Promise.resolve({ id: 'idAppointment', ...mockAppointmentDto }));
    const response = await service.remove('idAppointment', 'idCustomer');
    expect(response).toBeUndefined();
  });
});
