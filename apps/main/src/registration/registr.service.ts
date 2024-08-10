import { Injectable, OnModuleInit } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import {
    Client,
    ClientGrpc,
    RpcException,
    Transport,
} from '@nestjs/microservices'
import { RegisterController } from '../interfaces'
import { join } from 'path'
import { Metadata } from '@grpc/grpc-js'
import { RegisterCode } from './dto'
import { MONGO_DB_LOCATION } from '../constants'
import { catchError, lastValueFrom, take, throwError, timeout } from 'rxjs'
import { UserFromMongo } from '../user'
import { User, UserInfo } from '../entities/user'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

@Injectable()
export class RegistrService implements OnModuleInit {
    private registerService: RegisterController
    @Client({
        transport: Transport.GRPC,
        options: {
            url: MONGO_DB_LOCATION,
            package: 'mongo',
            protoPath: join(
                __dirname,
                __dirname.includes('registration') ? '..' : '.',
                'protos',
                'mongo.proto',
            ),
        },
    })
    client: ClientGrpc

    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserInfo)
        private readonly userInfoRepository: Repository<UserInfo>,
    ) {}

    onModuleInit() {
        this.registerService =
            this.client.getService<RegisterController>('RegisterController')
    }

    async createInCacheUser(createUserDto: CreateUserDto, metadata?: Metadata) {
        return lastValueFrom(
            this.registerService.createInCacheUser(createUserDto).pipe(
                take(1),
                catchError((error) =>
                    throwError(() => new RpcException(error.response)),
                ),
            ),
        )
    }

    async returnByTokenUser(token: RegisterCode) {
        return lastValueFrom(
            this.registerService.returnByTokenUser(token).pipe(
                take(1),
                catchError((error) =>
                    throwError(() => new RpcException(error.response)),
                ),
            ),
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
