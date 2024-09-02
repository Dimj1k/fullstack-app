import { Module } from '@nestjs/common'
import { BooksService } from './books.service'
import { BooksController } from './books.controller'
import { JwtStrategy } from '../shared/strategies'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Book } from '../shared/entities/books'
import { User } from '../shared/entities/user'
import { uploadDir } from '../shared/constants'
import { MulterModule } from '@nestjs/platform-express'
import { randomUUID } from 'crypto'
import { ensureDir } from 'fs-extra'
import { diskStorage, memoryStorage } from 'multer'
import { join } from 'path'
import { format } from 'date-fns'
import { Genre } from '../shared/entities/genres'
import { GenreController, GenreService } from './genres'

@Module({
    imports: [
        TypeOrmModule.forFeature([Book, Genre]),
        MulterModule.register({
            dest: uploadDir,
            fileFilter: (req: Request, file: Express.Multer.File, cb) => {
                file.originalname = randomUUID()
                return cb(null, file.mimetype.includes('image'))
            },
            limits: { fileSize: 25 << 20 },
            // storage: memoryStorage(),
            storage: diskStorage({
                destination: uploadDir,
                filename: async (req, file, cb) => {
                    let dateFolder = format(new Date(), 'dd-MM-yyyy')
                    return ensureDir(join(uploadDir, dateFolder)).then(() =>
                        cb(
                            null,
                            join(
                                dateFolder,
                                `${Date.now()}-${file.originalname}`,
                            ),
                        ),
                    )
                },
            }),
        }),
    ],
    controllers: [BooksController, GenreController],
    providers: [BooksService, GenreService, JwtStrategy],
    exports: [],
})
export class BooksModule {}
