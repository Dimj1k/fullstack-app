import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info) {
        if (err || !user) {
            throw err || new UnauthorizedException()
        }
        return user
    }
}
