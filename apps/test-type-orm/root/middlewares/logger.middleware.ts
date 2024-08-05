import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('logger')

    use(req: Request, res: Response, next: NextFunction) {
        // @ts-ignore
        // req.asadjikfqwjk = 3
        this.logger.log(req.body)
        next()
    }
}
