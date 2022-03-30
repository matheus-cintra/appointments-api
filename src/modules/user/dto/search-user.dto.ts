import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserSearchParams {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  crn?: string;

  @IsOptional()
  @IsString()
  active?: string;
}
