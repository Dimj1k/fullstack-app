import { ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CacheUser } from './register.entity'
import { EntityNotFoundError, MongoRepository } from 'typeorm'
import { CreateUserDto } from '../dtos/create-user.dto'
import { RpcException } from '@nestjs/microservices'
import { RegisterCodeDto, Code } from '../dtos/register-code.dto'

const NAME_TTL_INDEX_CODE = 'expiresAt'

export class RegisterService {
    private code: number = 0
    constructor(
        @InjectRepository(CacheUser)
        private readonly userRepository: MongoRepository<CacheUser>,
    ) {
        this.userRepository
            .collectionIndexExists(NAME_TTL_INDEX_CODE)
            .then((exists) => {
                if (!exists)
                    this.userRepository.createCollectionIndex('createdAt', {
                        expireAfterSeconds: 900,
                        background: true,
                        name: NAME_TTL_INDEX_CODE,
                    })
            })
    }

    async createInCacheUser(data: CreateUserDto): Promise<{ code: Code }> {
        let userInCreating = await this.findUserByEmail(data.email)
        if (userInCreating)
            throw new RpcException(new ConflictException('user creating'))
        let code = this.generateCode()
        let createdUser = this.userRepository.create({
            ...data,
            code,
        })
        this.userRepository.insertOne(createdUser)
        return { code }
    }

    async deleteByCodeUser(code: RegisterCodeDto) {
        console.log(code)
        let deletedUser = await this.userRepository.findOneAndDelete(code)
        if (!deletedUser)
            throw new RpcException(
                new EntityNotFoundError(CacheUser, 'user not found'),
            )
        return deletedUser
    }

    async findUserByEmail(email: string) {
        return this.userRepository.findOneBy({ email })
    }

    private generateCode(): Code {
        if (this.code >= 984508) this.code = 0
        this.code += 3247 + Math.round(Math.random() * 12245)
        return this.code.toString().padStart(6, '0') as Code
    }
}
