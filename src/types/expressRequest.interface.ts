import { UserEntity } from "@app/user/user.entity";
import { Request } from "express";

export class ExpressRequest extends Request{
    user? : UserEntity
}