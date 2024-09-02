import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { XMLBuilder } from 'fast-xml-parser'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class XmlBuilderInterceptor implements NestInterceptor {
    private readonly xmlBuilder = new XMLBuilder()

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>()
        const isXml =
            request['headers']['content-type'] == 'application/xml' ||
            request.query.xml
        const response = context.switchToHttp().getResponse<Response>()
        if (isXml)
            response.header('Content-Type', 'application/xml; charset=utf-8')
        return next
            .handle()
            .pipe(map((res) => (isXml ? this.xmlBuilder.build(res) : res)))
    }
}
