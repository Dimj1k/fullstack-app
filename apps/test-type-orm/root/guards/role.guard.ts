import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLE } from '../entities/user/user.entity'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        )
        if (!requiredRoles) return true
        const { headers } = context.switchToHttp().getRequest()
        let bearerToken = headers.authorization as string | undefined
        if (!bearerToken) throw new UnauthorizedException()
        let [tokenType, token] = bearerToken.split(' ') as string[]
        if (!tokenType) throw new UnauthorizedException()
        let user = await this.jwtService.verifyAsync(token).catch((err) => {
            throw new UnauthorizedException('refresh-tokens')
        })
        // console.log(context.switchToHttp().getRequest().asadjikfqwjk)
        // console.log(user)
        // return true
        return requiredRoles.some((role) => user.roles.includes(role))
    }
}
