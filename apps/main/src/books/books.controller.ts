import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common'
import { CreateBookDto } from './dto'
import { UpdateBookDto } from './dto'
import { BooksService } from './books.service'
import { ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Beetween, UuidPipe } from '../shared/pipes'
import { AdminResources } from '../shared/decorators'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileToBodyInterceptor } from '../shared/interceptors'
import { ArrayPipe } from '../shared/pipes/is-array.pipe'
import { Request } from 'express'

@ApiTags('books')
@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @AdminResources()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'), FileToBodyInterceptor)
    @Post('/create')
    create(@Body() createBookDto: CreateBookDto) {
        return this.booksService.create(createBookDto)
    }

    @ApiQuery({ name: 'genre', required: false })
    @Get('/find-all')
    findAll(
        @Query('skip', Beetween(0)) skip: number,
        @Query('take', Beetween(0, 500)) take: number,
        @Query('genre', ArrayPipe) genres: string[],
    ) {
        return this.booksService.findAll(skip, take, genres)
    }

    @Get('/get-one/:nameBook')
    findOne(@Param('nameBook') nameBook: string) {
        return this.booksService.getOne(nameBook)
    }

    @AdminResources()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'), FileToBodyInterceptor)
    @Patch('/update/:id')
    update(
        @Param('id', UuidPipe) id: string,
        @Body() updateBookDto: UpdateBookDto,
    ) {
        if (!Object.keys(updateBookDto).length)
            throw new BadRequestException('Пустые данные')
        return this.booksService.update(id, updateBookDto)
    }

    @AdminResources()
    @Delete('/delete/:bookId')
    remove(@Param('bookId', UuidPipe) bookId: string) {
        return this.booksService.remove(bookId)
    }
}
