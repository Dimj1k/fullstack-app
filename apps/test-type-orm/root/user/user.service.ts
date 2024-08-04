import {
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, FindOneOptions, Repository } from 'typeorm'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UserInfo } from '../entities/user/user.entity'
import { UserFromMongo } from './user.controller'
import { UUID } from 'crypto'
import { crypt } from '../utils/crypt.util'
import { PASSWORD_ONLY } from '../constants'
import { comparePasswords } from '../utils/compare-passwords.util'
import { JwtGuard } from '../guards/jwt.guard'

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
        let newUser: User
        await this.dataSource.transaction(
            'SERIALIZABLE',
            async (transactionalEntityManager: EntityManager) => {
                let newUserInfo = this.userInfoRepository.create(user?.info)
                await transactionalEntityManager.insert(UserInfo, newUserInfo)
                newUser = this.userRepository.create({
                    ...user,
                    info: newUserInfo,
                })
                await transactionalEntityManager.insert(User, newUser)
            },
        )
        return newUser
    }

    @UseGuards(JwtGuard)
    async updateUser(id: UUID, updateUserDto: UpdateUserDto): Promise<void> {
        let email = updateUserDto.email
        if (email)
            if (await this.findUser({ email }))
                throw new UnauthorizedException('email is available')
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
        // let updUser: User
        // let queryRunner = this.dataSource.createQueryRunner()
        // await queryRunner.connect()
        // await queryRunner.startTransaction()
        // try {
        //     if (updateUserInfo)
        //         await queryRunner.manager.update(
        //             UserInfo,
        //             { id: foundedUser.info.id },
        //             this.userInfoRepository.create(updateUserInfo),
        //         )
        //     updUser = (
        //         await queryRunner.manager.update(
        //             User,
        //             { id: id },
        //             this.userRepository.create(updateUser),
        //         )
        //     ).raw[0]
        //     await queryRunner.commitTransaction()
        // } catch {
        //     await queryRunner.rollbackTransaction()
        // } finally {
        //     await queryRunner.release()
        // }
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
    }

    async findUser(
        where: Partial<Omit<User, 'role'>>,
        options: Omit<FindOneOptions<User>, 'where'> = {},
    ) {
        return this.userRepository.findOne({ where: where, ...options })
    }

    async deleteById(id: UUID) {
        return this.userRepository.delete({ id })
    }
}
