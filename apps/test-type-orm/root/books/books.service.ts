import { ConflictException, Injectable } from '@nestjs/common'
import { CreateBookDto } from './dto/create-book.dto'
import { UpdateBookDto } from './dto/update-book.dto'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { Book } from '../entities/books/book.entity'
import { User } from '../entities/user/user.entity'

@Injectable()
export class BooksService {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(createBookDto: CreateBookDto) {
        let foundedBook = await this.bookRepository.findOneBy({
            nameBook: createBookDto.nameBook,
        })
        if (foundedBook) throw new ConflictException()
        let newBook = this.bookRepository.create(createBookDto)
        newBook.users = [
            await this.userRepository.findOneBy({
                id: '7162236d-4e14-4c0c-9b4b-cfd07612b86a',
            }),
        ]
        this.bookRepository.save(newBook)
        return newBook
    }

    async findAll(skip: number = 0, limit: number = 20) {
        return this.bookRepository.find({
            select: ['bookId', 'nameBook', 'createdAt'],
            skip,
            take: limit,
        })
    }

    async addBook(userId: string, nameBook: string) {
        let book = await this.bookRepository.findOneBy({ nameBook })
        await this.dataSource.transaction(
            async (transactionalEntityManager: EntityManager) => {
                await transactionalEntityManager.insert('users_books', {
                    user_id: userId,
                    book_id: book.bookId,
                })
            },
        )
        return { success: `${nameBook} добавлена` }
    }

    findOne(id: string) {
        return this.bookRepository.findOneBy({ bookId: id })
    }

    update(id: string, updateBooksDto: UpdateBookDto) {
        return this.bookRepository.update({ bookId: id }, updateBooksDto)
    }

    remove(id: string) {
        return this.bookRepository.delete({ bookId: id })
    }
}
