import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { Book } from '../entities/books'
import { User } from '../entities/user'

@Injectable()
export class UserBookService {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async addToYourself(userId: string, nameBook: string) {
        let book = await this.bookRepository.findOneBy({ nameBook })
        if (!book) throw new NotFoundException()
        await this.dataSource.transaction(
            'READ COMMITTED',
            async (transactionalEntityManager: EntityManager) => {
                await transactionalEntityManager.insert('users_books', {
                    user_id: userId,
                    book_id: book.bookId,
                })
            },
        )
        return { success: `${nameBook} добавлена` }
    }

    async getBooksUser(userId: string) {
        return this.userRepository
            .findOne({
                where: { id: userId },
                relations: ['books'],
            })
            .then((user) => user.books)
            .catch((err) => new NotFoundException(err))
    }
}
