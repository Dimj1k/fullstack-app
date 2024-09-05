import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { ClientGrpc } from '@nestjs/microservices'
import { RegisterController } from '../shared/interfaces'
import { Metadata } from '@grpc/grpc-js'
import { RegisterCode } from './dto'
import { lastValueFrom, take } from 'rxjs'
import { UserFromMongo } from '../user'
import { User, UserInfo } from '../shared/entities/user'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

@Injectable()
export class RegistrService implements OnModuleInit {
    private registerService: RegisterController

    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserInfo)
        private readonly userInfoRepository: Repository<UserInfo>,
        @Inject('MONGO_DB_MICROSERVICE') private readonly client: ClientGrpc,
    ) {}

    onModuleInit() {
        this.registerService =
            this.client.getService<RegisterController>('RegisterController')
    }

    async createInCacheUser(createUserDto: CreateUserDto, metadata?: Metadata) {
        return lastValueFrom(
            this.registerService.createInCacheUser(createUserDto).pipe(take(1)),
        )
    }

    async returnByCodeUser(code: RegisterCode) {
        return lastValueFrom(
            this.registerService.returnByTokenUser(code).pipe(take(1)),
        )
    }

    async createUserInSql(user: UserFromMongo) {
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
}
