import { ConflictException, Injectable } from '@nestjs/common'
import { CreateBookDto, UpdateBookDto } from './dto'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Like, Repository } from 'typeorm'
import { Book } from '../shared/entities/books'
import { User } from '../shared/entities/user'

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
