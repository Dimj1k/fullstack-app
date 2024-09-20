import { BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CacheUser } from './register.entity'
import { EntityNotFoundError, MongoRepository } from 'typeorm'
import { CreateUserDto } from '../dtos'
import { RpcException } from '@nestjs/microservices'
import { RegisterCodeDto, Code } from '../dtos'

export class RegisterService {
    private code: number = 0
    constructor(
        @InjectRepository(CacheUser)
        private readonly userRepository: MongoRepository<CacheUser>,
    ) {}

    async createInCacheUser(data: CreateUserDto): Promise<{ code: Code }> {
        let userInCreating = await this.findUserByEmail(data.email)
        if (userInCreating)
            throw new RpcException(
                new BadRequestException(
                    'Пользователь с такой электронной почтой уже создаётся',
                ),
            )
        let code = this.generateCode()
        let createdUser = this.userRepository.create({
            ...data,
            code,
        })
        this.userRepository.insertOne(createdUser)
        return { code }
    }

    async deleteByCodeUser(code: RegisterCodeDto) {
        let deletedUser = await this.userRepository.findOneAndDelete(code)
        if (!deletedUser.value || !deletedUser)
            throw new RpcException(
                new BadRequestException(
                    'Пользователь с таким кодом регистрации не найден',
                ),
            )
        return deletedUser.value ?? deletedUser
    }

    async findUserByEmail(email: string) {
        return this.userRepository.findOneBy({ email })
    }

    private generateCode(): Code {
        if (this.code > 984507) this.code = 0
        this.code += 3247 + Math.round(Math.random() * 12245)
        return this.code.toString().padStart(6, '0') as Code
    }
}
