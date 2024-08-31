import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { XMLParser } from 'fast-xml-parser'

@Injectable()
export class XmlParserMiddleware implements NestMiddleware {
    private readonly parser = new XMLParser()

    async use(req: Request, res: Response, next: NextFunction) {
        let contentType = req.headers['content-type']
        if (contentType && contentType.includes('xml')) {
            req.body = await new Promise((resolve, reject) => {
                let body = {}
                req.on('data', (data: Buffer) => {
                    body = { ...body, ...this.parser.parse(data) }
                })
                req.on('end', () => resolve(body))
            })
        }
        next()
    }
}
