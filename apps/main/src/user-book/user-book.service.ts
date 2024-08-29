import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { Book } from '../shared/entities/books'
import { UUID } from 'crypto'

@Injectable()
export class UserBookService {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
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
                await transactionalEntityManager.increment(
                    Book,
                    { bookId: book.bookId },
                    'likes',
                    1,
                )
            },
        )
        return { success: `${nameBook} добавлена` }
    }

    async getBooksUser(userId: UUID) {
        return this.bookRepository
            .createQueryBuilder('books')
            .select(['name_book', 'books.book_id', 'created_at'])
            .addSelect("images->'small'", 'image')
            .innerJoin('users_books', 'u_b', 'u_b.book_id = books.book_id')
            .where('user_id = :userId', { userId })
            .execute()
    }
}
