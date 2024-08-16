import { Module } from '@nestjs/common'
import { UserBookController } from './user-book.controller'
import { UserBookService } from './user-book.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Book } from '../shared/entities/books'
import { User } from '../shared/entities/user'

@Module({
    imports: [TypeOrmModule.forFeature([User, Book])],
    controllers: [UserBookController],
    providers: [UserBookService],
    exports: [],
})
export class UserBookModule {}
