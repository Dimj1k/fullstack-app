import { UUID } from 'crypto'
import { ROLE } from '../auth'
import { IsArray, IsString } from 'class-validator'

export class JwtPayloadDto {
    @IsString()
    userId: UUID

    @IsString()
    email: string

    @IsArray()
    roles: ROLE[]
}

export type JwtToken = `${string}.${string}.${string}`

export class RefreshTokenDto {
    @IsString()
    token: UUID
}

export class TokenWithJwtDto {
    @IsString()
    userId: UUID

    @IsString()
    email: string

    @IsArray()
    roles: ROLE[]

    @IsString()
    token: UUID
}
