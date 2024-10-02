import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PUBLIC_KEY } from '../../auth/auth.module'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from '../interfaces'
import { UUID } from 'node:crypto'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly jwtService: JwtService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: PUBLIC_KEY,
        })
    }

    validate({
        sub,
        email,
        roles,
    }: Omit<JwtPayload, 'userId'> & { sub: UUID }) {
        return { sub, email, roles }
    }
}
