import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, FindOneOptions, Repository } from 'typeorm'
import { UpdateUserDto } from './dto/update-user.dto'
import { ROLE, User, UserInfo } from '../entities/user/user.entity'
import { UserFromMongo } from './user.controller'
import { UUID } from 'crypto'
import { crypt } from '../utils/crypt.util'
import { PASSWORD_ONLY } from '../constants'
import { comparePasswords } from '../utils/compare-passwords.util'
// import { JwtGuard } from '../guards/jwt.guard'

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
        let queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction('READ COMMITTED')
        try {
            let newUserInfo = this.userInfoRepository.create(user?.info)
            await queryRunner.manager.insert(UserInfo, newUserInfo)
            newUser = this.userRepository.create({
                ...user,
                info: newUserInfo,
            })
            await queryRunner.manager.insert(User, newUser)
            await queryRunner.commitTransaction()
        } catch (err) {
            await queryRunner.rollbackTransaction()
        } finally {
            await queryRunner.release()
        }
        return newUser
    }

    async updateUser(id: UUID, updateUserDto: UpdateUserDto): Promise<void> {
        let email = updateUserDto.email
        if (email)
            if (await this.findUser({ email }))
                throw new UnauthorizedException('email is available')
        if (Object.keys(updateUserDto).length === PASSWORD_ONLY)
            throw new BadRequestException()
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
        await this.dataSource
            .transaction(
                'READ COMMITTED',
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
            .catch((err) => {
                throw err
            })
    }

    async upgradeToAdmin(id: string) {
        let foundedUser = await this.findUser({ id })
        if (!foundedUser) throw new NotFoundException()
        foundedUser.role.push(ROLE.ADMIN)
        return this.userRepository.update({ id }, { role: foundedUser.role })
    }

    async dropAdmin(id: string) {
        let foundedUser = await this.findUser({ id })
        if (!foundedUser) throw new NotFoundException()
        let roles = foundedUser.role.filter((val) => val !== ROLE.ADMIN)
        return this.userRepository.update({ id }, { role: roles })
    }

    async findUser(
        where: Partial<Omit<User, 'books' | 'role'>>,
        options: Omit<FindOneOptions<User>, 'where'> = {},
    ) {
        return this.userRepository.findOne({ where: where, ...options })
    }

    async deleteById(id: UUID) {
        return this.userRepository.delete({ id })
    }
}
