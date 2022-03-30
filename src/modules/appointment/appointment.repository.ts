import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { paginateResponse } from '../../shared/utils/pagination-response/pagination-response';
import { PaginationParams } from '../../shared/utils/types/pagination.params';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';

export class AppointmentRepository {
  constructor(@InjectModel('appointments') private readonly appointmentModel: Model<Appointment>) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    return await new this.appointmentModel(createAppointmentDto).save();
  }

  async findByCondition(condition: any): Promise<Appointment[]> {
    return await this.appointmentModel.find(condition);
  }

  async findAll(userId: string, { page = 1, limit = 10 }: PaginationParams) {
    const result = await this.appointmentModel
      .find({ customerId: userId }, {}, { skip: (page - 1) * limit, limit: limit })
      .populate({ path: 'customerId', select: 'name phone' })
      .populate({ path: 'providerId', select: 'name phone' });

    const count = await this.appointmentModel.countDocuments({ customerId: userId });

    return paginateResponse([count, result], page, limit);
  }

  async findOne(id: string, userId: string): Promise<Appointment> {
    return await this.appointmentModel.findOne({ _id: id, customerId: userId });
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    return await this.appointmentModel.findOneAndUpdate({ _id: id }, updateAppointmentDto, { new: true });
  }

  async remove(id: string): Promise<void> {
    return await this.appointmentModel.findOneAndDelete({ _id: id });
  }
}
