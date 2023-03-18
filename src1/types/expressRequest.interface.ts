import { UserEntity } from 'src1/user/user.entity';
import { Request } from 'express';

export class ExpressRequest extends Request {
  user?: UserEntity;
}
