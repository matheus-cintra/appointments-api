import { BadRequestException, Injectable } from '@nestjs/common';
import { PaginationResponseType } from 'src/shared/utils/types/pagination-response';
import { PaginationParams } from 'src/shared/utils/types/pagination.params';
import { AppointmentRepository } from './appointment.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { startOfHour, parseISO, isBefore, getHours } from 'date-fns';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AppointmentService {
  constructor(private readonly appointmentRepository: AppointmentRepository, private readonly userRepository: UserRepository) {}

  async create(userId: string, createAppointmentDto: CreateAppointmentDto) {
    const appointmentDate = startOfHour(parseISO(createAppointmentDto.scheduleDate));

    if (isBefore(appointmentDate, new Date())) {
      throw new BadRequestException('You can not create an appointment on a past date');
    }

    if (getHours(appointmentDate) < 8 || getHours(appointmentDate) > 17) {
      throw new BadRequestException('You can only create appointments between 8am and 5pm');
    }

    const isProviderValid = await this.userRepository.findById(createAppointmentDto.providerId);

    if (!isProviderValid) throw new BadRequestException('Provider not found');

    const hasAppointmentInSameDate = await this.appointmentRepository.findByCondition({
      providerId: createAppointmentDto.providerId,
      scheduleDate: appointmentDate,
    });

    if (hasAppointmentInSameDate.length) {
      throw new BadRequestException('This appointment is already booked');
    }

    Object.assign(createAppointmentDto, { customerId: userId });

    return await this.appointmentRepository.create(createAppointmentDto);
  }

  async findAll(pagination: PaginationParams, userId: string): Promise<PaginationResponseType> {
    if (pagination) {
      return await this.appointmentRepository.findAll(userId, pagination);
    }

    return await this.appointmentRepository.findAll(userId, undefined);
  }

  async findOne(id: string, userId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne(id, userId);
    if (!appointment) {
      throw new BadRequestException(`Appointment with id ${id} not found`);
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto, userId: string): Promise<Appointment | BadRequestException> {
    const appointment = await this.appointmentRepository.findOne(id, userId);

    if (!appointment) throw new BadRequestException(`Appointment with id ${id} not found`);

    const appointmentDate = startOfHour(parseISO(updateAppointmentDto.scheduleDate));

    if (isBefore(appointmentDate, new Date())) {
      throw new BadRequestException('You can not update an appointment on a past date');
    }

    if (getHours(appointmentDate) < 8 || getHours(appointmentDate) > 17) {
      throw new BadRequestException('You can only update appointments between 8am and 5pm');
    }

    const isProviderValid = await this.userRepository.findById(updateAppointmentDto.providerId);

    if (!isProviderValid) throw new BadRequestException('Provider not found');

    const hasAppointmentInSameDate = await this.appointmentRepository.findByCondition({
      providerId: updateAppointmentDto.providerId,
      scheduleDate: appointmentDate,
    });

    if (hasAppointmentInSameDate.length) {
      throw new BadRequestException('This appointment is already booked');
    }

    Object.assign(updateAppointmentDto, { customerId: userId });
    return await this.appointmentRepository.update(id, updateAppointmentDto);
  }

  async remove(id: string, userId: string) {
    const appointment = await this.appointmentRepository.findOne(id, userId);

    if (!appointment) throw new BadRequestException(`Appointment with id ${id} not found`);

    return this.appointmentRepository.remove(id);
  }
}
