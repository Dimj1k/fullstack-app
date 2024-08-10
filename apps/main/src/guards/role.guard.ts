import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    UseFilters,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLE } from '../entities/user'
import { ROLES_KEY } from '../decorators'
import { JsonWebTokenError, JwtService } from '@nestjs/jwt'
import { RoleExceptionFilter } from '../filters'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly jwtService: JwtService,
    ) {}

    @UseFilters(RoleExceptionFilter)
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        )
        if (!requiredRoles) return true
        const request = context.switchToHttp().getRequest()
        let bearerToken = request.headers.authorization as string | undefined
        if (!bearerToken) throw new UnauthorizedException()
        let [tokenType, token] = bearerToken.split(' ') as string[]
        if (!tokenType) throw new UnauthorizedException()
        let user = await this.jwtService.verifyAsync(token).catch((err) => {
            throw new UnauthorizedException(err)
        })
        request.user = user
        let roles = user.roles
        // console.log(context.switchToHttp().getRequest().asadjikfqwjk)
        // console.log(user)
        // return true
        return requiredRoles.some((role) => roles.includes(role))
    }
}
