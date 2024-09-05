import { UUID } from 'crypto'

export enum GENDER {
    MALE,
    FEMALE,
    UNKNOWN,
}

export enum ROLE {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export interface JwtPayload {
    userId: UUID
    email: string
    roles: ROLE[]
}

export type JwtToken = `${string}.${string}.${string}`

export interface Tokens {
    accessToken: JwtToken
    refreshToken: {
        token: UUID
        expires: Date
    }
}
