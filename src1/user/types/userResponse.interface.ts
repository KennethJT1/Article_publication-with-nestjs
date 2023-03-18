import { UserEntity } from "../user.entity";
import { UserType } from "./user.types";

export interface UserResponseInterface {
  // user: UserEntity & { token: string }
    
    
    //I guesed this shd be the right thing base on what he did in article
  user: UserType & { token: string };
}