import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'

@Injectable()
export class FileToBodyInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        let request = context.switchToHttp().getRequest<Request>()
        if (request.file) {
            request.body[request.file.fieldname] = request.file
            delete request.file
        }
        return next.handle()
    }
}
