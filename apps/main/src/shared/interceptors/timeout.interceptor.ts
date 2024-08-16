import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    RequestTimeoutException,
} from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Observable, throwError, TimeoutError } from 'rxjs'
import { catchError, timeout } from 'rxjs/operators'

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            timeout(5000),
            catchError((err: Error) => {
                if (err instanceof TimeoutError) {
                    return throwError(() => new RequestTimeoutException(err))
                }
                return throwError(() =>
                    err.name == 'Error' ? new RpcException(err) : err,
                )
            }),
        )
    }
}
