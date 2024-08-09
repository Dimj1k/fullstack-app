import { Metadata, ServerUnaryCall } from '@grpc/grpc-js'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { GrpcMethod, Payload, RpcException } from '@nestjs/microservices'
import { InjectRepository } from '@nestjs/typeorm'
import { randomUUID, UUID } from 'crypto'
import { addMonths, addSeconds } from 'date-fns'
import { Token } from './token.entity'
import { MongoRepository } from 'typeorm'

export enum GENDER {
    MALE,
    FEMALE,
    UNKNOWN,
}

export enum ROLE {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

interface JwtPayload {
    userId: UUID
    email: string
    roles: ROLE[]
}

type JwtToken = `${string}.${string}.${string}`

interface Tokens {
    accessToken: JwtToken
    refreshToken: {
        token: UUID
        expires: Date
    }
}

const NAME_TTL_INDEX_TOKEN = 'expiresTokenDateTime'

@Injectable()
export class AuthController {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(Token)
        private readonly tokenRepository: MongoRepository<Token>,
    ) {}

    @GrpcMethod('AuthController', 'createTokens')
    async createTokens(
        jwtPayload: JwtPayload,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ) {
        let tokens: Tokens = await this.getPairTokens(jwtPayload)
        let token = this.tokenRepository.create({
            ...tokens.refreshToken,
            ...jwtPayload,
            userAgent: metadata.get('client-user-agent')[0].toString(),
        })
        this.tokenRepository.insertOne(token).catch((err) => {
            throw new RpcException(err)
        })
        return tokens
    }

    @GrpcMethod('AuthController', 'checkToken')
    async checkToken(
        refreshToken: { token: Tokens['refreshToken']['token'] },
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ) {
        let { userId } = await this.tokenRepository
            .findOneBy(refreshToken)
            .catch((err) => {
                throw new RpcException(err)
            })
        if (!userId) throw new RpcException(new UnauthorizedException())
        return { userId }
    }

    @GrpcMethod('AuthController', 'refreshTokens')
    async refreshTokens(
        {
            token: refreshToken,
            ...jwtPayload
        }: { token: Tokens['refreshToken']['token'] } & JwtPayload,
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ) {
        let userAgent = metadata.get('client-user-agent')[0].toString()
        let tokenFindBy = {
            token: refreshToken,
            userId: jwtPayload.userId,
        }
        let tokens = await this.getPairTokens(jwtPayload)
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
                    roles: jwtPayload.roles,
                },
            },
        )
        if (!foundedToken) throw new RpcException(new UnauthorizedException())
        return tokens
    }

    @GrpcMethod('AuthController', 'deleteTokens')
    async deleteTokens(
        refreshToken: { token: Tokens['refreshToken']['token'] },
        metadata: Metadata,
        call: ServerUnaryCall<any, any>,
    ) {
        this.tokenRepository.deleteOne(refreshToken).catch((err) => {
            throw new RpcException(err)
        })
        return { message: 'token deleted' }
    }

    private async getPairTokens(jwtPayload: JwtPayload) {
        let accessToken = (await this.jwtService.signAsync(
            jwtPayload,
        )) as JwtToken
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
