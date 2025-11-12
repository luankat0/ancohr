import { SetMetadata } from '@nestjs/common';

export const USER_TYPE_KEY = 'userType';
export const UserType = (...types: ('CANDIDATE' | 'COMPANY')[]) =>
    SetMetadata(USER_TYPE_KEY, types);