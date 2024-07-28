import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { POSTGRES_NAME } from '~constants/names_db.constant'
import { User, UserInfo } from '~entities/pg/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { Repository } from 'typeorm'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
    private readonly relations: string[]

    constructor(
        @InjectRepository(User, POSTGRES_NAME)
        private readonly userEntity: Repository<User>,
        @InjectRepository(UserInfo, POSTGRES_NAME)
        private readonly userInfo: Repository<UserInfo>,
    ) {}

    async create(createUserDto: CreateUserDto) {
        let newUserInfo = this.userInfo.create({
            birthdayDate: createUserDto.birthdayDate,
            gender: createUserDto.gender,
        })
        await this.userInfo.insert(newUserInfo)
        let newUser = this.userEntity.create({
            username: createUserDto.username,
            name: createUserDto.name,
            password: createUserDto.password,
            info: newUserInfo,
        })
        this.userEntity.insert(newUser)
        return newUser
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        let foundedUser = await this.userEntity.findOne({
            where: { id },
            relations: { info: true },
        })
        let [idInfo, newInfo] = [foundedUser.info.id, updateUserDto.info]
        delete updateUserDto.info
        this.userEntity.update(id, this.userEntity.create(updateUserDto))
        this.userInfo.update(idInfo, this.userInfo.create(newInfo))
        return foundedUser
    }

    async delete(id: string) {
        // return this.userEntity.remove(await this.userEntity.findBy({ id }))
        return this.userEntity.delete({ id })
    }
}
