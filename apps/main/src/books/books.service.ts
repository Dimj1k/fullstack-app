import {
    BadRequestException,
    ConflictException,
    Injectable,
} from '@nestjs/common'
import { CreateBookDto, UpdateBookDto } from './dto'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Like, Repository } from 'typeorm'
import { Book } from '../shared/entities/books'
import { FilesService } from '../files'
import { diff } from '../shared/utils'
import { sleep } from '../../test/utils'

@Injectable()
export class BooksService {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
        private readonly fileService: FilesService,
    ) {}

    async create({ image, ...book }: CreateBookDto) {
        let foundedBook = await this.bookRepository.findOneBy({
            nameBook: book.nameBook,
        })
        if (foundedBook) throw new BadRequestException()
        let images = await this.fileService.convertImageToWebp(image, {
            small: { height: 300, width: 200 },
            big: { height: 600, width: 400 },
        })
        let newBook = this.bookRepository.create({ ...book, images })
        await this.bookRepository.insert(newBook)
        return newBook
    }

    async findAll(skip: number = 0, take: number = 20, genres: string[] = []) {
        return this.bookRepository
            .createQueryBuilder()
            .select(['name_book', 'book_id', 'created_at', 'likes', 'genres'])
            .addSelect("images->'small'", 'image')
            .where('genres @> :genres::varchar(63)[]', { genres })
            .take(take)
            .skip(skip)
            .execute()
    }

    async getOne(nameBook: string) {
        return this.bookRepository
            .createQueryBuilder()
            .select("images->'big'", 'image')
            .addSelect([
                'name_book',
                'book_id',
                'created_at',
                'description',
                'likes',
                'genres',
            ])
            .where('name_book = :nameBook', { nameBook })
            .getRawOne()
    }

    async update(bookId: string, { image, ...book }: UpdateBookDto) {
        return this.dataSource.transaction(
            async (transactionalEntityManager) => {
                let images = await this.fileService.convertImageToWebp(image, {
                    small: { height: 300, width: 200 },
                    big: { height: 600, width: 400 },
                })
                let foundedBook = await transactionalEntityManager
                    .createQueryBuilder(Book, 'books')
                    .useTransaction(true)
                    .setLock('pessimistic_write')
                    .where('book_id = :bookId', { bookId })
                    .getOne()
                    .catch((err) => {
                        throw new ConflictException(err)
                    })
                let updBook = this.bookRepository.create({
                    bookId,
                    ...book,
                    images,
                })
                let differences = await diff(updBook, foundedBook)
                if (!Object.keys(differences).length)
                    throw new BadRequestException('Вы ничего не меняете')
                return await transactionalEntityManager
                    .createQueryBuilder(Book, 'books')
                    .where('book_id = :bookId', { bookId })
                    .update()
                    .set(differences)
                    .returning('*')
                    .execute()
                    .then((v) => v.raw[0])
                    .catch((err) => {
                        throw new BadRequestException(err)
                    })
            },
        )
    }

    remove(bookId: string) {
        return this.bookRepository.delete({ bookId })
    }
}
