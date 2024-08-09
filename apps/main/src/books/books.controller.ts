import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import { CreateBookDto } from './dto/create-book.dto'
import { UpdateBookDto } from './dto/update-book.dto'
import { BooksService } from './books.service'
import { JwtGuard } from '../guards/jwt.guard'
import { Request } from 'express'
import { JwtPayload } from '../interfaces/jwt-controller.interface'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Beetween } from '../pipes/beetween.pipe'
import { AdminResources } from '../decorators/admin-resource.decorator'
import { UserResources } from '../decorators/user-resource.decorator'

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

    @UserResources()
    @Get('/getOwnedBooks')
    getOwnedBooks(@Req() request: RequestWithUser) {
        let user = request.user
        return this.booksService.getBooksUser(user.userId)
    }

    @UserResources()
    @Post('/addToYourself/:nameBook')
    addToYourself(
        @Param('nameBook') nameBook: string,
        @Req() request: RequestWithUser,
    ) {
        let user = request.user
        return this.booksService.addToYourself(user.userId, nameBook)
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
