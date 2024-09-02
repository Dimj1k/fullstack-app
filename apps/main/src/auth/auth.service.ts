import {
    HttpException,
    Inject,
    Injectable,
    OnModuleInit,
    UnauthorizedException,
} from '@nestjs/common'
import { User } from '../shared/entities/user'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { ClientGrpc, RpcException } from '@nestjs/microservices'
import { AuthDto } from './dto'
import { JwtController, JwtPayload, Tokens } from '../shared/interfaces'
import { Metadata } from '@grpc/grpc-js'
import { comparePasswords } from '../shared/utils'
import { catchError, lastValueFrom, take, throwError, timeout } from 'rxjs'

@Injectable()
export class AuthService implements OnModuleInit {
    private jwtService: JwtController

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @Inject('MONGO_DB_MICROSERVICE') private readonly client: ClientGrpc,
    ) {}

    onModuleInit() {
        this.jwtService =
            this.client.getService<JwtController>('AuthController')
    }

    async login({ email, password }: AuthDto, userAgent: string) {
        let user = await this.userRepository.findOne({
            where: { email },
        })
        if (!user || !(await comparePasswords(password, user.password))) {
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
        let user = await this.userRepository
            .findOneOrFail({
                where: { id: userId.userId },
            })
            .catch((err) => {
                throw new HttpException(err, 500)
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
