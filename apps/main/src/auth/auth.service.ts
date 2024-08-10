import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common'
import { User } from '../entities/user'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import {
    Client,
    ClientGrpc,
    RpcException,
    Transport,
} from '@nestjs/microservices'
import { join } from 'path'
import { MONGO_DB_LOCATION } from '../constants'
import { AuthDto } from './dto'
import { JwtController, JwtPayload, Tokens } from '../interfaces'
import { Metadata } from '@grpc/grpc-js'
import { comparePasswords } from '../utils'
import { catchError, lastValueFrom, take, throwError, timeout } from 'rxjs'

@Injectable()
export class AuthService implements OnModuleInit {
    @Client({
        transport: Transport.GRPC,
        options: {
            url: MONGO_DB_LOCATION,
            package: 'mongo',
            protoPath: join(__dirname, 'protos', 'mongo.proto'),
        },
    })
    client: ClientGrpc

    private jwtService: JwtController

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    onModuleInit() {
        this.jwtService =
            this.client.getService<JwtController>('AuthController')
    }

    async login(dto: AuthDto, userAgent: string) {
        let user = await this.userRepository.findOne({
            where: { email: dto.email },
        })
        if (!user || !(await comparePasswords(dto.password, user.password))) {
            throw new UnauthorizedException('incorrect login or password')
        }
        let metadata = new Metadata()
        metadata.set('client-user-agent', userAgent)
        return await lastValueFrom(
            this.jwtService
                .createTokens(
                    {
                        email: user.email,
                        userId: user.id,
                        roles: user.role,
                    },
                    metadata,
                )
                .pipe(
                    take(1),
                    catchError((err) =>
                        throwError(() => new RpcException(err)),
                    ),
                ),
        )
    }

    async refreshTokens(
        refreshToken: Tokens['refreshToken']['token'],
        userAgent: string,
    ) {
        let userId = await lastValueFrom(
            this.jwtService.checkToken({ token: refreshToken }).pipe(
                take(1),
                catchError((err) => throwError(() => new RpcException(err))),
            ),
        )
        let user = await this.userRepository.findOne({
            where: { id: userId.userId },
        })
        let jwtPayload: JwtPayload = {
            email: user.email,
            roles: user.role,
            userId: user.id,
        }
        let metadata = new Metadata()
        metadata.set('client-user-agent', userAgent)
        return lastValueFrom(
            this.jwtService
                .refreshTokens({ token: refreshToken, ...jwtPayload }, metadata)
                .pipe(
                    take(1),
                    catchError((err) =>
                        throwError(() => new RpcException(err)),
                    ),
                ),
        )
    }

    async deleteTokens(refreshToken: Tokens['refreshToken']['token']) {
        return lastValueFrom(
            this.jwtService.deleteTokens({ token: refreshToken }).pipe(
                take(1),
                catchError((err) => throwError(() => new RpcException(err))),
            ),
        )
    }
}
