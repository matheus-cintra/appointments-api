import { Test, TestingModule } from '@nestjs/testing';
import { PaginationParams } from 'src/shared/utils/types/pagination.params';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointment.entity';

const mockCustomerId = '222222222222';

const mockAppointmentArray: Appointment[] = [];

const mockAppointmentDto: CreateAppointmentDto = {
  providerId: '1111111111111',
  scheduleDate: '2022-04-01 14:00',
};

const mockAppointmentService = {
  create: jest.fn().mockImplementationOnce(async () => Promise.resolve({ id: 'id', ...mockAppointmentDto })),
  findAll: jest.fn().mockImplementationOnce(async () => Promise.resolve(mockAppointmentArray)),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('AppointmentController', () => {
  let controller: AppointmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [{ provide: AppointmentService, useValue: mockAppointmentService }],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an appointment', async () => {
    const appointment = await controller.create(mockAppointmentDto, mockCustomerId);
    expect(appointment).toEqual({ id: 'id', ...mockAppointmentDto });
  });

  it('should get a list of appointments with paginate', async () => {
    const paginate: PaginationParams = {
      page: 1,
      limit: 10,
    };

    const response = await controller.findAll(paginate, mockCustomerId);

    expect(response).toEqual(mockAppointmentArray);
  });

  it('should get a list of appointments exceed paginate', async () => {
    const appointments = [
      { id: 'id1', ...mockAppointmentDto },
      { id: 'id2', ...mockAppointmentDto },
    ];

    mockAppointmentService.findAll.mockReturnValueOnce(Promise.resolve(appointments));

    const paginate: PaginationParams = {
      page: 1,
      limit: 101,
    };

    const response = await controller.findAll(paginate, mockCustomerId);

    expect(response).toEqual(appointments);
    expect(response).toHaveLength(2);
  });

  it('shoul get a list of appointment without paginate', async () => {
    const appointments = [
      { id: 'id1', ...mockAppointmentDto },
      { id: 'id2', ...mockAppointmentDto },
    ];

    mockAppointmentService.findAll.mockReturnValueOnce(Promise.resolve(appointments));

    const paginate: PaginationParams = {};

    const response = await controller.findAll(paginate, mockCustomerId);

    expect(response).toEqual(appointments);
    expect(response).toHaveLength(2);
  });

  it('should find appointment by id', async () => {
    const appointment = { id: 'id1', ...mockAppointmentDto };

    mockAppointmentService.findOne.mockReturnValueOnce(Promise.resolve(appointment));

    const response = await controller.findOne('id1', mockCustomerId);

    expect(response).toEqual(appointment);
  });

  it('should update appoint by id', async () => {
    const appointment = { id: 'id1', ...mockAppointmentDto };

    mockAppointmentService.update.mockReturnValueOnce(Promise.resolve(appointment));

    const response = await controller.update('id1', mockCustomerId, appointment);

    expect(response).toEqual(appointment);
  });

  it('should delete an appointment', async () => {
    mockAppointmentService.remove.mockReturnValueOnce(Promise.resolve());
    const response = await controller.remove('id1', mockCustomerId);
    expect(response).toBeUndefined();
  });
});
