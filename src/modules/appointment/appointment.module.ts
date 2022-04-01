import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SqsModule } from '../../shared/sqs/sqs.module';
import { UserModule } from '../user/user.module';
import { AppointmentController } from './appointment.controller';
import { AppointmentRepository } from './appointment.repository';
import { AppointmentService } from './appointment.service';
import { AppointmentSchema } from './schemas/appointment.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'appointments', schema: AppointmentSchema }]), UserModule, SqsModule],
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentRepository],
  exports: [AppointmentService, AppointmentRepository],
})
export class AppointmentModule {}
