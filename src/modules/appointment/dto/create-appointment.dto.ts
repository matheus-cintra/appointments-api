import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class CreateAppointmentDto {

  @IsNotEmpty({ message: 'O campo "customerId" é obrigatório' })
  @IsString({ message: 'The customerId must be a string' })
  providerId: string;
  
  @IsNotEmpty({ message: 'O campo "scheduleDate" é obrigatório' })
  @IsString({ message: 'The scheduleDate must be a date' })
  scheduleDate: string;
}
