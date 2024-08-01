import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from '../dto/create-user.dto'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { UpdateUserDto } from '../dto/update-user.dto'
import { GENDER, User, UserInfo } from '../entities/user/user.entity'
import { UserFromMongo as UserFromMongo } from './user.controller'

@Injectable()
export class UserService {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserInfo)
        private readonly userInfoRepository: Repository<UserInfo>,
    ) {}

    async createUser(user: UserFromMongo) {
        await this.dataSource.transaction(
            'SERIALIZABLE',
            async (transactionalEntityManager: EntityManager) => {
                let newUserInfo = this.userInfoRepository.create(user?.info)
                await transactionalEntityManager.insert(UserInfo, newUserInfo)
                let newUser = this.userRepository.create({
                    ...user,
                    info: newUserInfo,
                })
                await transactionalEntityManager.insert(User, newUser)
            },
        )
    }

    async findUser(where: Partial<User>) {
        return this.userRepository.findOneBy(where)
    }
}
