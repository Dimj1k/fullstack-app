import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CacheUser } from './register.entity'
import { EntityNotFoundError, Repository } from 'typeorm'
import { CreateUserDto } from '../dtos/create-user.dto'
import { RpcException } from '@nestjs/microservices'
import { RegisterCodeDto, Code } from '../dtos/register-code.dto'

export class RegisterService {
    private token: number = 0
    constructor(
        @InjectRepository(CacheUser)
        private readonly userRepository: Repository<CacheUser>,
    ) {}

    async createInCacheUser(data: CreateUserDto): Promise<{ code: Code }> {
        let userInCreating = await this.findUserByEmail(data.email)
        if (userInCreating)
            throw new RpcException(new ConflictException('user creating'))
        let code = this.generateToken()
        let createdUser = this.userRepository.create({
            ...data,
            code,
        })
        this.userRepository.insert(createdUser)
        return { code }
    }

    async deleteByTokenUser(code: RegisterCodeDto) {
        let deletedUser = await this.userRepository.findOneBy(code)
        if (!deletedUser)
            throw new RpcException(
                new EntityNotFoundError(CacheUser, 'user not found'),
            )
        this.userRepository.delete(code)
        return deletedUser
    }

    async findUserByEmail(email: string) {
        return this.userRepository.findOneBy({ email })
    }

    private generateToken(): Code {
        if (this.token >= 984508) this.token = 0
        this.token += 3247 + Math.round(Math.random() * 12245)
        return this.token.toString().padStart(6, '0') as Code
    }
}
