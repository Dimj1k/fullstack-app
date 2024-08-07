import { Metadata } from '@grpc/grpc-js'
import { Observable } from 'rxjs'
import { ROLE } from '../entities/user/user.entity'
import { UUID } from 'crypto'

export interface JwtPayload {
    userId: string
    email: string
    roles: ROLE[]
}

type JwtToken = `${string}.${string}.${string}`

export interface Tokens {
    accessToken: JwtToken
    refreshToken: {
        token: UUID
        expires: Date
    }
}

export interface JwtController {
    createTokens(
        payload: JwtPayload,
        metadata?: Metadata,
        callback?: Function,
    ): Observable<Tokens>

    refreshTokens(
        payloadToken: { token: Tokens['refreshToken']['token'] } & JwtPayload,
        metadata?: Metadata,
        callback?: Function,
    ): Observable<Tokens>

    checkToken(
        refreshToken: { token: Tokens['refreshToken']['token'] },
        metadata?: Metadata,
        callback?: Function,
    ): Observable<{ userId: UUID } | null>

    deleteTokens(
        refreshToken: { token: Tokens['refreshToken']['token'] },
        metadata?: Metadata,
        callback?: Function,
    ): Observable<void>
}
