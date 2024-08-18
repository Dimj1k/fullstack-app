import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PUBLIC_KEY } from '../../auth/auth.module'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from '../interfaces'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly jwtService: JwtService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: PUBLIC_KEY,
        })
    }

    validate({ userId, email, roles }: JwtPayload) {
        return { userId, email, roles }
    }
}
