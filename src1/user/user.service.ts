import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src1/user/dto/createUser.dto';
import { UserEntity } from 'src1/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from 'src1/config';
import { LoginUserDto } from './dto/loginUser.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    // const errorResponse = {
    //   errors: {},
    // };

    // const userByEmail = await this.userRepository.findOne({
    //   where: { email: createUserDto.email },
    // });
    // const userByUsername = await this.userRepository.findOne({
    //   where: { username: createUserDto.username },
    // });

    // if (userByEmail) {
    //   errorResponse.errors['email'] = 'has already been taken';
    // }

    // if (userByUsername) {
    //   errorResponse.errors['username'] = 'has already been taken';
    // }
    // if (userByUsername || userByEmail) {
    //   throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    // }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    console.log('newUser: ', newUser);
    return await this.userRepository.save(newUser);
  }

  async findById(id: string): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { id } });
  }

  async login(loginUserDto: LoginUserDto) {
    const errorResponse = {
      errors: {
        'error or password': 'is invalid',
      },
    };
    const user = await this.userRepository.findOne(
      {
        where: { email: loginUserDto.email },
      },
      // { select: ['id', 'username', 'email', 'password', 'bio', 'image'] },
    );

    if (!user) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isPassword = await compare(loginUserDto.password, user.password);

    if (!isPassword) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    delete user.password;
    return user;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findById(userId);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '21d' },
    );
  }

  buildUserResponse(user: UserEntity): any {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }
}
