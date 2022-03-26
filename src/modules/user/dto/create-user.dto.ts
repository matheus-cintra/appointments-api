import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserTypeEnum } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({ message: 'Email must be a string' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;

  @IsOptional()
  @IsEnum(UserTypeEnum, { message: 'User type must be a valid user type' })
  userType: UserTypeEnum;

  @IsOptional()
  active: boolean;
}
