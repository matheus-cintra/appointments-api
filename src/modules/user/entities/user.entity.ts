export enum UserTypeEnum {
  ADMIN = 'admin',
  USER = 'user',
}

export class User {
  email: string;
  password: string;
  name: string;
  userType: UserTypeEnum;
  active: boolean;
}
