import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationResponseType } from '../../shared/utils/types/pagination-response';
import { ValidateObjectId } from '../../shared/validators/ValidateObjectId';
import { PaginationParams } from '../../shared/utils/types/pagination.params';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Headers('user-id') userId: string): Promise<Appointment> {
    return await this.appointmentService.create(userId, createAppointmentDto);
  }

  @Get()
  async findAll(@Query() { page, limit }: PaginationParams, @Headers('user-id') userId: string): Promise<PaginationResponseType> {
    limit = limit > 100 ? 100 : limit;
    const pagination: PaginationParams = page && limit ? { page: Number(page), limit: Number(limit) } : { page: Number(1), limit: Number(10) };
    return this.appointmentService.findAll(pagination, userId);
  }

  @Get(':id')
  async findOne(@Param('id', ValidateObjectId) id: string, @Headers('user-id') userId: string): Promise<Appointment> {
    return this.appointmentService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id', ValidateObjectId) id: string,
    @Headers('user-id') userId: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment | BadRequestException> {
    return await this.appointmentService.update(id, updateAppointmentDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ValidateObjectId) id: string, @Headers('user-id') userId: string): Promise<void | BadRequestException> {
    return this.appointmentService.remove(id, userId);
  }
}
