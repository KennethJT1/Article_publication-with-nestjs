import { UserType } from 'src1/user/types/user.types';

export type ProfileType = UserType & { following: boolean };
