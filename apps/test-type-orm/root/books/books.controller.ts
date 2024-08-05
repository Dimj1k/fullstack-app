import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'
import { CreateBookDto } from './dto/create-book.dto'
import { UpdateBookDto } from './dto/update-book.dto'
import { BooksService } from './books.service'
import { Roles } from '../decorators/roles.decorator'
import { ROLE } from '../entities/user/user.entity'
import { RolesGuard } from '../guards/role.guard'
import { JwtGuard } from '../guards/jwt.guard'
import { Request } from 'express'
import { JwtPayload } from '../interfaces/jwt-controller.interface'
import { FindAllBooksDto } from './dto/find-all-books.dto'

@UsePipes(new ValidationPipe())
@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @Post('/create')
    create(@Body() createBooksDto: CreateBookDto) {
        return this.booksService.create(createBooksDto)
    }

    @Get('/find')
    findAll(@Body() { skip, limit }: FindAllBooksDto) {
        return this.booksService.findAll(skip, limit)
    }

    @Get('/find/:nameBook')
    findOne(@Param('nameBook') nameBook: string) {
        return this.booksService.findOne(nameBook)
    }

    @UseGuards(JwtGuard)
    @Post('/addBook/:nameBook')
    addBook(
        @Param('nameBook') nameBook: string,
        @Req() request: Request & { user: JwtPayload },
    ) {
        let user = request.user
        return this.booksService.addBook(user.userId, nameBook)
    }

    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @Patch('/update/:id')
    update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
        return this.booksService.update(id, updateBookDto)
    }

    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @Delete('/delete/:id')
    remove(@Param('id') id: string) {
        return this.booksService.remove(id)
    }
}
