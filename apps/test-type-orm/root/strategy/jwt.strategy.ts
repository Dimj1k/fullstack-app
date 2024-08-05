import {
    Injectable,
    NestMiddleware,
    UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PUBLIC_KEY } from '../auth/auth.module'
import { JwtService } from '@nestjs/jwt'
import { Request, Response } from 'express'

@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}

    async use(
        req: Request & { user: object },
        res: Response,
        next: (error?: Error | any) => void,
    ) {
        let [typeToken, token] = req.headers.authorization
        if (!typeToken) throw new UnauthorizedException()
        req.user = await this.jwtService.verifyAsync(token)
        next()
    }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly jwtService: JwtService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: PUBLIC_KEY,
        })
    }

    validate(payload: any) {
        return payload
    }
}
