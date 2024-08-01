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
        if (Object.keys(updateUserDto).length === 1)
            throw new HttpException('bad request', HttpStatus.BAD_REQUEST)
        let foundedUser = await this.findUser({ id })
        let isPasswordCorrect = await compare(
            updateUserDto.password,
            foundedUser.password,
        )
        if (!isPasswordCorrect)
            throw new UnauthorizedException('incorrect password')
        if (updateUserDto.newPassword)
            updateUserDto.password = await crypt(updateUserDto.newPassword)
        else delete updateUserDto.password
        let {
            info: updatedUserInfo,
            newPassword: _,
            ...updatedUser
        } = updateUserDto
        await this.dataSource.transaction(
            'SERIALIZABLE',
            async (transactionalEntityManager: EntityManager) => {
                if (updatedUserInfo)
                    await transactionalEntityManager.update(
                        UserInfo,
                        foundedUser.infoId,
                        updatedUserInfo,
                    )
                if (Object.keys(updatedUser).length)
                    await transactionalEntityManager.update(
                        User,
                        id,
                        updatedUser,
                    )
            },
        )
    }

    //     export class UpdateUserInfoDto {
    //     @IsDateString()
    //     @IsOptional()
    //     birthdayDate?: Date

    //     @IsEnum(GENDER)
    //     @IsOptional()
    //     gender?: GENDER
    // }

    // export class UpdateUserDto {
    //     @IsString()
    //     @IsOptional()
    //     email?: string

    //     @IsString()
    //     password: string

    //     @IsString()
    //     @IsOptional()
    //     newPassword?: string

    //     @ValidateNested()
    //     @Type(() => UpdateUserInfoDto)
    //     info: UpdateUserInfoDto
    // }

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
