import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { CreateBookDto } from './dto/create-book.dto'
import { UpdateBookDto } from './dto/update-book.dto'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Like, Repository } from 'typeorm'
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
        this.bookRepository.insert(newBook)
        return newBook
    }

    async findAll(skip: number = 0, take: number = 20) {
        return this.bookRepository.find({
            select: ['bookId', 'nameBook', 'createdAt'],
            skip,
            take,
        })
    }

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
    }

    findOne(nameBook: string) {
        return this.bookRepository.findOneBy({ nameBook: Like(`${nameBook}%`) })
    }

    update(id: string, updateBooksDto: UpdateBookDto) {
        return this.bookRepository.update({ bookId: id }, updateBooksDto)
    }

    remove(nameBook: string) {
        return this.bookRepository.delete({ nameBook })
    }
}
