### To migrate
1. yarn db:create ${nameOfTheMigration}
2. yarn db:migrate


### MIDDLEWARE
import { JWT_SECRET } from '@app/config';
import { ExpressRequest } from '@app/types/expressRequest.interface';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { UserService } from '../user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequest, _: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }

    const token = req.headers.authorization.split(' ')[1];
    try {
      const payload = verify(token, JWT_SECRET) as JwtPayload | string;
       console.log('payload==>', payload);
       console.log('payload==>', typeof payload);
       if (typeof payload === 'string') {
         req.user = null;
         next();
         return;
       }
      const user = await this.userService.findById(payload["id"]);
      req.user = user;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  }
}


