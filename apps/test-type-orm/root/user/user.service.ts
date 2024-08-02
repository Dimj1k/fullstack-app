import {
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, FindOneOptions, Repository } from 'typeorm'
import { UpdateUserDto, UpdateUserInfoDto } from '../dto/user/update-user.dto'
import { User, UserInfo } from '../entities/user/user.entity'
import { UserFromMongo } from './user.controller'
import { UUID } from 'crypto'
import { compare } from 'bcrypt'
import { crypt } from '../utils/crypt.util'
import { PASSWORD_ONLY } from '../constants'
import { comparePasswords } from '../utils/compare-passwords.util'

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

    async updateUser(id: UUID, updateUserDto: UpdateUserDto) {
        if (Object.keys(updateUserDto).length === PASSWORD_ONLY)
            throw new HttpException('bad request', HttpStatus.BAD_REQUEST)
        let foundedUser = await this.findUser(
            { id },
            { loadRelationIds: false, relations: { info: true } },
        )
        await comparePasswords(updateUserDto.password, foundedUser.password)
        if (updateUserDto.newPassword)
            updateUserDto.password = await crypt(updateUserDto.newPassword)
        else delete updateUserDto.password
        let {
            info: updateUserInfo,
            newPassword: _,
            ...updateUser
        } = updateUserDto
        await this.dataSource.transaction(
            'SERIALIZABLE',
            async (transactionalEntityManager: EntityManager) => {
                if (updateUserInfo)
                    await transactionalEntityManager.update(
                        UserInfo,
                        foundedUser.info.id,
                        this.userInfoRepository.create(updateUserInfo),
                    )
                await transactionalEntityManager.update(
                    User,
                    id,
                    this.userRepository.create(updateUser),
                )
            },
        )
        return {
            ...foundedUser,
            ...updateUser,
            info: { ...foundedUser.info, ...updateUserInfo },
        }
    }

    async findUser(
        where: Partial<User>,
        options: Omit<FindOneOptions<User>, 'where'> = {},
    ) {
        return this.userRepository.findOne({ where: where, ...options })
    }

    async deleteById(id: UUID) {
        return this.userRepository.delete({ id })
    }
}
