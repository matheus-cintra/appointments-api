export enum UserTypeEnum {
  PROFESSIONAL = 'professional',
  USER = 'user',
}

export interface IParameter {
  appoinmentTime: Date;
}

export class User {
  _id?: string;
  email: string;
  password: string;
  name: string;
  userType?: UserTypeEnum;
  document: string;
  phone: string;
  crn?: string;
  parameters?: IParameter
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
