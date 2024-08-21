import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, FindOneOptions, Repository } from 'typeorm'
import { UpdateUserDto } from './dto'
import { User, UserInfo } from '../shared/entities/user'
import { comparePasswords } from '../shared/utils'
import { JwtPayload } from '../shared/interfaces'
import { differencesNoArray } from '../shared/utils/differences.util'
import { UUID } from 'crypto'

@Injectable()
export class UserService {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserInfo)
        private readonly userInfoRepository: Repository<UserInfo>,
    ) {}

    async updateUser(
        user: Partial<JwtPayload>,
        updateUserDto: Partial<UpdateUserDto>,
        resetPassword = false,
    ) {
        let foundedUser = await this.findUser(
            { email: user.email },
            {
                relations: { info: true },
                select: ['id', 'email', 'password', 'info'],
            },
        )
        if (!foundedUser) throw new NotFoundException()
        let isCorrectPasswords: boolean = false
        if (!resetPassword) {
            isCorrectPasswords = await comparePasswords(
                updateUserDto.password,
                foundedUser.password,
            )
            if (!isCorrectPasswords)
                throw new UnauthorizedException('Неверный пароль')
        }
        let { info: userInfoDiff, ...userDiff } = await differencesNoArray(
            (({ newPassword, ...upd }) => upd)({
                ...updateUserDto,
                password: updateUserDto.newPassword,
            }),
            { ...foundedUser, password: updateUserDto.password },
        )
        if (!Object.keys({ ...userDiff, ...userInfoDiff }).length)
            throw new BadRequestException('Вы ничего не изменяете')
        await this.dataSource.transaction(
            'READ COMMITTED',
            async (transactionalEntityManager: EntityManager) => {
                if (userInfoDiff) {
                    let updUserInfo = this.userInfoRepository.create({
                        ...foundedUser.info,
                        ...userInfoDiff,
                    })
                    await transactionalEntityManager.update(
                        UserInfo,
                        { id: foundedUser.info.id },
                        updUserInfo,
                    )
                }

                if (Object.keys(userDiff).length) {
                    let updUser = this.userRepository.create({
                        ...foundedUser,
                        ...userDiff,
                    })
                    await transactionalEntityManager.update(
                        User,
                        { id: foundedUser.id },
                        updUser,
                    )
                }
            },
        )
        return { ...userInfoDiff, ...userDiff }
    }

    async findUser(
        where: Partial<Omit<User, 'books' | 'role'>>,
        options: Omit<FindOneOptions<User>, 'where'> = {},
    ) {
        return this.userRepository.findOne({ where, ...options })
    }

    async deleteById(id: UUID) {
        return this.userRepository.delete({ id })
    }
}
