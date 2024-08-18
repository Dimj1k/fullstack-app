import { Module } from '@nestjs/common'
import { BooksService } from './books.service'
import { BooksController } from './books.controller'
import { JwtStrategy } from '../shared/strategies'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Book } from '../shared/entities/books'
import { User } from '../shared/entities/user'

@Module({
    imports: [TypeOrmModule.forFeature([Book, User])],
    controllers: [BooksController],
    providers: [BooksService, JwtStrategy],
    exports: [],
})
export class BooksModule {}
