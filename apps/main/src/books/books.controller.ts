import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common'
import { CreateBookDto } from './dto'
import { UpdateBookDto } from './dto'
import { BooksService } from './books.service'
import { Request } from 'express'
import { JwtPayload } from '../interfaces'
import { ApiTags } from '@nestjs/swagger'
import { Beetween } from '../pipes'
import { AdminResources } from '../decorators'

type RequestWithUser = Request & { user: JwtPayload }

@ApiTags('books')
@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @AdminResources()
    @Post('/create')
    create(@Body() createBookDto: CreateBookDto) {
        return this.booksService.create(createBookDto)
    }

    @Get('/findAll')
    findAll(
        @Query('skip', Beetween(0)) skip: number,
        @Query('take', Beetween(0, 500)) take: number,
    ) {
        return this.booksService.findAll(skip, take)
    }

    @Get('/find/:nameBook')
    findOne(@Param('nameBook') nameBook: string) {
        return this.booksService.findOne(nameBook)
    }

    @AdminResources()
    @Patch('/update/:id')
    update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
        return this.booksService.update(id, updateBookDto)
    }

    @AdminResources()
    @Delete('/delete/:nameBook')
    remove(@Param('nameBook') nameBook: string) {
        return this.booksService.remove(nameBook)
    }
}
