import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const GetCookie = createParamDecorator(
    (key: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest() as Request
        return key in request.cookies ? request.cookies[key] : undefined
    },
)
