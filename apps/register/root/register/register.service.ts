import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CacheUser } from './register.entity'
import { Repository } from 'typeorm'
import { CreateUserDto } from './dtos/create-user.dto'
import { randomUUID } from 'crypto'
import { hash } from 'bcrypt'

type urlId = string

@Injectable()
export class RegisterService {
    constructor(
        @InjectRepository(CacheUser)
        private readonly userRepository: Repository<CacheUser>,
    ) {}

    async createInCacheUser(
        createUserDto: CreateUserDto,
    ): Promise<{ url: urlId }> {
        let url = this.generateIdUrl()
        let createdUser = this.userRepository.create({ ...createUserDto, url })
        this.userRepository.insert(createdUser)
        return { url: url }
    }

    private generateIdUrl(): urlId {
        return randomUUID()
    }
}
