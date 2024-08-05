import { Module } from '@nestjs/common'
import { BooksService } from './books.service'
import { BooksController } from './books.controller'
import { JwtMiddleware, JwtStrategy } from '../strategy/jwt.strategy'

@Module({
    imports: [],
    controllers: [BooksController],
    providers: [BooksService, JwtStrategy],
    exports: [],
})
export class BooksModule {}
