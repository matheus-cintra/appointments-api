import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AppointmentModule } from './modules/appointment/appointment.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/appointments'), UserModule, AppointmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
