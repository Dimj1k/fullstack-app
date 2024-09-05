import { Module } from '@nestjs/common'
import { UserBookController } from './user-book.controller'
import { UserBookService } from './user-book.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Book } from '../shared/entities/books'

@Module({
    imports: [TypeOrmModule.forFeature([Book])],
    controllers: [UserBookController],
    providers: [UserBookService],
    exports: [],
})
export class UserBookModule {}
