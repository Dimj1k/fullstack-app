import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CacheUser } from './register.entity'
import { EntityNotFoundError, Repository } from 'typeorm'
import { CreateUserDto } from '../dtos/create-user.dto'
import { RpcException } from '@nestjs/microservices'
import { RegisterTokenDto, Token } from '../dtos/register-token.dto'

@Injectable()
export class RegisterService {
    private token: number = 0
    constructor(
        @InjectRepository(CacheUser)
        private readonly userRepository: Repository<CacheUser>,
    ) {}

    async createInCacheUser(data: CreateUserDto): Promise<{ token: Token }> {
        let userInCreating = await this.findUserByEmail(data.email)
        if (userInCreating)
            throw new RpcException(
                new EntityNotFoundError(CacheUser, 'user creating'),
            )
        let token = this.generateToken()
        let createdUser = this.userRepository.create({
            ...data,
            token,
        })
        this.userRepository.insert(createdUser)
        return { token }
    }

    async deleteByTokenUser(token: RegisterTokenDto) {
        let deletedUser = await this.userRepository.findOneBy(token)
        if (!deletedUser)
            throw new RpcException(
                new EntityNotFoundError(CacheUser, 'user not found'),
            )
        this.userRepository.delete(token)
        return deletedUser
    }

    async findUserByEmail(email: string) {
        return this.userRepository.findOneBy({ email })
    }

    private generateToken(): Token {
        if (this.token >= 984508) this.token = 0
        this.token += 3247 + Math.round(Math.random() * 12245)
        return this.token.toString().padStart(6, '0') as Token
    }
}
