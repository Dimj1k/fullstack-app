import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import { Repository } from 'typeorm'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UserInfo } from '../entities/user/user.entity'

@Injectable()
export class UserService {
    private readonly relations: string[]

    constructor(
        @InjectRepository(User)
        private readonly userEntity: Repository<User>,
        @InjectRepository(UserInfo)
        private readonly userInfo: Repository<UserInfo>,
    ) {}
}
