import { Metadata, ServerUnaryCall } from '@grpc/grpc-js'
import {
    Injectable,
    UnauthorizedException,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { GrpcMethod, RpcException } from '@nestjs/microservices'
import { InjectRepository } from '@nestjs/typeorm'
import { randomUUID } from 'crypto'
import { addMonths } from 'date-fns'
import { Token } from './token.entity'
import { MongoRepository } from 'typeorm'
import { JwtPayload, JwtToken, Tokens } from './interfaces'
import {
    JwtPayloadDto,
    RefreshTokenDto,
    TokenWithJwtDto,
} from '../dtos/auth.dto'
import { EmailDto } from '../../../main/src/user/dto/forgot-password.dto'

@UsePipes(
    new ValidationPipe({
        whitelist: true,
        transform: true,
    }),
)
@Injectable()
export class AuthController {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(Token)
        private readonly tokenRepository: MongoRepository<Token>,
    ) {}

    @GrpcMethod('AuthController', 'createTokens')
    async createTokens(
        jwtPayload: JwtPayloadDto,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ) {
        let tokens: Tokens = await this.getPairTokens(jwtPayload)
        let token = this.tokenRepository.create({
            ...tokens.refreshToken,
            ...jwtPayload,
            userAgent: metadata.get('client-user-agent')?.[0]?.toString(),
        })
        await this.tokenRepository.insertOne(token).catch((err) => {
            throw new RpcException(err)
        })
        return tokens
    }

    @GrpcMethod('AuthController', 'checkToken')
    async checkToken(
        refreshToken: RefreshTokenDto,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ) {
        let token = await this.tokenRepository
            .findOneBy(refreshToken)
            .catch((err) => {
                throw new RpcException(err)
            })
        if (!token) throw new RpcException(new UnauthorizedException())
        return { userId: token.userId }
    }

    @GrpcMethod('AuthController', 'refreshTokens')
    async refreshTokens(
        { token: refreshToken, ...jwtPayload }: TokenWithJwtDto,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ) {
        let tokens = await this.getPairTokens(jwtPayload)
        let tokenFindBy = {
            token: refreshToken,
            userId: jwtPayload.userId,
        }
        let userAgent = metadata.get('client-user-agent')?.[0]?.toString()
        let foundedToken = await this.tokenRepository.findOneAndUpdate(
            {
                token: tokenFindBy.token,
                userId: tokenFindBy.userId,
                userAgent: userAgent,
            },
            {
                $set: {
                    token: tokens.refreshToken.token,
                    expires: tokens.refreshToken.expires,
                },
            },
        )
        if (!foundedToken) throw new RpcException(new UnauthorizedException())
        return tokens
    }

    @GrpcMethod('AuthController', 'deleteTokens')
    async deleteTokens(
        refreshToken: RefreshTokenDto,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ) {
        this.tokenRepository.deleteOne(refreshToken).catch((err) => {
            throw new RpcException(err)
        })
        return { message: 'token deleted' }
    }

    @GrpcMethod('AuthController', 'deleteAllTokens')
    async deleteAllTokens(
        email: EmailDto,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ) {
        this.tokenRepository.deleteMany(email).catch((err) => {
            throw new RpcException(err)
        })
        return { message: 'tokens deleted' }
    }

    private async getPairTokens(jwtPayload: JwtPayload) {
        let accessToken = (await this.jwtService.signAsync({
            ...jwtPayload,
        })) as JwtToken
        let refreshToken = {
            token: randomUUID(),
            expires: addMonths(new Date(), 1),
        }
        return {
            accessToken,
            refreshToken,
        }
    }
}
