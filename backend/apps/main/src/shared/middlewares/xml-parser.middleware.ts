import {
    Injectable,
    NestMiddleware,
    PayloadTooLargeException,
} from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { XMLParser } from 'fast-xml-parser'

@Injectable()
export class XmlParserMiddleware implements NestMiddleware {
    private readonly parser = new XMLParser()

    async use(req: Request, res: Response, next: NextFunction) {
        const contentType = req['headers']['content-type']
        if (req.query.xml || contentType == 'application/xml') {
            req.body = await new Promise((resolve, reject) => {
                let xml: Buffer = Buffer.alloc(0)
                let maxSize = 128 << 10
                req.on('data', (data: Buffer) => {
                    xml = Buffer.concat([xml, data])
                    if (xml.length > maxSize)
                        throw new PayloadTooLargeException()
                })
                req.on('end', () => resolve(this.parser.parse(xml)))
            })
        }
        next()
    }
}
